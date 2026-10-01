-- Esquema completo para criar o banco do zero no Supabase (SQL Editor).
--
-- Consolida as migrações V1 a V6 de backend/src/main/resources/db/migration.
-- A fonte de verdade continua sendo o Flyway: este script serve só para a
-- carga inicial manual. Mudanças de modelo vão em uma nova migração (V7__...),
-- nunca aqui.
--
-- No fim, registra um baseline na versão 6 no histórico do Flyway. Sem ele, o
-- `mvn flyway:migrate` do pipeline encontraria um esquema não vazio e sem
-- histórico, e recusaria rodar; com ele, o Flyway considera V1..V6 aplicadas
-- e passa a aplicar apenas da V7 em diante.
--
-- Roda em uma transação: se qualquer comando falhar, nada fica criado.

begin;

-- V1: esquema inicial -------------------------------------------------------

create table modalidade (
    id                  bigserial primary key,
    codigo              varchar(40) not null unique,
    nome                varchar(80) not null,
    jogadores_em_quadra integer     not null,
    ativo               boolean     not null default true
);

create table federacao (
    id             bigserial primary key,
    nome_federacao varchar(255)
);

create table arbitro (
    id                bigserial primary key,
    nome              varchar(255) not null,
    federacao         varchar(255),
    categoria         varchar(255),
    partidas_apitadas integer not null default 0
);

create table time (
    id            bigserial primary key,
    nome          varchar(255) not null,
    id_modalidade bigint references modalidade (id),
    id_federacao  bigint references federacao (id)
);

create table jogadores (
    id            bigserial primary key,
    nome          varchar(255) not null,
    idade         integer not null default 0,
    expulso       boolean,
    num_camisa    integer not null default 0,
    posicao       varchar(100),
    cpf           varchar(20),
    id_modalidade bigint references modalidade (id),
    gols          integer not null default 0,
    assistencias  integer not null default 0,
    cartoes       integer not null default 0,
    pontos        integer not null default 0,
    cestas        integer not null default 0
);

create table team_players (
    team_id   bigint not null references time (id),
    player_id bigint not null references jogadores (id),
    primary key (team_id, player_id)
);

create table campeonato (
    id        bigserial primary key,
    nome      varchar(255),
    mata_mata boolean not null default false
);

create table campeonato_modalidades (
    campeonato_id bigint not null references campeonato (id),
    modalidade_id bigint not null references modalidade (id),
    primary key (campeonato_id, modalidade_id)
);

create table campeonato_times (
    campeonato_id bigint not null references campeonato (id),
    team_id       bigint not null references time (id),
    primary key (campeonato_id, team_id)
);

create table tabela (
    id            bigserial primary key,
    id_campeonato bigint references campeonato (id)
);

create table partida (
    id                  bigserial primary key,
    id_time_mandante    bigint references time (id),
    id_time_visitante   bigint references time (id),
    id_campeonato       bigint references campeonato (id),
    id_tabela           bigint references tabela (id),
    id_vencedor         bigint references time (id),
    resultado_mandante  integer not null default 0,
    resultado_visitante integer not null default 0,
    realizada           boolean not null default false,
    enum_fase_partida   varchar(100),
    arbitro_id          bigint references arbitro (id),
    constraint partida_times_distintos check (
        id_time_mandante is null
        or id_time_visitante is null
        or id_time_mandante <> id_time_visitante
    )
);

create table sumula (
    id                   bigserial primary key,
    partida_id           bigint unique references partida (id),
    arbitro_id           bigint references arbitro (id),
    gols_mandante        integer not null default 0,
    gols_visitante       integer not null default 0,
    observacoes_relatas  varchar(255),
    data_fechamento      timestamp,
    assinada             boolean not null default false
);

create table sumula_ocorrencias (
    sumula_id  bigint not null references sumula (id),
    ocorrencia varchar(255)
);

create index idx_partida_campeonato on partida (id_campeonato);
create index idx_partida_tabela on partida (id_tabela);
create index idx_jogadores_cpf on jogadores (cpf);

