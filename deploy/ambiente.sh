#!/usr/bin/env bash
# Sobe o sistema completo — Postgres, API e front — em um pod do podman.
#
#   ./deploy/ambiente.sh subir      constrói as imagens e sobe tudo
#   ./deploy/ambiente.sh derrubar   para o pod (os dados do banco ficam)
#   ./deploy/ambiente.sh reiniciar  derruba e sobe de novo
#   ./deploy/ambiente.sh status     mostra o que está no ar
#   ./deploy/ambiente.sh logs [api|front|postgres]
#   ./deploy/ambiente.sh dados      recarrega o conjunto de dados de teste
#   ./deploy/ambiente.sh limpar     derruba e APAGA o volume do banco
#
# subir aceita:
#   --sem-build    reaproveita as imagens já construídas
#   --sem-dados    não carrega o conjunto de teste
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
POD="tcc"
VOLUME="tcc-postgres"
MANIFESTO="$RAIZ/deploy/desenvolvimento.yaml"
PORTA_BANCO=5433
PORTA_API=8080
PORTA_FRONT=3000

verde () { printf '\033[32m%s\033[0m\n' "$*"; }
aviso () { printf '\033[33m%s\033[0m\n' "$*"; }
erro  () { printf '\033[31m%s\033[0m\n' "$*" >&2; }

garantir_podman () {
    if ! command -v podman >/dev/null; then
        erro "podman não encontrado no PATH."
        erro "Instalação: https://podman.io/docs/installation"
        exit 1
    fi

    if podman info >/dev/null 2>&1; then
        return
    fi

    # Em macOS e Windows o podman roda numa máquina virtual que cai sozinha;
    # no Linux não existe máquina e este comando falha, sem efeito colateral.
    podman machine start >/dev/null 2>&1 || true

    if podman info >/dev/null 2>&1; then
        aviso "→ máquina do podman reiniciada"
        return
    fi

    # Em vez de adivinhar a causa, mostra o que o próprio podman diz.
    erro "não foi possível falar com o podman:"
    erro ""
    # O || true é necessário: podman info sai diferente de zero aqui, e com
    # pipefail a própria mensagem de erro derrubaria o script antes do exit.
    podman info 2>&1 | sed 's/^/  /' >&2 || true
    erro ""
    erro "Instalação e configuração: https://podman.io/docs/installation"
    exit 1
}

# Containers deste ambiente. O pod só-de-banco (deploy/postgres-local.yaml)
# publica a mesma porta e NÃO está aqui de propósito: rodar os dois ao mesmo
# tempo é justamente o conflito a detectar.
NOSSOS_CONTAINERS="$POD-postgres $POD-api $POD-front"

dono_da_porta () {
    # Procura tanto containers quanto processos do host: o caso comum é um
    # 'mvn spring-boot:run' ou 'yarn start' esquecido rodando fora do pod.
    local porta="$1"

    podman ps --format '{{.Names}} {{.Ports}}' 2>/dev/null \
        | grep ":$porta->" \
        | awk '{print $1}' \
        | grep -v -- '-infra$' \
        | while read -r nome; do
              case " $NOSSOS_CONTAINERS " in
                  *" $nome "*) ;;
                  *) echo "container $nome" ;;
              esac
          done || true

    # Processos do host, quando há lsof. gvproxy é quem publica as portas dos
    # containers do podman e já foi coberto acima. Sem lsof a checagem apenas
    # não encontra nada: quem reclama então é o próprio podman, ao subir.
    if command -v lsof >/dev/null; then
        lsof -nP -iTCP:"$porta" -sTCP:LISTEN 2>/dev/null \
            | awk 'NR > 1 && $1 != "gvproxy" { print "processo " $1 " (pid " $2 ")" }' \
            | sort -u || true
    fi
}

