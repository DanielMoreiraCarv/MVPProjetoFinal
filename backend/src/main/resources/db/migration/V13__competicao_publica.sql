-- Acompanhamento público da competição.
--
-- A organização decide se a competição pode ser vista por quem recebe o link —
-- torcida, atletas, pais — sem login e sem poder alterar nada. Nasce privada:
-- abrir ao público é uma escolha, e uma competição em montagem não deve
-- aparecer para ninguém por acidente.

alter table competicao add column publica boolean not null default false;
