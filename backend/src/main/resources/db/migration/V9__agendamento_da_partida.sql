-- Data, hora e local da partida (RF58).
--
-- A tabela não tinha nenhum dos dois, então não havia o que ordenar nem o que
-- exibir num calendário: as telas mostravam a lista na ordem do id. Os
-- horários que existiam no conjunto de mocks se perderam na carga justamente
-- por não haver coluna para recebê-los.
--
-- `timestamptz` e não `timestamp`: o fuso faz parte do agendamento. Uma
-- partida marcada para 09:00 em Fortaleza é um instante, e guardar o relógio
-- de parede sem o fuso é o que transforma isso em ambiguidade na virada do
-- horário de verão ou quando alguém abre o sistema de outro estado.

alter table partida add column data_hora timestamptz;
alter table partida add column local varchar(180);

-- O calendário lê por competição e ordena por data.
create index idx_partida_competicao_data on partida (competicao_id, data_hora);