verificar_portas () {
    local problema=0

    for par in "$PORTA_BANCO:banco" "$PORTA_API:API" "$PORTA_FRONT:front"; do
        local porta="${par%%:*}" rotulo="${par##*:}"
        local dono
        dono="$(dono_da_porta "$porta" || true)"

        if [ -n "$dono" ]; then
            erro "porta $porta ($rotulo) ocupada por: $(echo "$dono" | tr '\n' ',' | sed 's/,$//')"
            problema=1
        fi
    done

    if [ "$problema" -eq 1 ]; then
        erro ""
        erro "Libere as portas antes de subir. Causas comuns:"
        erro "  - pod só-de-banco:  podman play kube --down deploy/postgres-local.yaml"
        erro "  - API pela IDE ou mvn spring-boot:run"
        erro "  - front por yarn dev/start"
        exit 1
    fi
}

construir () {
    verde "→ construindo imagem da API"
    podman build -q -t tcc-api:dev -f "$RAIZ/backend/Dockerfile.vercel" "$RAIZ/backend" >/dev/null

    verde "→ construindo imagem do front"
    podman build -q -t tcc-front:dev -f "$RAIZ/frontend/Dockerfile.vercel" "$RAIZ/frontend" >/dev/null
}

esperar () {
    local nome="$1" url="$2" tentativas="${3:-60}"
    printf '→ aguardando %s' "$nome"

    for _ in $(seq 1 "$tentativas"); do
        if curl -sf -o /dev/null "$url"; then
            printf ' pronto\n'
            return 0
        fi
        printf '.'
        sleep 2
    done

    printf '\n'
    erro "$nome não respondeu em $((tentativas * 2))s."
    [ "$nome" = "API" ] && diagnosticar || erro "Veja: ./deploy/ambiente.sh logs"
    return 1
}

# A causa mais comum de a API não subir é trocar para uma branch com outro
# conjunto de migrações: o Flyway recusa aplicar uma versão menor do que a que
# já está no banco, e o erro dele não diz que a saída é apagar o volume.
#
# A comparação é feita contra o banco, e não procurando no log da API: um
# container que reinicia em ciclo às vezes não tem o erro registrado no
# instante em que seria lido.
diagnosticar () {
    local aplicadas nesta_branch pendente_antiga=""

    aplicadas="$(versoes_aplicadas)"
    nesta_branch="$(versoes_da_branch)"

    if [ -z "$aplicadas" ] || [ -z "$nesta_branch" ]; then
        erro "Veja: ./deploy/ambiente.sh logs"
        return
    fi

    # Versão que esta branch tem, o banco não aplicou, e que é menor do que a
    # maior já aplicada: exatamente o que o Flyway recusa.
    local maior_aplicada
    maior_aplicada="$(echo "$aplicadas" | tr ',' '\n' | sort -n | tail -1)"

    for versao in $(echo "$nesta_branch" | tr ',' ' '); do
        if ! echo ",$aplicadas," | grep -q ",$versao," && [ "$versao" -lt "$maior_aplicada" ]; then
            pendente_antiga="$versao"
            break
        fi
    done

    if [ -n "$pendente_antiga" ]; then
        erro ""
        erro "O banco tem um conjunto de migrações diferente do que esta branch espera."
        erro "Normal depois de trocar de stack — o Flyway recusa aplicar a V$pendente_antiga"
        erro "porque a V$maior_aplicada já está no banco."
        erro ""
        erro "  aplicadas no banco: $aplicadas"
        erro "  nesta branch:       $nesta_branch"
        erro ""
        erro "Para recomeçar do zero:"
        erro "  ./deploy/ambiente.sh limpar && ./deploy/ambiente.sh subir"
        return
    fi

    erro "Veja: ./deploy/ambiente.sh logs"
}

versoes_aplicadas () {
    podman exec "$POD-postgres" psql -U tcc -d tcc -tAc \
        "select string_agg(version, ',' order by version::numeric) from flyway_schema_history where success;" \
        2>/dev/null | tr -d ' \r'
}

versoes_da_branch () {
    ls "$RAIZ/backend/src/main/resources/db/migration" 2>/dev/null \
        | sed -n 's/^V\([0-9]*\)__.*/\1/p' | sort -n | paste -sd, -
}

