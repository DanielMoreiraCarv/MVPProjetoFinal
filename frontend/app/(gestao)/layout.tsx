import { redirect } from "next/navigation";

import { Casca } from "@/src/components/layout/Casca";
import { organizadorAtual } from "@/src/lib/sessao/servidor";

/**
 * Tudo o que é de quem organiza mora aqui dentro, atrás da entrada. O proxy
 * já desvia quem não entrou; conferir de novo no layout é o que garante que a
 * casca nunca é desenhada sem alguém na sessão.
 */
const LayoutDaGestao = async ({ children }: { children: React.ReactNode }) => {
    const organizador = await organizadorAtual();
    if (!organizador) redirect("/entrar");

    return <Casca organizador={organizador}>{children}</Casca>;
};

export default LayoutDaGestao;
