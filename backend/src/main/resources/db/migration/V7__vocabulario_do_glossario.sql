-- Alinha o esquema a `documentos/glossario.md` e a `documentos/mer-der.md`.
--
-- Duas coisas, e só estas duas:
--
-- 1. O vocabulário do glossário: campeonato passa a ser competicao, time passa
--    a ser equipe, jogadores passa a ser atleta.
-- 2. A convenção de chave estrangeira do MER — `<entidade>_id`, uniforme.
--    Hoje o esquema tem `id_campeonato` em um lugar, `arbitro_id` em outro e
--    `team_id` em inglês num terceiro. O MER documentado usa `<entidade>_id`
--    em todas as suas chaves, então é para lá que o esquema converge, em vez
--    de inventar uma terceira convenção.
--
-- O que NÃO está aqui: as colunas que divergem do MER por outro motivo
-- (`fase.tipo_fase` contra `formato`, `partida.enum_fase_partida`, que o MER
-- não tem porque o formato vive na fase). Essas são convergência de modelo,
-- não de nome, e pertencem às fases 2 e 3 do backlog junto com `evento`,
-- `escalacao` e as máquinas de estado.
--
-- São só renomes: nenhum dado é recriado nem movido. `alter table rename`
-- preserva conteúdo, chaves e referências; o que os renomes não carregam é o
-- nome de sequência e de índice, por isso os dois vêm explicitamente no fim.

-- ---------------------------------------------------------------- competicao

alter table campeonato rename to competicao;
alter table campeonato_modalidades rename to competicao_modalidade;
alter table campeonato_times rename to competicao_equipe;

alter table competicao rename column id_administracao to administracao_id;

alter table competicao_modalidade rename column campeonato_id to competicao_id;

alter table competicao_equipe rename column campeonato_id to competicao_id;
alter table competicao_equipe rename column team_id to equipe_id;

-- --------------------------------------------------------------------- equipe

alter table "time" rename to equipe;
alter table equipe rename column id_modalidade to modalidade_id;
alter table equipe rename column id_federacao to federacao_id;

-- --------------------------------------------------------------------- atleta

alter table jogadores rename to atleta;
alter table atleta rename column id_time to equipe_id;
alter table atleta rename column id_modalidade to modalidade_id;

alter table team_players rename to equipe_atleta;
alter table equipe_atleta rename column team_id to equipe_id;
alter table equipe_atleta rename column player_id to atleta_id;

-- A contagem é de atletas em quadra: `jogador` é a palavra que sai.
alter table modalidade rename column jogadores_em_quadra to atletas_em_quadra;

-- ----------------------------------------------------------------------- fase

alter table fase rename column id_campeonato to competicao_id;
alter table fase rename column id_fase_sucessora to fase_sucessora_id;

alter table valor_atributo_fase rename column id_fase to fase_id;
alter table valor_atributo_fase rename column id_atributo to atributo_id;

-- -------------------------------------------------------------------- partida

alter table partida rename column id_time_mandante to equipe_mandante_id;
alter table partida rename column id_time_visitante to equipe_visitante_id;
alter table partida rename column id_vencedor to equipe_vencedora_id;
alter table partida rename column id_campeonato to competicao_id;
alter table partida rename column id_fase to fase_id;
alter table partida rename column id_tabela to tabela_id;

-- O placar não é gol em basquete nem em vôlei. `placar_` é o nome do MER, e
-- passa a ser o mesmo nos dois lugares que guardam placar.
alter table partida rename column resultado_mandante to placar_mandante;
alter table partida rename column resultado_visitante to placar_visitante;

-- --------------------------------------------------------------------- tabela

alter table tabela rename column id_campeonato to competicao_id;

-- --------------------------------------------------------------------- sancao

alter table sancao rename column id_campeonato to competicao_id;

alter table sancao_jogador rename to sancao_atleta;
alter table sancao_atleta rename column id_sancao to sancao_id;
alter table sancao_atleta rename column id_jogador to atleta_id;
alter table sancao_atleta rename column id_partida to partida_id;
-- `excao` era erro de digitação de exceção.
alter table sancao_atleta rename column excao to excecao;

-- --------------------------------------------------------------------- sumula

-- Tabela de coleção no singular, como as outras associativas do esquema.
alter table sumula_ocorrencias rename to sumula_ocorrencia;

alter table sumula rename column gols_mandante to placar_mandante;
alter table sumula rename column gols_visitante to placar_visitante;
-- `observacoes_relatas` era erro de digitação de relatadas.
alter table sumula rename column observacoes_relatas to observacoes_relatadas;

-- ---------------------------------------------------------------- sequências

-- `bigserial` nomeia a sequência pela tabela, e o renome da tabela não a
-- acompanha. O gerador de dados de teste chama `setval` por nome, então elas
-- precisam vir também.

alter sequence campeonato_id_seq rename to competicao_id_seq;
alter sequence time_id_seq rename to equipe_id_seq;
alter sequence jogadores_id_seq rename to atleta_id_seq;
alter sequence sancao_jogador_id_seq rename to sancao_atleta_id_seq;

-- -------------------------------------------------------------------- índices

alter index idx_campeonato_administracao rename to idx_competicao_administracao;
alter index idx_fase_campeonato rename to idx_fase_competicao;
alter index idx_jogadores_cpf rename to idx_atleta_cpf;
alter index idx_jogadores_time rename to idx_atleta_equipe;
alter index idx_partida_campeonato rename to idx_partida_competicao;
alter index idx_sancao_campeonato rename to idx_sancao_competicao;
alter index idx_sancao_jogador_jogador rename to idx_sancao_atleta_atleta;
