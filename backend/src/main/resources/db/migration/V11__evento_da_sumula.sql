-- O que cada atleta fez na partida, um registro por acontecimento.
--
-- Até aqui a súmula guardava ocorrência como texto livre ("9' - Gol de João"),
-- que não sustenta artilharia, contagem de cartão nem suspensão (RF73, RF76,
-- RF105). Sem minuto de jogo: num campeonato amador o que se anota é o
-- acontecimento, e registrado_em é a hora em que entrou na súmula.

alter table sumula add column modo varchar(20) not null default 'COMPLETA';
alter table sumula add constraint sumula_modo_valido check (modo in ('SIMPLIFICADA', 'COMPLETA'));

create table evento_sumula (
    id            bigserial primary key,
    sumula_id     bigint      not null references sumula (id) on delete cascade,
    atleta_id     bigint      not null references atleta (id),
    -- A equipe por quem o atleta jogou: ele pode trocar de equipe depois, e o
    -- gol continua sendo de quem ele defendia naquela partida.
    equipe_id     bigint      not null references equipe (id),
    tipo          varchar(30) not null,
    -- Gerado pelo sistema (o vermelho do segundo amarelo), e não lançado.
    automatico    boolean     not null default false,
    registrado_em timestamptz not null default now(),
    constraint evento_sumula_tipo_valido check (tipo in (
        'GOL', 'GOL_CONTRA', 'CARTAO_AMARELO', 'CARTAO_VERMELHO_INDIRETO',
        'CARTAO_VERMELHO_DIRETO', 'FALTA_COMETIDA', 'FALTA_SOFRIDA'))
);

create index idx_evento_sumula_sumula on evento_sumula (sumula_id);
create index idx_evento_sumula_atleta on evento_sumula (atleta_id);
