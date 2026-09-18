create table administracao (
    id          bigserial primary key,
    nome        varchar(180) not null,
    descricao   varchar(500)
);

alter table campeonato add column id_administracao bigint references administracao (id);

create index idx_campeonato_administracao on campeonato (id_administracao);
