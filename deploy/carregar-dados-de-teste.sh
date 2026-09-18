#!/usr/bin/env bash
# Carrega o conjunto de dados de teste no Postgres local.
#
#   ./deploy/carregar-dados-de-teste.sh
#
# Apaga os dados existentes e recarrega. Só mexe no banco local — as variáveis
# apontam para o pod de desenvolvimento e não têm nada de produção.
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SQL="$RAIZ/backend/src/main/resources/db/seed/dados_de_teste.sql"
# O Postgres pode vir do pod completo (tcc-postgres) ou do pod só-de-banco
# (tcc-postgres-postgres). Usa o que estiver respondendo.
achar_container () {
    if [ -n "${PG_CONTAINER:-}" ]; then
        echo "$PG_CONTAINER"
        return
    fi

    for candidato in tcc-postgres tcc-postgres-postgres; do
        if podman exec "$candidato" pg_isready -U tcc -d tcc >/dev/null 2>&1; then
            echo "$candidato"
            return
        fi
    done
}

CONTAINER="$(achar_container)"

if [ -z "$CONTAINER" ] || ! podman exec "$CONTAINER" pg_isready -U tcc -d tcc >/dev/null 2>&1; then
    echo "Postgres não está no ar. Suba com:"
    echo "  ./deploy/ambiente.sh subir           (sistema completo)"
    echo "  podman play kube deploy/postgres-local.yaml   (só o banco)"
    exit 1
fi

echo "→ aplicando migrações"
( cd "$RAIZ/backend" && mvn -B -q flyway:migrate \
    -Dflyway.url=jdbc:postgresql://localhost:5433/tcc \
    -Dflyway.user=tcc -Dflyway.password=tcc )

echo "→ carregando dados de teste"
podman exec -i "$CONTAINER" psql -U tcc -d tcc -v ON_ERROR_STOP=1 -q < "$SQL"

podman exec "$CONTAINER" psql -U tcc -d tcc -tAc "
select 'administrações: ' || (select count(*) from administracao)
    || ' | competições: ' || (select count(*) from campeonato)
    || ' | times: '       || (select count(*) from time)
    || ' | atletas: '     || (select count(*) from jogadores)
    || ' | partidas: '    || (select count(*) from partida);"
