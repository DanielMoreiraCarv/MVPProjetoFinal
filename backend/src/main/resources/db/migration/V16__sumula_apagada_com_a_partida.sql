-- A súmula some junto com a partida, pelo banco.
--
-- Até aqui quem fazia isso era a cascata do JPA, a partir de um
-- @OneToOne(mappedBy) em Partida. Esse lado inverso é sempre carregado na
-- hora, e listar N partidas custava N consultas extras. O mapeamento saiu de
-- Partida; a regra de "apagou a partida, apagou a súmula" passa para o banco.
-- evento_sumula já tinha on delete cascade (V11); sumula_ocorrencia não.

do $$
declare
    restricao text;
begin
    select conname into restricao
      from pg_constraint
     where conrelid = 'sumula'::regclass and contype = 'f'
       and confrelid = 'partida'::regclass;
    execute format('alter table sumula drop constraint %I', restricao);

    select conname into restricao
      from pg_constraint
     where conrelid = 'sumula_ocorrencia'::regclass and contype = 'f'
       and confrelid = 'sumula'::regclass;
    execute format('alter table sumula_ocorrencia drop constraint %I', restricao);
end $$;

alter table sumula
    add constraint sumula_partida_id_fkey
    foreign key (partida_id) references partida (id) on delete cascade;

alter table sumula_ocorrencia
    add constraint sumula_ocorrencia_sumula_id_fkey
    foreign key (sumula_id) references sumula (id) on delete cascade;
