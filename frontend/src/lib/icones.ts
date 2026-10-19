import {
    AlertTriangle,
    BookOpen,
    Building2,
    CalendarDays,
    ClipboardList,
    Flag,
    GitBranch,
    Landmark,
    Layers,
    LayoutDashboard,
    ListOrdered,
    Network,
    PanelsTopLeft,
    Shield,
    Swords,
    Trophy,
    User,
    Users,
    Volleyball,
    type LucideIcon,
} from "lucide-react";

/**
 * Conceito do domínio → ícone. Nenhuma tela importa um ícone do lucide
 * direto: importa daqui.
 *
 * É o que garante que competição seja o mesmo troféu no menu, na lista, no
 * cabeçalho da página e no estado vazio — e que o troféu seja só dela: a
 * marca do app e o escopo escolhido usam monograma, não o ícone do conceito. Espalhar a escolha pelos
 * componentes é como a mesma coisa acaba com três ícones diferentes em três
 * telas — que é de onde este arquivo veio.
 *
 * As chaves são os termos de `documentos/glossario.md`.
 */
export const ICONES = {
    inicio: LayoutDashboard,
    administracao: Building2,
    federacao: Landmark,
    competicao: Trophy,
    visaoGeral: PanelsTopLeft,
    equipe: Shield,
    atleta: User,
    elenco: Users,
    partida: Swords,
    sumula: ClipboardList,
    fase: GitBranch,
    estrutura: Layers,
    classificacao: ListOrdered,
    chaveamento: Network,
    calendario: CalendarDays,
    // O lucide não tem apito. A bandeira é o outro objeto que só quem
    // arbitra carrega.
    arbitro: Flag,
    sancao: AlertTriangle,
    modalidade: Volleyball,
    cadastro: BookOpen,
} as const satisfies Record<string, LucideIcon>;

export type Conceito = keyof typeof ICONES;

export const icone = (conceito: Conceito): LucideIcon => ICONES[conceito];
