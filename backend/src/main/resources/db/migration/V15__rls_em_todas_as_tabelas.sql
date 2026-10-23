-- Row level security em todas as tabelas.
--
-- No Supabase, toda tabela do schema public fica exposta também pela API REST
-- automática do próprio Supabase (PostgREST), não só pela nossa. Sem RLS,
-- quem tiver a chave pública do projeto lê e escreve direto nelas — inclusive
-- usuario, com os hashes de senha, e token_renovacao.
--
-- RLS ligada e nenhuma política: a API do Supabase não enxerga nada. O
-- backend conecta como dono das tabelas, e o dono não passa pelo RLS (sem
-- FORCE), então a aplicação segue igual. O esquema_completo.sql já fazia isso
-- para as tabelas até a V6; aqui vale para todas, inclusive as que vieram
-- depois.
--
-- Tabela nova também precisa: RlsEmTodasAsTabelasTest falha sem isso.

do $$
declare
    tabela record;
begin
    for tabela in
        select c.relname
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relkind = 'r'
          -- O histórico do Flyway fica travado pelo próprio Flyway durante a
          -- migração: ligar o RLS nele aqui esperaria para sempre. Quem liga é
          -- o callback afterMigrate.sql, depois que as migrações terminam.
          and c.relname <> 'flyway_schema_history'
    loop
        execute format('alter table public.%I enable row level security', tabela.relname);
    end loop;
end
$$;
