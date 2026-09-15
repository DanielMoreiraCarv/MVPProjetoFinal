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
MANIFESTO="$RAIZ/deploy/desenvolvimento.yaml"
PORTA_BANCO=5433
PORTA_API=8080
PORTA_FRONT=3000

verde () { printf '\033[32m%s\033[0m\n' "$*"; }
aviso () { printf '\033[33m%s\033[0m\n' "$*"; }
erro  () { printf '\033[31m%s\033[0m\n' "$*" >&2; }

como_instalar_podman () {
    case "$(uname -s)" in
        Darwin)
            echo "  brew install podman"
            ;;
        Linux)
            if command -v apt-get >/dev/null; then
                echo "  sudo apt-get install podman"
            elif command -v dnf >/dev/null; then
                echo "  sudo dnf install podman"
            elif command -v pacman >/dev/null; then
                echo "  sudo pacman -S podman"
            else
                echo "  use o gerenciador de pacotes da sua distribuição"
            fi
            ;;
        MINGW*|MSYS*|CYGWIN*)
            echo "  winget install RedHat.Podman-Desktop"
            echo "  (no Windows, rode este script pelo WSL ou pelo Git Bash)"
            ;;
        *)
            echo "  veja https://podman.io/docs/installation"
            ;;
    esac
}

garantir_podman () {
    if ! command -v podman >/dev/null; then
        erro "podman não encontrado. Instale com:"
        como_instalar_podman >&2
        erro "Documentação: https://podman.io/docs/installation"
        exit 1
    fi

    if podman info >/dev/null 2>&1; then
        return
    fi

    # No Linux o podman fala direto com o kernel; a máquina virtual só existe
    # em macOS e Windows, e é ela que costuma cair sozinha.
    if [ "$(uname -s)" = "Linux" ]; then
        erro "não foi possível falar com o podman."
        erro "Verifique a instalação: podman info"
        exit 1
    fi

    aviso "→ máquina do podman parada, iniciando"
    podman machine start >/dev/null 2>&1 || {
        erro "não foi possível iniciar a máquina do podman."
        erro "Se for o primeiro uso nesta máquina:"
        erro "  podman machine init && podman machine start"
        exit 1
    }
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

    # Processos do host. gvproxy publica as portas dos containers do podman em
    # macOS e já foi coberto acima. lsof costuma existir em macOS; em Linux o
    # ss é mais comum.
    if command -v lsof >/dev/null; then
        lsof -nP -iTCP:"$porta" -sTCP:LISTEN 2>/dev/null \
            | awk 'NR > 1 && $1 != "gvproxy" { print "processo " $1 " (pid " $2 ")" }' \
            | sort -u || true
    elif command -v ss >/dev/null; then
        ss -lptnH "sport = :$porta" 2>/dev/null \
            | grep -oE 'users:\(\("[^"]+",pid=[0-9]+' \
            | sed 's/users:((\"/processo /; s/\",pid=/ (pid /; s/$/)/' \
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
    erro "$nome não respondeu em $((tentativas * 2))s. Veja: ./deploy/ambiente.sh logs"
    return 1
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
    podman play kube "$MANIFESTO" >/dev/null

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
    derrubar
    podman volume rm tcc-postgres >/dev/null 2>&1 || true
    verde "volume do banco removido. O próximo 'subir' começa do zero."
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
