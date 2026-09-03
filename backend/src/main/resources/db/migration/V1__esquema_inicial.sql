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
