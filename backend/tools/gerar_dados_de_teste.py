#!/usr/bin/env python3
"""Converte os mocks do front-end em um script SQL de carga.

O objetivo é que o ambiente local tenha exatamente o mesmo conjunto de dados
que as telas usavam quando eram mockadas, para comparar comportamento antigo
e novo em cima do mesmo cenário.

    python3 backend/tools/gerar_dados_de_teste.py

Regenera backend/src/main/resources/db/seed/dados_de_teste.sql.

A entrada vive em `dados-de-origem/`, ao lado deste arquivo, e continua em
inglês (`Team`, `players`, `homeTeam`): é o formato em que foi escrita e é o que
as expressões daqui leem. A saída segue o vocabulário do glossário — competição,
equipe, atleta.

Esses arquivos moravam em `frontend/src/features/administracoes/mocks/`, onde
alimentavam as telas antes de elas lerem da API. Vieram para cá quando o front
passou ao vocabulário do glossário: manter uma cópia dos tipos em inglês dentro
do front só para eles seria carregar dois vocabulários no mesmo projeto.
"""
import json
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
ORIGEM = Path(__file__).resolve().parent / "dados-de-origem"
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
    return (ORIGEM / caminho).read_text()


def aspas(valor):
    if valor is None:
        return "null"
    return "'" + str(valor).replace("'", "''") + "'"


def ler_equipes():
    """teams.ts: const tN: Team = { id, name, players: [ p("tNpM", nome, numero, idade) ] }"""
    conteudo = texto("teams.ts")
    equipes, atletas = [], []

    for bloco in re.finditer(
        r'const t(\d+): Team = \{\s*id:\s*(\d+),\s*name:\s*"([^"]+)",.*?players:\s*\[(.*?)\]\s*\}',
        conteudo, re.S,
    ):
        id_equipe, nome_equipe, corpo = int(bloco.group(2)), bloco.group(3), bloco.group(4)
        equipes.append((id_equipe, nome_equipe))

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
                "equipe_id": id_equipe,
            })

    return equipes, atletas


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
            "primeira_equipe": int(bloco.group(5)) + 1,
            "ultima_equipe": int(bloco.group(6)),
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

        resultado_mandante = campo(linha, "homeScore", r"(\d+)")
        resultado_visitante = campo(linha, "awayScore", r"(\d+)")
        # stageName aparece como s.Quartas ou s["Semi-finais"]
        estagio = campo(linha, "stageName", r's\.(\w+)') or campo(linha, "stageName", r's\["([^"]+)"\]')

        partidas.append({
            "id": int(campo(linha, "id", r"(\d+)")),
            "mandante": campo(linha, "homeTeam"),
            "visitante": campo(linha, "awayTeam"),
            "placar_mandante": int(resultado_mandante) if resultado_mandante else 0,
            "placar_visitante": int(resultado_visitante) if resultado_visitante else 0,
            "vencedor": campo(linha, "winner"),
            "competicao": campo(linha, "competitionName"),
            "estagio": estagio,
            "realizada": campo(linha, "finished", r"(true|false)") == "true",
        })

    return partidas


BAIRROS = [
    "Aldeota", "Meireles", "Benfica", "Messejana", "Parangaba", "Montese", "Fátima", "Papicu",
    "Varjota", "Mucuripe", "Cocó", "Dionísio Torres", "Joaquim Távora", "Bela Vista", "Pici",
    "Antônio Bezerra", "Barra do Ceará", "Jacarecanga", "Centro", "Iracema", "Serrinha",
    "Itaperi", "Cambeba", "Edson Queiroz", "Sapiranga", "Lagoa Redonda", "Passaré", "Mondubim",
    "Maraponga", "Conjunto Ceará", "Jangurussu", "Henrique Jorge",
]
PRENOMES = [
    "Ana", "Bruno", "Caio", "Davi", "Enzo", "Felipe", "Gabriel", "Heitor", "Igor", "João",
    "Kauã", "Lucas", "Marcos", "Nicolas", "Otávio", "Pedro", "Rafael", "Samuel", "Thiago",
    "Vitor", "Wesley", "Yuri", "Arthur", "Bernardo", "Cauã", "Diego", "Eduardo", "Francisco",
]
SOBRENOMES = [
    "Almeida", "Barbosa", "Cavalcante", "Dias", "Esteves", "Farias", "Gomes", "Holanda",
    "Lima", "Macedo", "Nogueira", "Oliveira", "Pinheiro", "Queiroz", "Rocha", "Sampaio",
    "Teixeira", "Uchoa", "Vasconcelos", "Xavier",
]
ATLETAS_POR_EQUIPE = 16  # onze titulares e cinco no banco


