-- Roda depois de toda migração bem-sucedida (callback do Flyway).
--
-- O histórico do Flyway também fica exposto pela API REST do Supabase, e
-- gravar nele bagunçaria as migrações. Ele não pode receber RLS dentro de uma
-- migração — o próprio Flyway o mantém travado —, então recebe aqui. Repetir
-- é inofensivo.
alter table if exists flyway_schema_history enable row level security;
