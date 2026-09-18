-- Tabelas das entidades introduzidas pelas PRs de fase e sanções, que não
-- vieram acompanhadas de migração. Sem elas o ddl-auto=validate derruba o boot.

create table fase (
    id                       bigserial primary key,
    nome                     varchar(255),
    ordem                    integer,
    tipo_fase                varchar(100),
    id_campeonato            bigint references campeonato (id),
    quantidade_classificados integer,
    id_fase_sucessora        bigint unique references fase (id)
);

create table sancao (
    id                         bigserial primary key,
    quantidade_partidas_padrao integer,
    tipo_esporte               varchar(50),
    id_campeonato              bigint references campeonato (id)
);

create table sancao_jogador (
    id                  bigserial primary key,
    id_sancao           bigint references sancao (id),
    excao               boolean,
    partidas_excecao    integer,
    id_jogador          bigint references jogadores (id),
    id_partida          bigint references partida (id),
    partidas_restantes  integer,
    ativa               boolean,
    justificativa       varchar(255)
);

-- Jogadores.time mapeia ID_TIME desde a criação da entidade, mas a coluna
-- nunca existiu: o elenco era mantido só pela associativa team_players.
alter table jogadores add column id_time bigint references time (id);

create index idx_fase_campeonato on fase (id_campeonato);
create index idx_sancao_campeonato on sancao (id_campeonato);
create index idx_sancao_jogador_jogador on sancao_jogador (id_jogador);
create index idx_jogadores_time on jogadores (id_time);