def laboratorio_de_fases(primeiro_id_equipe, id_competicao, id_administracao):
    """Uma competição para montar fases do zero: 32 equipes de futebol de
    campo inscritas, em rascunho, sem fase nem partida.

    As competições vindas dos mocks já têm partidas sem fase — o estado que o
    sistema de antes produzia — e por isso não servem para conferir se a
    primeira rodada de uma estrutura nova sai certa. Esta não vem dos mocks: é
    gerada aqui, de forma determinística, para o arquivo não mudar a cada
    execução.
    """
    administracao = {
        "id": id_administracao,
        "nome": "Laboratório de fases",
        "descricao": "Competições sem estrutura, para montar sequências de fases e conferir os confrontos gerados.",
    }
    competicao = {
        "id": id_competicao,
        "nome": "Copa Laboratório - 32 equipes",
        "descricao": "32 equipes de futebol de campo inscritas, sem fases nem partidas.",
        "categoria": "Masculino",
    }

    equipes, atletas = [], []
    for i, bairro in enumerate(BAIRROS):
        id_equipe = primeiro_id_equipe + i
        equipes.append((id_equipe, f"EC {bairro}"))
        for numero in range(1, ATLETAS_POR_EQUIPE + 1):
            k = i * ATLETAS_POR_EQUIPE + numero
            atletas.append({
                "id": id_equipe * 1000 + numero,
                "nome": f"{PRENOMES[k % len(PRENOMES)]} {SOBRENOMES[(k * 7) % len(SOBRENOMES)]}",
                "numero": numero,
                "idade": 18 + (k * 5) % 18,
                "equipe_id": id_equipe,
            })

    return administracao, competicao, equipes, atletas


def lote(linhas, por_linha=4):
    """Agrupa tuplas de VALUES para o arquivo não virar uma linha por registro."""
    return ",\n".join(
        "    " + ", ".join(linhas[i:i + por_linha])
        for i in range(0, len(linhas), por_linha)
    )


