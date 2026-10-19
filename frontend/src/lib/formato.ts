/**
 * Data e hora em pt-BR a partir do ISO-8601 que a API manda.
 *
 * Num lugar só: espalhar `toLocaleString` pelos componentes é como metade das
 * telas acaba com um formato e metade com outro.
 */

const DATA_E_HORA = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

const DIA_E_MES = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
});

const DIA_DA_SEMANA = new Intl.DateTimeFormat("pt-BR", { weekday: "long" });

/** "07/02/2026 09:00", ou o texto de reserva quando não há agendamento. */
export const formatarDataHora = (iso?: string, seVazio = "Sem data definida") =>
    iso ? DATA_E_HORA.format(new Date(iso)) : seVazio;

/** "07 de fev. 09:00" — para lista, onde o ano quase sempre é o corrente. */
export const formatarDiaEHora = (iso?: string, seVazio = "A definir") =>
    iso ? DIA_E_MES.format(new Date(iso)) : seVazio;

export const formatarDiaDaSemana = (iso?: string) =>
    iso ? DIA_DA_SEMANA.format(new Date(iso)) : "";

/**
 * Ordena por data, com as sem data no fim — partida não agendada não tem
 * onde entrar na ordem cronológica, e jogá-la para o começo esconde as que
 * têm horário.
 */
export const porDataHora = <T extends { dataHora?: string }>(a: T, b: T) => {
    if (!a.dataHora && !b.dataHora) return 0;
    if (!a.dataHora) return 1;
    if (!b.dataHora) return -1;
    return a.dataHora.localeCompare(b.dataHora);
};