subir () {
    local build=1 dados=1
    for argumento in "$@"; do
        case "$argumento" in
            --sem-build) build=0 ;;
            --sem-dados) dados=0 ;;
            *) erro "opção desconhecida: $argumento"; exit 1 ;;
        esac
    done

    # A ordem dos três passos abaixo importa, e cada um depende do anterior:
    #
    #   1. garantir_podman  — sem podman no ar, nenhum comando adiante funciona.
    #   2. --down           — derruba um ambiente anterior. Precisa vir DEPOIS
    #                         do passo 1 (usa podman) e ANTES do passo 3: um pod
    #                         nosso já rodando ocupa legitimamente as três
    #                         portas, e seria acusado de conflito consigo mesmo.
    #   3. verificar_portas — o que sobrar ocupando uma porta agora é de fato
    #                         de outra pessoa: outro container, ou a API/front
    #                         rodando pela IDE.
    garantir_podman
    podman play kube --down "$MANIFESTO" >/dev/null 2>&1 || true
    verificar_portas
    [ "$build" -eq 1 ] && construir

    verde "→ subindo o pod"
    if ! podman play kube "$MANIFESTO" >/dev/null; then
        erro ""
        erro "o pod não subiu. O erro do podman está acima."
        erro "Causa mais comum: porta $PORTA_BANCO, $PORTA_API ou $PORTA_FRONT ocupada"
        erro "por um processo que esta checagem não enxerga."
        exit 1
    fi

    esperar "API" "http://localhost:8080/api/v1/modalidade"
    esperar "front" "http://localhost:3000/administracoes" 40

    if [ "$dados" -eq 1 ]; then
        verde "→ carregando dados de teste"
        "$RAIZ/deploy/carregar-dados-de-teste.sh"
    fi

    echo
    verde "ambiente no ar"
    echo "  front  http://localhost:3000"
    echo "  API    http://localhost:8080/api/v1/modalidade"
    echo "  banco  localhost:$PORTA_BANCO  (usuário e senha: tcc)"
}

derrubar () {
    garantir_podman
    podman play kube --down "$MANIFESTO" >/dev/null 2>&1 || true
    verde "pod derrubado. O volume do banco foi mantido."
}

status () {
    garantir_podman
    podman ps --filter "name=^$POD-" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
}

logs () {
    garantir_podman
    local alvo="${1:-api}"
    podman logs -f "$POD-$alvo"
}

dados () {
    garantir_podman
    "$RAIZ/deploy/carregar-dados-de-teste.sh"
}

limpar () {
    garantir_podman

    # Os dois manifestos compartilham o volume. Um container parado do pod
    # só-de-banco basta para o volume não sair, então ambos precisam cair.
    podman play kube --down "$MANIFESTO" >/dev/null 2>&1 || true
    podman play kube --down "$RAIZ/deploy/postgres-local.yaml" >/dev/null 2>&1 || true
    sleep 2

    if podman volume rm "$VOLUME" >/dev/null 2>&1; then
        verde "volume do banco removido. O próximo 'subir' começa do zero."
        return
    fi

    if ! podman volume exists "$VOLUME" 2>/dev/null; then
        verde "volume do banco já não existia."
        return
    fi

    erro "não foi possível remover o volume $VOLUME:"
    podman volume rm "$VOLUME" 2>&1 | sed 's/^/  /' >&2 || true
    erro ""
    erro "Containers que ainda o referenciam:"
    podman ps -a --filter "volume=$VOLUME" --format '  {{.Names}} ({{.Status}})' >&2 || true
    exit 1
}

case "${1:-}" in
    subir)      shift; subir "$@" ;;
    derrubar)   derrubar ;;
    reiniciar)  derrubar; shift || true; subir "$@" ;;
    status)     status ;;
    logs)       shift || true; logs "$@" ;;
    dados)      dados ;;
    limpar)     limpar ;;
    *)
        awk 'NR > 1 && /^#/ { sub(/^# ?/, ""); print; next } NR > 1 { exit }' "${BASH_SOURCE[0]}"
        exit 1
        ;;
esac
