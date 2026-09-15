#!/usr/bin/env python3
"""Converte os mocks do front-end em um script SQL de carga.

O objetivo é que o ambiente local tenha exatamente o mesmo conjunto de dados
que as telas usavam quando eram mockadas, para comparar comportamento antigo
e novo em cima do mesmo cenário.

    python3 backend/tools/gerar_dados_de_teste.py

Regenera backend/src/main/resources/db/seed/dados_de_teste.sql.
"""
import json
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
MOCKS = RAIZ / "frontend/src/features/administracoes/mocks"
SAIDA = RAIZ / "backend/src/main/resources/db/seed/dados_de_teste.sql"

CATEGORIA = {"Masculino": "Masculino", "Feminino": "Feminino"}
# O front nomeava as fases; o backend separa formato (EnumFasePartida) do
# estágio da eliminatória (EnumTipoFase).
FORMATO_DA_FASE = {
    "Pontos Corridos": "PONTOS_CORRIDOS",
    "Grupo": "GRUPOS",
}
ESTAGIO = {
    "16 de finais": "DEZESSEIS_AVOS_DE_FINAIS",
    "Oitavas": "OITAVAS",
    "Quartas": "QUARTAS",
    "Semi-finais": "SEMIS",
    "Final": "FINAL",
}


def texto(caminho):
    return (MOCKS / caminho).read_text()


def aspas(valor):
    if valor is None:
        return "null"
    return "'" + str(valor).replace("'", "''") + "'"


def ler_times():
    """teams.ts: const tN: Team = { id, name, players: [ p("tNpM", nome, numero, idade) ] }"""
    conteudo = texto("teams.ts")
    times, atletas = [], []

    for bloco in re.finditer(
        r'const t(\d+): Team = \{\s*id:\s*(\d+),\s*name:\s*"([^"]+)",.*?players:\s*\[(.*?)\]\s*\}',
        conteudo, re.S,
    ):
        id_time, nome_time, corpo = int(bloco.group(2)), bloco.group(3), bloco.group(4)
        times.append((id_time, nome_time))

        for atleta in re.finditer(
            r'p\(\s*"t(\d+)p(\d+)"\s*,\s*"([^"]+)"\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(true|false)\s*)?\)',
            corpo,
        ):
            t, m = int(atleta.group(1)), int(atleta.group(2))
            atletas.append({
                "id": t * 1000 + m,
                "nome": atleta.group(3),
                "numero": int(atleta.group(4)),
                "idade": int(atleta.group(5)),
                "id_time": id_time,
            })

    return times, atletas


def ler_competicoes():
    conteudo = texto("competitions.ts")
    competicoes = []

    for bloco in re.finditer(
        r'\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)",\s*description:\s*"([^"]*)",'
        r'.*?modality:\s*"([^"]+)",\s*teams:\s*mockTeams\.slice\((\d+),\s*(\d+)\)'
        r'(?:,\s*currentStage:\s*competitionStageNamesSchema\.enum\.(\w+))?',
        conteudo, re.S,
    ):
        competicoes.append({
            "id": int(bloco.group(1)),
            "nome": bloco.group(2),
            "descricao": bloco.group(3),
            "categoria": CATEGORIA.get(bloco.group(4), bloco.group(4)),
            "primeiro_time": int(bloco.group(5)) + 1,
            "ultimo_time": int(bloco.group(6)),
            "estagio": bloco.group(7),
        })

    return competicoes


def ler_administracoes():
    conteudo = texto("tournaments.ts")
    administracoes = []

    for bloco in re.finditer(
        r'\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)",\s*description:\s*"([^"]*)",'
        r'\s*competitions:\s*mockCompetitions\.slice\((\d+),\s*(\d+)\)',
        conteudo, re.S,
    ):
        administracoes.append({
            "id": int(bloco.group(1)),
            "nome": bloco.group(2),
            "descricao": bloco.group(3),
            "primeira_competicao": int(bloco.group(4)) + 1,
            "ultima_competicao": int(bloco.group(5)),
        })

    return administracoes


