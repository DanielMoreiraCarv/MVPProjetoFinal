export const CHAVE_DO_TEMA = "tcc.tema";

export type Tema = "claro" | "escuro" | "sistema";

/**
 * Roda antes da primeira pintura, no <head>. Sem isto a página nasce no tema
 * claro e pisca para o escuro quando o React assume — o efeito é pior no
 * escuro, porque o flash é branco.
 *
 * Fica como texto, e não como módulo, porque precisa executar de forma
 * síncrona antes de qualquer JavaScript da aplicação carregar.
 */
export const SCRIPT_DO_TEMA = `
(function () {
  try {
    var salvo = localStorage.getItem("${CHAVE_DO_TEMA}");
    var escuro = salvo === "escuro" ||
      ((!salvo || salvo === "sistema") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", escuro);
  } catch (e) {
    /* localStorage bloqueado: fica no tema claro, que é o padrão do CSS. */
  }
})();
`.trim();
