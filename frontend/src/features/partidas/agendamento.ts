/**
 * Dia e hora dos campos do formulário → o ISO-8601 com fuso que a API exige.
 *
 * `<input type="date">` devolve "2026-10-05" e `<input type="time">` devolve
 * "19:30": juntos são hora local sem fuso, e o servidor recusa isso com
 * `ENTRADA_INVALIDA`. O `new Date(...)` interpreta no fuso de quem preenche e
 * o `toISOString()` escreve o mesmo instante em UTC — que é o que a partida
 * precisa para cair no mesmo horário para todo mundo.
 */
export const paraIsoComFuso = (dia: string, hora: string): string | null => {
    if (!dia || !hora) return null;
    const instante = new Date(`${dia}T${hora}`);
    return Number.isNaN(instante.getTime()) ? null : instante.toISOString();
};

/** O caminho inverso, para o formulário abrir já preenchido com o agendamento. */
export const paraCamposDeAgendamento = (iso?: string) => {
    if (!iso) return { dia: "", hora: "" };
    const instante = new Date(iso);
    if (Number.isNaN(instante.getTime())) return { dia: "", hora: "" };

    const doisDigitos = (n: number) => String(n).padStart(2, "0");
    return {
        dia: `${instante.getFullYear()}-${doisDigitos(instante.getMonth() + 1)}-${doisDigitos(instante.getDate())}`,
        hora: `${doisDigitos(instante.getHours())}:${doisDigitos(instante.getMinutes())}`,
    };
};
