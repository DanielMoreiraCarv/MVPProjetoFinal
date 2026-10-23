import { cookies } from "next/headers";

import { COOKIE_DE_ACESSO, COOKIE_DO_USUARIO, usuarioDoCookie } from "./sessao";

/**
 * Quem está na sessão, para desenhar a tela. Exige o cookie de acesso: o
 * proxy já renovou o que estava vencido, então sem ele não há sessão.
 */
export const usuarioAtual = async () => {
    const guardados = await cookies();
    if (!guardados.has(COOKIE_DE_ACESSO)) return null;
    return usuarioDoCookie(guardados.get(COOKIE_DO_USUARIO)?.value);
};