def gerar():
    equipes, atletas = ler_equipes()
    competicoes = ler_competicoes()
    administracoes = ler_administracoes()
    partidas = ler_partidas()

    nome_para_equipe = {nome: id_equipe for id_equipe, nome in equipes}

    laboratorio, copa, equipes_da_copa, atletas_da_copa = laboratorio_de_fases(
        primeiro_id_equipe=max(id_equipe for id_equipe, _ in equipes) + 1,
        id_competicao=max(c["id"] for c in competicoes) + 1,
        id_administracao=max(a["id"] for a in administracoes) + 1,
    )
    equipes = equipes + equipes_da_copa
    atletas = atletas + atletas_da_copa
    nome_para_competicao = {c["nome"]: c["id"] for c in competicoes}

    partes = [f"""-- Dados de teste, gerados por backend/tools/gerar_dados_de_teste.py
-- a partir dos mocks do front-end. Não editar à mão: regere o arquivo.
--
-- Carregar:  ./deploy/carregar-dados-de-teste.sh
--
-- Só para ambiente local. Não é migração e nunca roda em produção.
--
-- Conteúdo: {len(administracoes) + 1} administrações, {len(competicoes) + 1} competições,
-- {len(equipes)} equipes, {len(atletas)} atletas e {len(partidas)} partidas.

begin;

delete from sumula_ocorrencia;
delete from sumula;
delete from partida;
delete from competicao_equipe;
delete from sancao_atleta;
delete from atleta;
delete from equipe;
delete from valor_atributo_fase;
delete from fase;
delete from sancao;
delete from competicao_modalidade;
delete from competicao;
delete from administracao;
"""]

    # Administração
    linhas = [f"({a['id']}, {aspas(a['nome'])}, {aspas(a['descricao'])})" for a in administracoes]
    linhas.append(f"({laboratorio['id']}, {aspas(laboratorio['nome'])}, {aspas(laboratorio['descricao'])})")
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
        "insert into competicao (id, nome, descricao, categoria, administracao_id, mata_mata) values\n"
        + lote(linhas, 1) + ";\n"
    )

    # Em rascunho: é o único estado em que a Estrutura deixa montar as fases.
    partes.append(
        "insert into competicao (id, nome, descricao, categoria, administracao_id, mata_mata, estado) values\n"
        f"    ({copa['id']}, {aspas(copa['nome'])}, {aspas(copa['descricao'])}, "
        f"{aspas(copa['categoria'])}, {laboratorio['id']}, false, 'RASCUNHO');\n"
    )

    # O catálogo normalmente é populado no boot da aplicação. O seed insere por
    # conta própria para não depender de a aplicação ter subido antes.
    partes.append("""insert into modalidade (codigo, nome, atletas_em_quadra, ativo) values
    ('FUTEBOL_DE_CAMPO', 'Futebol de campo', 11, true),
    ('FUTSAL', 'Futsal', 5, true),
    ('SOCIETY', 'Society', 7, true),
    ('VOLEIBOL', 'Voleibol', 6, true),
    ('BASQUETE', 'Basquete', 5, true),
    ('HANDEBOL', 'Handebol', 7, true)
on conflict (codigo) do nothing;
""")

    partes.append("""insert into competicao_modalidade (competicao_id, modalidade_id)
select c.id, m.id from competicao c
cross join modalidade m
where m.codigo = 'FUTEBOL_DE_CAMPO';
""")

    # Equipe
    linhas = [
        f"({id_equipe}, {aspas(nome)}, (select id from modalidade where codigo = 'FUTEBOL_DE_CAMPO'))"
        for id_equipe, nome in equipes
    ]
    partes.append("insert into equipe (id, nome, modalidade_id) values\n" + lote(linhas, 2) + ";\n")

    # Atleta
    linhas = [
        f"({a['id']}, {aspas(a['nome'])}, {a['idade']}, {a['numero']}, {a['equipe_id']}, false)"
        for a in atletas
    ]
    partes.append(
        "insert into atleta (id, nome, idade, num_camisa, equipe_id, expulso) values\n"
        + lote(linhas, 3) + ";\n"
    )

    # Inscrição da equipe na competição
    linhas = [
        f"({c['id']}, {t})"
        for c in competicoes
        for t in range(c["primeira_equipe"], c["ultima_equipe"] + 1)
    ] + [f"({copa['id']}, {id_equipe})" for id_equipe, _ in equipes_da_copa]
    partes.append(
        "insert into competicao_equipe (competicao_id, equipe_id) values\n" + lote(linhas, 8) + ";\n"
    )

    # Partida
    linhas, ignoradas = [], 0
    for p in partidas:
        mandante = nome_para_equipe.get(p["mandante"])
        visitante = nome_para_equipe.get(p["visitante"])
        competicao = nome_para_competicao.get(p["competicao"])

        # Partidas de fase futura ainda não têm as duas equipes definidas nos
        # mocks — vêm como "Vencedor Partida 11". Ficam de fora.
        if not (mandante and visitante and competicao):
            ignoradas += 1
            continue

        vencedor = nome_para_equipe.get(p["vencedor"]) if p["vencedor"] else None
        formato = "PONTOS_CORRIDOS" if p["estagio"] == "PontosCorridos" else "ELIMINATORIA"
        linhas.append(
            f"({p['id']}, {mandante}, {visitante}, {competicao}, "
            f"{p['placar_mandante']}, {p['placar_visitante']}, "
            f"{vencedor or 'null'}, {str(p['realizada']).lower()}, {aspas(formato)})"
        )

    partes.append(
        f"-- {ignoradas} partidas dos mocks ficaram de fora: são confrontos de fase\n"
        f"-- futura, cujas equipes ainda dependem do vencedor de uma partida anterior.\n"
        "insert into partida (id, equipe_mandante_id, equipe_visitante_id, competicao_id,\n"
        "                     placar_mandante, placar_visitante, equipe_vencedora_id,\n"
        "                     realizada, enum_fase_partida) values\n"
        + lote(linhas, 1) + ";\n"
    )

    partes.append("""-- bigserial: sem isto o próximo insert da aplicação colide com os ids fixos.
do $$
begin
    perform setval('administracao_id_seq', (select coalesce(max(id), 1) from administracao));
    perform setval('competicao_id_seq', (select coalesce(max(id), 1) from competicao));
    perform setval('equipe_id_seq', (select coalesce(max(id), 1) from equipe));
    perform setval('atleta_id_seq', (select coalesce(max(id), 1) from atleta));
    perform setval('partida_id_seq', (select coalesce(max(id), 1) from partida));
end $$;

commit;
""")

    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text("\n".join(partes))

    print(f"{len(administracoes) + 1} administrações")
    print(f"{len(competicoes) + 1} competições ({copa['nome']}: {len(equipes_da_copa)} equipes, sem fases)")
    print(f"{len(equipes)} equipes")
    print(f"{len(atletas)} atletas")
    print(f"{len(partidas) - ignoradas} partidas ({ignoradas} ignoradas)")
    print(f"-> {SAIDA.relative_to(RAIZ)}")


if __name__ == "__main__":
    gerar()
