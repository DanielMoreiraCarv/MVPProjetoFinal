-- O elenco de uma equipe estava modelado duas vezes: pela coluna
-- `atleta.equipe_id` e pela associativa `equipe_atleta`.
--
-- As duas coincidiam porque o conjunto de dados de teste escrevia as duas, mas
-- nada garantia isso: `GET /equipe/{id}` lia a associativa e
-- `GET /atleta?idEquipe=` lia a coluna, então bastava uma escrita por um
-- caminho para as duas respostas discordarem sobre quem está na equipe.
--
-- Fica a coluna, que é o que o domínio diz hoje — um atleta pertence a uma
-- equipe (glossário §2.7) — e é o que a maior parte do código já lê.
--
-- Isto não é o modelo final. `documentos/mer-der.md` prevê `vinculo_atleta`,
-- que liga atleta, equipe e competição com número de camisa, posição e
-- período, e é o que permite o mesmo atleta ter elencos diferentes em
-- competições diferentes (RF45) e ser transferido (RF43). A associativa que
-- sai aqui não era isso: não tinha competição, nem número, nem período.

-- Nenhum registro se perde: a associativa não tem informação que a coluna já
-- não carregue. A verificação abaixo recusa a migração se houver vínculo só
-- na associativa, em vez de descartá-lo em silêncio.
do $$
declare
    orfaos integer;
begin
    select count(*) into orfaos
    from equipe_atleta ea
    left join atleta a on a.id = ea.atleta_id and a.equipe_id = ea.equipe_id
    where a.id is null;

    if orfaos > 0 then
        raise exception
            'equipe_atleta tem % vínculo(s) que não existem em atleta.equipe_id. '
            'Concilie antes de aplicar esta migração.', orfaos;
    end if;
end $$;

drop table equipe_atleta;

create index idx_atleta_equipe_nome on atleta (equipe_id, nome);
