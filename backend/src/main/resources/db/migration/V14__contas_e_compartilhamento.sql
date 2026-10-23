-- Cada conta cuida das próprias competições e as compartilha com quem quiser.
--
-- Quem participa de uma competição pode tudo dentro dela: não há níveis entre
-- participantes. Os cadastros que existem fora da competição — administração,
-- equipe, atleta, árbitro, federação — ganham um dono, e são vistos pelo dono
-- e por quem participa de uma competição em que eles aparecem.

create table competicao_participante (
    competicao_id bigint      not null references competicao (id) on delete cascade,
    usuario_id    bigint      not null references usuario (id) on delete cascade,
    criado_em     timestamptz not null default now(),
    primary key (competicao_id, usuario_id)
);

create index idx_competicao_participante_usuario on competicao_participante (usuario_id);

-- Convite para quem ainda não tem conta: vale pelo e-mail, e vira
-- participação quando a pessoa se cadastra com ele. Sem envio de e-mail —
-- quem convida avisa a pessoa por fora.
create table competicao_convite (
    id             bigserial    primary key,
    competicao_id  bigint       not null references competicao (id) on delete cascade,
    email          varchar(180) not null,
    convidado_por  bigint       references usuario (id) on delete set null,
    criado_em      timestamptz  not null default now()
);

create unique index uq_competicao_convite on competicao_convite (competicao_id, lower(email));
create index idx_competicao_convite_email on competicao_convite (lower(email));

-- Nulo é dado anterior às contas: só a administração da plataforma o vê.
alter table administracao add column dono_id bigint references usuario (id) on delete set null;
alter table federacao     add column dono_id bigint references usuario (id) on delete set null;
alter table arbitro       add column dono_id bigint references usuario (id) on delete set null;
alter table equipe        add column dono_id bigint references usuario (id) on delete set null;
alter table atleta        add column dono_id bigint references usuario (id) on delete set null;

create index idx_administracao_dono on administracao (dono_id);
create index idx_federacao_dono on federacao (dono_id);
create index idx_arbitro_dono on arbitro (dono_id);
create index idx_equipe_dono on equipe (dono_id);
create index idx_atleta_dono on atleta (dono_id);