-- V2: fase, sanção e vínculo do jogador -------------------------------------

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

alter table jogadores add column id_time bigint references time (id);

create index idx_fase_campeonato on fase (id_campeonato);
create index idx_sancao_campeonato on sancao (id_campeonato);
create index idx_sancao_jogador_jogador on sancao_jogador (id_jogador);
create index idx_jogadores_time on jogadores (id_time);

-- V3: administração ---------------------------------------------------------

create table administracao (
    id          bigserial primary key,
    nome        varchar(180) not null,
    descricao   varchar(500)
);

alter table campeonato add column id_administracao bigint references administracao (id);

create index idx_campeonato_administracao on campeonato (id_administracao);

-- V4: descrição e categoria da competição -----------------------------------

alter table campeonato add column descricao varchar(500);
alter table campeonato add column categoria varchar(20);

-- V5: contrato de fase ------------------------------------------------------

create table atributo_fase (
    id           bigserial primary key,
    tipo_fase    varchar(40)  not null,
    codigo       varchar(60)  not null,
    tipo_dado    varchar(20)  not null,
    obrigatorio  boolean      not null default false,
    valor_padrao varchar(200),
    descricao    varchar(300),
    constraint atributo_fase_unico unique (tipo_fase, codigo)
);

create table valor_atributo_fase (
    id           bigserial primary key,
    id_fase      bigint not null references fase (id),
    id_atributo  bigint not null references atributo_fase (id),
    valor        varchar(200),
    constraint valor_atributo_fase_unico unique (id_fase, id_atributo)
);

alter table partida add column id_fase bigint references fase (id);

create index idx_valor_atributo_fase on valor_atributo_fase (id_fase);
create index idx_partida_fase on partida (id_fase);

-- V6: grupo e rodada na partida ---------------------------------------------

alter table partida add column grupo integer;
alter table partida add column rodada integer;

create index idx_partida_fase_grupo on partida (id_fase, grupo);

-- Supabase: bloqueia a Data API (PostgREST) -----------------------------------
-- Tudo em `public` fica exposto pela API REST com a chave anon. Ligar RLS sem
-- nenhuma policy fecha esse acesso. A aplicação não é afetada: ela conecta por
-- JDBC com o usuário dono das tabelas, que não passa pelo RLS.

alter table modalidade             enable row level security;
alter table federacao              enable row level security;
alter table arbitro                enable row level security;
alter table time                   enable row level security;
alter table jogadores              enable row level security;
alter table team_players           enable row level security;
alter table campeonato             enable row level security;
alter table campeonato_modalidades enable row level security;
alter table campeonato_times       enable row level security;
alter table tabela                 enable row level security;
alter table partida                enable row level security;
alter table sumula                 enable row level security;
alter table sumula_ocorrencias     enable row level security;
alter table fase                   enable row level security;
alter table sancao                 enable row level security;
alter table sancao_jogador         enable row level security;
alter table administracao          enable row level security;
alter table atributo_fase          enable row level security;
alter table valor_atributo_fase    enable row level security;

-- Histórico do Flyway com baseline na versão 6 --------------------------------
-- Mesma estrutura que o Flyway cria. Migrações até a versão do baseline são
-- ignoradas; a próxima aplicada pelo pipeline será a V7.

create table flyway_schema_history (
    installed_rank integer       not null,
    version        varchar(50),
    description    varchar(200)  not null,
    type           varchar(20)   not null,
    script         varchar(1000) not null,
    checksum       integer,
    installed_by   varchar(100)  not null,
    installed_on   timestamp     not null default now(),
    execution_time integer       not null,
    success        boolean       not null,
    constraint flyway_schema_history_pk primary key (installed_rank)
);

create index flyway_schema_history_s_idx on flyway_schema_history (success);

alter table flyway_schema_history enable row level security;

insert into flyway_schema_history
    (installed_rank, version, description, type, script, checksum, installed_by, execution_time, success)
values
    (1, '6', '<< Flyway Baseline >>', 'BASELINE', '<< Flyway Baseline >>', null, current_user, 0, true);

commit;
