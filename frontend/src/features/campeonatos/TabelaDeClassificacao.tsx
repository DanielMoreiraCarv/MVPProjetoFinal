import Link from "next/link";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { LinhaDaClassificacao } from "@/src/features/campeonatos/calculos";

// No celular ficam pontos, jogos, vitórias e saldo; o resto aparece a partir
// do tablet, em vez de a tabela rolar de lado sem a pessoa perceber.
const COLUNAS: { chave: keyof LinhaDaClassificacao; sigla: string; nome: string; soNaMesa?: boolean }[] = [
    { chave: "jogos", sigla: "J", nome: "Jogos" },
    { chave: "vitorias", sigla: "V", nome: "Vitórias" },
    { chave: "empates", sigla: "E", nome: "Empates", soNaMesa: true },
    { chave: "derrotas", sigla: "D", nome: "Derrotas", soNaMesa: true },
    { chave: "golsPro", sigla: "GP", nome: "Gols pró", soNaMesa: true },
    { chave: "golsContra", sigla: "GC", nome: "Gols contra", soNaMesa: true },
];

export const TabelaDeClassificacao = ({ linhas }: { linhas: LinhaDaClassificacao[] }) => (
    <div className="overflow-x-auto rounded-3xl border border-border">
        <Table>
            <TableHeader>
                <TableRow className="text-xs">
                    <TableHead className="w-10 pl-5">#</TableHead>
                    <TableHead>Equipe</TableHead>
                    <TableHead className="w-12 text-center text-primary" title="Pontos">
                        P
                    </TableHead>
                    {COLUNAS.map((coluna) => (
                        <TableHead
                            key={coluna.chave}
                            className={cn("w-10 text-center", coluna.soNaMesa && "hidden sm:table-cell")}
                            title={coluna.nome}
                        >
                            {coluna.sigla}
                        </TableHead>
                    ))}
                    <TableHead className="w-12 pr-5 text-center" title="Saldo de gols">
                        SG
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {linhas.map((linha, i) => (
                    <TableRow key={linha.idEquipe ?? linha.equipe} className={cn(i % 2 !== 0 && "bg-muted/40")}>
                        <TableCell className="numero-tabular pl-5 font-mono text-muted-foreground">
                            {linha.posicao}
                        </TableCell>
                        <TableCell className="max-w-40 truncate font-medium sm:max-w-none">
                            {linha.idEquipe ? (
                                <Link href={`/equipe/${linha.idEquipe}`} className="hover:underline">
                                    {linha.equipe}
                                </Link>
                            ) : (
                                linha.equipe
                            )}
                        </TableCell>
                        <TableCell className="numero-tabular text-center font-mono font-semibold text-primary">
                            {linha.pontos}
                        </TableCell>
                        {COLUNAS.map((coluna) => (
                            <TableCell
                                key={coluna.chave}
                                className={cn(
                                    "numero-tabular text-center font-mono text-muted-foreground",
                                    coluna.soNaMesa && "hidden sm:table-cell",
                                )}
                            >
                                {linha[coluna.chave]}
                            </TableCell>
                        ))}
                        <TableCell
                            className={cn(
                                "numero-tabular pr-5 text-center font-mono",
                                linha.saldo > 0
                                    ? "text-success"
                                    : linha.saldo < 0
                                      ? "text-destructive"
                                      : "text-muted-foreground",
                            )}
                        >
                            {linha.saldo > 0 ? `+${linha.saldo}` : linha.saldo}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);
