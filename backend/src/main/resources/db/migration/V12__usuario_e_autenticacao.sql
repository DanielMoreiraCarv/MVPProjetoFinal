-- Identidade e acesso (mer-der.md §3.1): quem entra na plataforma, com que
-- papel, e as sessões abertas por ele.
--
-- A senha nunca é guardada: senha_hash é BCrypt, que já carrega o sal e o custo
-- dentro do próprio valor. O e-mail é guardado em minúsculas e único sem
-- distinção de caixa, porque "Ana@x.com" e "ana@x.com" são a mesma pessoa.

create table usuario (
    id                bigserial    primary key,
    nome              varchar(180) not null,
    email             varchar(180) not null,
    senha_hash        varchar(255) not null,
    -- Desativação em vez de exclusão: o usuário pode ser autor de súmula e
    -- auditoria, e apagá-lo levaria a autoria junto.
    ativo             boolean      not null default true,
    criado_em         timestamptz  not null default now(),
    -- Todo token emitido antes disto deixa de valer. É o que faz trocar a
    -- senha derrubar as sessões abertas em outros aparelhos.
    senha_alterada_em timestamptz  not null default now(),
    -- Contra tentativa de senha por força bruta: depois de N erros seguidos o
    -- login fica fechado até bloqueado_ate.
    tentativas_falhas integer      not null default 0,
    bloqueado_ate     timestamptz
);

create unique index uq_usuario_email on usuario (lower(email));

create table papel (
    id        bigserial    primary key,
    codigo    varchar(40)  not null unique,
    descricao varchar(120) not null
);

insert into papel (codigo, descricao) values
    ('ADMINISTRADOR',        'Administra a plataforma e os usuários'),
    ('ORGANIZADOR',          'Organiza competições de uma administração'),
    ('MESARIO',              'Preenche a súmula durante a partida'),
    ('ARBITRO',              'Apita e assina a súmula'),
    ('REPRESENTANTE_EQUIPE', 'Responde por uma equipe inscrita'),
    ('PUBLICO',              'Acompanha competições, sem editar');

-- O papel vale no escopo de uma administração: a mesma pessoa pode organizar
-- uma liga e apitar em outra. administracao_id nulo é papel global.
--
-- O MER pede PK composta, mas Postgres não aceita coluna nula em chave
-- primária; a unicidade fica no índice, com o nulo tratado como um valor.
create table usuario_papel (
    id               bigserial primary key,
    usuario_id       bigint    not null references usuario (id) on delete cascade,
    papel_id         bigint    not null references papel (id),
    administracao_id bigint    references administracao (id) on delete cascade
);

create unique index uq_usuario_papel
    on usuario_papel (usuario_id, papel_id, coalesce(administracao_id, 0));
create index idx_usuario_papel_usuario on usuario_papel (usuario_id);

-- Token de renovação: o de acesso (JWT) vive pouco e não é revogável; este
-- vive mais, fica no banco e pode ser revogado — é o que torna possível sair.
-- Só o hash SHA-256 é guardado, para que um vazamento da tabela não entregue
-- sessões válidas.
create table token_renovacao (
    id          bigserial   primary key,
    usuario_id  bigint      not null references usuario (id) on delete cascade,
    token_hash  varchar(64) not null unique,
    criado_em   timestamptz not null default now(),
    expira_em   timestamptz not null,
    revogado_em timestamptz
);

create index idx_token_renovacao_usuario on token_renovacao (usuario_id);
