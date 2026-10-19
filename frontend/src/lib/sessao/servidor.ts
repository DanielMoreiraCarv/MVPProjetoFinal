import { cookies } from "next/headers";

import { COOKIE_DA_SESSAO, organizadorDaSessao } from "./sessao";

export const organizadorAtual = async () =>
    organizadorDaSessao((await cookies()).get(COOKIE_DA_SESSAO)?.value);