def ler_partidas():
    """Cada partida ocupa uma linha, mas a ordem dos campos varia e vários são
    opcionais. Por isso cada campo é extraído pelo próprio nome."""
    def campo(linha, nome, padrao=r'"([^"]*)"'):
        achado = re.search(rf"\b{nome}:\s*{padrao}", linha)
        return achado.group(1) if achado else None

    partidas = []
    for linha in texto("matches.ts").splitlines():
        if not re.search(r"\{\s*id:\s*\d+", linha):
            continue

        gols_mandante = campo(linha, "homeScore", r"(\d+)")
        gols_visitante = campo(linha, "awayScore", r"(\d+)")
        # stageName aparece como s.Quartas ou s["Semi-finais"]
        estagio = campo(linha, "stageName", r's\.(\w+)') or campo(linha, "stageName", r's\["([^"]+)"\]')

        partidas.append({
            "id": int(campo(linha, "id", r"(\d+)")),
            "mandante": campo(linha, "homeTeam"),
            "visitante": campo(linha, "awayTeam"),
            "gols_mandante": int(gols_mandante) if gols_mandante else 0,
            "gols_visitante": int(gols_visitante) if gols_visitante else 0,
            "vencedor": campo(linha, "winner"),
            "competicao": campo(linha, "competitionName"),
            "estagio": estagio,
            "realizada": campo(linha, "finished", r"(true|false)") == "true",
        })

    return partidas


def lote(linhas, por_linha=4):
    """Agrupa tuplas de VALUES para o arquivo não virar uma linha por registro."""
    return ",\n".join(
        "    " + ", ".join(linhas[i:i + por_linha])
        for i in range(0, len(linhas), por_linha)
    )


