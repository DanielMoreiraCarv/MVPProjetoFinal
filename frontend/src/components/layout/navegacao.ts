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
 *
 * A seção da competição só aparece com uma competição escolhida — metade das
 * telas não existe sem escopo. Quem monta essa parte é o seletor, na entrega
 * seguinte; aqui ela já tem lugar.
 */
export const SECOES_GLOBAIS: SecaoDeMenu[] = [
    // "Início" entra quando a página existir: item de menu que leva a um
    // redirecionamento nunca fica ativo e manda a pessoa para outro lugar.
    {
        titulo: "Cadastro",
        itens: [
            // Administrações e competições vivem na mesma página: escolher a
            // administração é o que decide quais competições aparecem, e
            // separá-las dava uma tela que não existia sozinha.
            {
                rotulo: "Competições",
                href: "/competicao",
                conceito: "competicao",
                prefixo: true,
            },
        ],
    },
];

// Equipes, Árbitros e Cadastros entram no menu junto com as próprias
// páginas. Item que leva a 404 é pior do que item que ainda não existe.


export const secoesDaCompeticao = (idCompeticao: number): SecaoDeMenu[] => {
    const raiz = `/competicao/${idCompeticao}`;
    return [
        {
            titulo: "Competição",
            itens: [
                { rotulo: "Visão geral", href: raiz, conceito: "competicao" },
                // Equipes inscritas, Fases, Classificação, Chaveamento e
                // Calendário entram aqui junto com as próprias páginas.
            ],
        },
    ];
};

/** Um item está ativo na própria rota e, quando marcado, nas rotas abaixo. */
export const itemAtivo = (item: ItemDeMenu, caminho: string) =>
    item.prefixo ? caminho === item.href || caminho.startsWith(`${item.href}/`) : caminho === item.href;
