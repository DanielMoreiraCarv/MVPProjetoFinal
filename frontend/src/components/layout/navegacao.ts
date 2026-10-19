import { Conceito } from "@/src/lib/icones";

export type ItemDeMenu = {
    rotulo: string;
    href: string;
    conceito: Conceito;
    /** Marca o item como ativo também nas rotas abaixo dele. */
    prefixo?: boolean;
};

export type SecaoDeMenu = {
    titulo?: string;
    itens: ItemDeMenu[];
};

/**
 * O menu em dados, não em JSX: é o que deixa o mesmo mapa servir ao menu de
 * mesa, à gaveta do celular e à trilha de navegação sem repetir a lista em
 * três lugares.
 */
export const SECOES_GLOBAIS: SecaoDeMenu[] = [
    {
        itens: [{ rotulo: "Início", href: "/", conceito: "inicio" }],
    },
    {
        titulo: "Cadastro",
        itens: [
            // Administrações e competições vivem na mesma página: escolher a
            // administração é o que decide quais competições aparecem, e
            // separá-las dava uma tela que não existia sozinha.
            // Sem prefixo: dentro de uma competição quem fica ativo é o item
            // da seção dela, e não os dois ao mesmo tempo.
            { rotulo: "Competições", href: "/competicao", conceito: "competicao" },
            { rotulo: "Equipes", href: "/equipe", conceito: "equipe", prefixo: true },
            { rotulo: "Árbitros", href: "/arbitro", conceito: "arbitro", prefixo: true },
            { rotulo: "Cadastros", href: "/cadastro", conceito: "cadastro", prefixo: true },
        ],
    },
];

/**
 * A seção que só existe com competição escolhida — metade destas telas não tem
 * o que mostrar sem escopo.
 */
export const secoesDaCompeticao = (idCompeticao: number): SecaoDeMenu[] => {
    const raiz = `/competicao/${idCompeticao}`;

    return [
        {
            titulo: "Competição",
            itens: [
                { rotulo: "Visão geral", href: raiz, conceito: "visaoGeral" },
                { rotulo: "Estrutura", href: `${raiz}/estrutura`, conceito: "estrutura" },
                { rotulo: "Fases", href: `${raiz}/fase`, conceito: "fase", prefixo: true },
                {
                    rotulo: "Classificação",
                    href: `${raiz}/classificacao`,
                    conceito: "classificacao",
                },
                { rotulo: "Sanções", href: `${raiz}/sancao`, conceito: "sancao" },
                {
                    rotulo: "Calendário",
                    href: `${raiz}/partida`,
                    conceito: "calendario",
                    prefixo: true,
                },
            ],
        },
    ];
};

/** Um item está ativo na própria rota e, quando marcado, nas rotas abaixo. */
export const itemAtivo = (item: ItemDeMenu, caminho: string) =>
    item.prefixo
        ? caminho === item.href || caminho.startsWith(`${item.href}/`)
        : caminho === item.href;
