-- Estado da competição (RF18).
--
-- Sem ele não há como esconder uma competição que ainda está sendo montada,
-- nem bloquear alteração em uma encerrada: toda competição existente é igual a
-- toda outra, e a lista mistura rascunho com o que está em disputa.
--
-- É também o que o construtor de competição precisa: a estrutura de fases só
-- pode ser mexida enquanto a competição está em RASCUNHO. Depois de publicada,
-- mudar a estrutura invalidaria confrontos já gerados e classificação já
-- calculada.
--
-- As existentes entram como EM_ANDAMENTO: elas já têm equipes inscritas e
-- partidas registradas, então não são rascunho. Marcar tudo como rascunho
-- esconderia dados reais.

alter table competicao add column estado varchar(20) not null default 'EM_ANDAMENTO';

alter table competicao add constraint competicao_estado_valido
    check (estado in ('RASCUNHO', 'EM_ANDAMENTO', 'ENCERRADA', 'CANCELADA'));

create index idx_competicao_estado on competicao (estado);
