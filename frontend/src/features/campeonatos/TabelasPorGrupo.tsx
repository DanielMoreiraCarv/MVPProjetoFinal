import {
    LinhaDaClassificacao,
    TabelaDeClassificacao,
} from "@/src/features/campeonatos/TabelaDeClassificacao";

type Linha = LinhaDaClassificacao & { grupo?: number };

/** Grupo 1 é o A: é como o organizador chama, e como sai no papel. */
const nomeDoGrupo = (grupo: number) => `Grupo ${String.fromCharCode(64 + grupo)}`;

/** Uma tabela por grupo; sem grupo, a tabela única. */
export const TabelasPorGrupo = ({ linhas }: { linhas: Linha[] }) => {
    const porGrupo = new Map<number | undefined, Linha[]>();
    for (const linha of linhas) {
        porGrupo.set(linha.grupo, [...(porGrupo.get(linha.grupo) ?? []), linha]);
    }
    const grupos = [...porGrupo.entries()].sort(([a], [b]) => (a ?? 0) - (b ?? 0));

    if (grupos.length === 1 && grupos[0][0] === undefined) {
        return <TabelaDeClassificacao linhas={grupos[0][1]} />;
    }

    return (
        <div className="grid gap-6 xl:grid-cols-2">
            {grupos.map(([grupo, doGrupo]) => (
                <section key={grupo ?? 0} className="min-w-0 space-y-2">
                    <h3 className="px-1 text-sm font-semibold">
                        {grupo === undefined ? "Sem grupo" : nomeDoGrupo(grupo)}
                    </h3>
                    <TabelaDeClassificacao linhas={doGrupo} />
                </section>
            ))}
        </div>
    );
};
