-- Metadados que a fase grava ao gerar o confronto: em qual grupo ele acontece
-- e em qual rodada. Sem eles a classificação por grupo não teria como ser
-- derivada das partidas.
alter table partida add column grupo integer;
alter table partida add column rodada integer;

create index idx_partida_fase_grupo on partida (id_fase, grupo);
