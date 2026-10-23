/**
 * A sessão mora em três cookies httpOnly — nenhum deles é legível por
 * JavaScript, e nada de sessão vai para o localStorage, onde qualquer script
 * injetado na página o leria.
 *
 * - acesso: o JWT de vida curta que vai no `Authorization` de cada chamada;
 * - renovação: o token de uso único que troca um acesso vencido por outro;
 * - usuário: nome, e-mail e papéis, só para desenhar o menu sem perguntar à
 *   API a cada navegação. Quem decide o que pode é sempre o servidor.
 */
export const COOKIE_DE_ACESSO = "tcc.acesso";
export const COOKIE_DE_RENOVACAO = "tcc.renovacao";
export const COOKIE_DO_USUARIO = "tcc.usuario";

export const PAINEL = "/inicio";

export type UsuarioDaSessao = { nome: string; email: string; papeis: string[] };

/**
 * Quem entra na gestão. O cadastro aberto dá o papel PUBLICO, que só
 * acompanha — sem esta lista, criar uma conta bastaria para editar
 * competições.
 */
export const PAPEIS_DA_GESTAO = ["ADMINISTRADOR", "ORGANIZADOR", "MESARIO", "ARBITRO"];

export const podeGerir = (usuario: Pick<UsuarioDaSessao, "papeis"> | null) =>
    usuario !== null && usuario.papeis.some((papel) => PAPEIS_DA_GESTAO.includes(papel));

export const usuarioDoCookie = (valor: string | undefined): UsuarioDaSessao | null => {
    if (!valor) return null;
    try {
        const lido = JSON.parse(valor);
        return typeof lido?.nome === "string" &&
            typeof lido?.email === "string" &&
            Array.isArray(lido?.papeis)
            ? { nome: lido.nome, email: lido.email, papeis: lido.papeis.filter((p: unknown) => typeof p === "string") }
            : null;
    } catch {
        return null;
    }
};

/**
 * Para onde voltar depois de entrar. Só caminho deste site: aceitar o `de`
 * da URL como veio deixaria um link `/entrar?de=https://outro.site` mandar a
 * pessoa, já autenticada, para fora.
 */
export const destinoSeguro = (de: unknown) =>
    typeof de === "string" && de.startsWith("/") && !de.startsWith("//") && !de.startsWith("/\\")
        ? de
        : PAINEL;
