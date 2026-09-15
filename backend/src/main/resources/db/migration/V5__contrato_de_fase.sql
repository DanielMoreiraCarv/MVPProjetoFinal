-- Atributos que cada TIPO de fase aceita. Declarados pela estratégia no
-- arranque; a tabela é o reflexo dessa declaração.
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

-- O valor de um atributo numa INSTÂNCIA de fase.
create table valor_atributo_fase (
    id           bigserial primary key,
    id_fase      bigint not null references fase (id),
    id_atributo  bigint not null references atributo_fase (id),
    valor        varchar(200),
    constraint valor_atributo_fase_unico unique (id_fase, id_atributo)
);

-- Sem este vínculo a fase não consegue reler as partidas que ela mesma gerou,
-- e a classificação não teria de onde ser derivada.
alter table partida add column id_fase bigint references fase (id);

create index idx_valor_atributo_fase on valor_atributo_fase (id_fase);
create index idx_partida_fase on partida (id_fase);