def gerar():
    times, atletas = ler_times()
    competicoes = ler_competicoes()
    administracoes = ler_administracoes()
    partidas = ler_partidas()

    nome_para_time = {nome: id_time for id_time, nome in times}
    nome_para_competicao = {c["nome"]: c["id"] for c in competicoes}

    partes = [f"""-- Dados de teste, gerados por backend/tools/gerar_dados_de_teste.py
-- a partir dos mocks do front-end. Não editar à mão: regere o arquivo.
--
-- Carregar:  ./deploy/carregar-dados-de-teste.sh
--
-- Só para ambiente local. Não é migração e nunca roda em produção.
--
-- Conteúdo: {len(administracoes)} administrações, {len(competicoes)} competições,
-- {len(times)} times, {len(atletas)} atletas e {len(partidas)} partidas.

begin;

delete from sumula_ocorrencias;
delete from sumula;
delete from partida;
delete from campeonato_times;
delete from team_players;
delete from sancao_jogador;
delete from jogadores;
delete from time;
delete from fase;
delete from sancao;
delete from campeonato_modalidades;
delete from campeonato;
delete from administracao;
"""]

    # Administração
    linhas = [f"({a['id']}, {aspas(a['nome'])}, {aspas(a['descricao'])})" for a in administracoes]
    partes.append("insert into administracao (id, nome, descricao) values\n" + lote(linhas, 1) + ";\n")

    # Competição — os mocks são todos de futebol de campo
    linhas = []
    for c in competicoes:
        adm = next(a["id"] for a in administracoes
                   if a["primeira_competicao"] <= c["id"] <= a["ultima_competicao"])
        mata_mata = "true" if c["estagio"] and c["estagio"] != "PontosCorridos" else "false"
        linhas.append(
            f"({c['id']}, {aspas(c['nome'])}, {aspas(c['descricao'])}, "
            f"{aspas(c['categoria'])}, {adm}, {mata_mata})"
        )
    partes.append(
        "insert into campeonato (id, nome, descricao, categoria, id_administracao, mata_mata) values\n"
        + lote(linhas, 1) + ";\n"
    )

    partes.append("""insert into campeonato_modalidades (campeonato_id, modalidade_id)
select c.id, m.id from campeonato c
cross join modalidade m
where m.codigo = 'FUTEBOL_DE_CAMPO';
""")

    # Time
    linhas = [
        f"({id_time}, {aspas(nome)}, (select id from modalidade where codigo = 'FUTEBOL_DE_CAMPO'))"
        for id_time, nome in times
    ]
    partes.append("insert into time (id, nome, id_modalidade) values\n" + lote(linhas, 2) + ";\n")

    # Atleta
    linhas = [
        f"({a['id']}, {aspas(a['nome'])}, {a['idade']}, {a['numero']}, {a['id_time']}, false)"
        for a in atletas
    ]
    partes.append(
        "insert into jogadores (id, nome, idade, num_camisa, id_time, expulso) values\n"
        + lote(linhas, 3) + ";\n"
    )

    partes.append("""insert into team_players (team_id, player_id)
select id_time, id from jogadores;
""")

    # Inscrição do time na competição
    linhas = [
        f"({c['id']}, {t})"
        for c in competicoes
        for t in range(c["primeiro_time"], c["ultimo_time"] + 1)
    ]
    partes.append("insert into campeonato_times (campeonato_id, team_id) values\n" + lote(linhas, 8) + ";\n")

    # Partida
    linhas, ignoradas = [], 0
    for p in partidas:
        mandante = nome_para_time.get(p["mandante"])
        visitante = nome_para_time.get(p["visitante"])
        competicao = nome_para_competicao.get(p["competicao"])

        # Partidas de fase futura ainda não têm os dois times definidos nos
        # mocks — vêm como "Vencedor Partida 11". Ficam de fora.
        if not (mandante and visitante and competicao):
            ignoradas += 1
            continue

        vencedor = nome_para_time.get(p["vencedor"]) if p["vencedor"] else None
        formato = "PONTOS_CORRIDOS" if p["estagio"] == "PontosCorridos" else "ELIMINATORIA"
        linhas.append(
            f"({p['id']}, {mandante}, {visitante}, {competicao}, "
            f"{p['gols_mandante']}, {p['gols_visitante']}, "
            f"{vencedor or 'null'}, {str(p['realizada']).lower()}, {aspas(formato)})"
        )

    partes.append(
        f"-- {ignoradas} partidas dos mocks ficaram de fora: são confrontos de fase\n"
        f"-- futura, cujos times ainda dependem do vencedor de uma partida anterior.\n"
        "insert into partida (id, id_time_mandante, id_time_visitante, id_campeonato,\n"
        "                     resultado_mandante, resultado_visitante, id_vencedor,\n"
        "                     realizada, enum_fase_partida) values\n"
        + lote(linhas, 1) + ";\n"
    )

    partes.append("""-- bigserial: sem isto o próximo insert da aplicação colide com os ids fixos.
do $$
begin
    perform setval('administracao_id_seq', (select coalesce(max(id), 1) from administracao));
    perform setval('campeonato_id_seq', (select coalesce(max(id), 1) from campeonato));
    perform setval('time_id_seq', (select coalesce(max(id), 1) from time));
    perform setval('jogadores_id_seq', (select coalesce(max(id), 1) from jogadores));
    perform setval('partida_id_seq', (select coalesce(max(id), 1) from partida));
end $$;

commit;
""")

    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text("\n".join(partes))

    print(f"{len(administracoes)} administrações")
    print(f"{len(competicoes)} competições")
    print(f"{len(times)} times")
    print(f"{len(atletas)} atletas")
    print(f"{len(partidas) - ignoradas} partidas ({ignoradas} ignoradas)")
    print(f"-> {SAIDA.relative_to(RAIZ)}")


if __name__ == "__main__":
    gerar()
