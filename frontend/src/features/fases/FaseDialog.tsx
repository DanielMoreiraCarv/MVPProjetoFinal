"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ApiError } from "@/src/lib/api/client";
import {
    Fase,
    FORMATOS_DE_FASE,
    FormatoDeFase,
    ROTULO_DO_FORMATO,
    atualizarFase,
    criarFase,
} from "@/src/lib/api/fases";
import { useAvisos } from "@/src/lib/avisos";

/**
 * Criar e editar fase no mesmo diálogo: os campos são os mesmos, e duas
 * telas quase iguais divergem na primeira mudança.
 */
export const FaseDialog = ({
    idCompeticao,
    fase,
    outrasFases,
    aoSalvar,
}: {
    idCompeticao: number;
    /** Ausente quando é criação. */
    fase?: Fase;
    /** As outras fases da competição, candidatas a sucessora. */
    outrasFases: Fase[];
    aoSalvar: (fase: Fase) => void;
}) => {
    const editando = Boolean(fase);
    const avisos = useAvisos();

    const [aberto, setAberto] = useState(false);
    const [nome, setNome] = useState("");
    const [ordem, setOrdem] = useState("1");
    const [formato, setFormato] = useState<string[]>([FORMATOS_DE_FASE[0]]);
    const [classificados, setClassificados] = useState("");
    const [sucessora, setSucessora] = useState<string[]>([]);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<unknown>(null);

    // Já encadeada não pode ser desencadeada: o `PUT` ignora
    // `idFaseSucessora` nulo e mantém o vínculo anterior. Oferecer "Nenhuma"
    // seria uma opção que não faz nada.
    const podeDesencadear = !fase?.idFaseSucessora;

    const aoAbrir = (estaAberto: boolean) => {
        setAberto(estaAberto);
        if (!estaAberto) return;

        setNome(fase?.nome ?? "");
        setOrdem(String(fase?.ordem ?? outrasFases.length + 1));
        setFormato([fase?.formato ?? FORMATOS_DE_FASE[0]]);
        setClassificados(fase?.classificados ? String(fase.classificados) : "");
        setSucessora(fase?.idFaseSucessora ? [String(fase.idFaseSucessora)] : []);
        setErro(null);
    };

    const mensagemDoCampo = (campo: string) =>
        erro instanceof ApiError ? erro.mensagemDoCampo(campo) : undefined;

    const enviar = async (evento: React.FormEvent) => {
        evento.preventDefault();
        setSalvando(true);
        setErro(null);

        const entrada = {
            nome: nome.trim(),
            ordem: Number(ordem),
            fasePartida: formato[0] as FormatoDeFase,
            idCompeticao,
            qtdClassificados: classificados ? Number(classificados) : undefined,
            idFaseSucessora: sucessora[0] ? Number(sucessora[0]) : undefined,
        };

        try {
            const salva = fase ? await atualizarFase(fase.id, entrada) : await criarFase(entrada);
            avisos.sucesso(editando ? "Fase atualizada." : "Fase criada.");
            aoSalvar(salva);
            setAberto(false);
        } catch (causa) {
            setErro(causa);
            if (!(causa instanceof ApiError && causa.ehValidacao)) {
                avisos.erro(causa);
            }
        } finally {
            setSalvando(false);
        }
    };

    return (
        <Dialog open={aberto} onOpenChange={aoAbrir}>
            <DialogTrigger
                render={<Button variant={editando ? "outline" : "default"} size="sm" />}
            >
                {editando ? "Editar" : "Nova fase"}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editando ? "Editar fase" : "Nova fase"}</DialogTitle>
                    <DialogDescription>
                        A ordem decide quem vem antes. O formato decide como os confrontos são
                        montados.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={enviar} className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto pr-1">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="fase-nome">Nome</Label>
                        <Input
                            id="fase-nome"
                            placeholder="Primeira fase"
                            value={nome}
                            onChange={(evento) => setNome(evento.target.value)}
                            required
                        />
                        {mensagemDoCampo("nome") && (
                            <p className="text-sm text-destructive">{mensagemDoCampo("nome")}</p>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="fase-ordem">Ordem</Label>
                            <Input
                                id="fase-ordem"
                                type="number"
                                min={1}
                                className="numero-tabular font-mono"
                                value={ordem}
                                onChange={(evento) => setOrdem(evento.target.value)}
                                required
                            />
                            {mensagemDoCampo("ordem") && (
                                <p className="text-sm text-destructive">
                                    {mensagemDoCampo("ordem")}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="fase-classificados">Classificados</Label>
                            <Input
                                id="fase-classificados"
                                type="number"
                                min={0}
                                className="numero-tabular font-mono"
                                placeholder="Quantos avançam"
                                value={classificados}
                                onChange={(evento) => setClassificados(evento.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Quantos avançam para a fase seguinte. A última fase não precisa.
                            </p>
                            {mensagemDoCampo("qtdClassificados") && (
                                <p className="text-sm text-destructive">
                                    {mensagemDoCampo("qtdClassificados")}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Formato</Label>
                        <ToggleGroup
                            value={formato}
                            onValueChange={(valor) => valor.length > 0 && setFormato(valor)}
                            spacing={0}
                            variant="outline"
                            className="w-full flex-wrap"
                        >
                            {FORMATOS_DE_FASE.map((cada) => (
                                <ToggleGroupItem key={cada} value={cada} className="flex-1">
                                    {ROTULO_DO_FORMATO[cada]}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                        {mensagemDoCampo("fasePartida") && (
                            <p className="text-sm text-destructive">
                                {mensagemDoCampo("fasePartida")}
                            </p>
                        )}
                    </div>

                    {outrasFases.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                            <Label>Fase sucessora</Label>
                            <p className="text-xs text-muted-foreground">
                                Quem recebe os classificados desta fase.
                                {!podeDesencadear &&
                                    " A API não aceita desfazer o encadeamento; só trocar por outra fase."}
                            </p>
                            <ToggleGroup
                                value={sucessora}
                                onValueChange={(valor) =>
                                    (podeDesencadear || valor.length > 0) && setSucessora(valor)
                                }
                                spacing={0}
                                variant="outline"
                                className="w-full flex-wrap"
                            >
                                {outrasFases.map((candidata) => (
                                    <ToggleGroupItem
                                        key={candidata.id}
                                        value={String(candidata.id)}
                                        className="flex-1"
                                    >
                                        {candidata.nome}
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                            {mensagemDoCampo("idFaseSucessora") && (
                                <p className="text-sm text-destructive">
                                    {mensagemDoCampo("idFaseSucessora")}
                                </p>
                            )}
                        </div>
                    )}

                    {erro instanceof Error && (
                        <p role="alert" className="text-sm text-destructive">
                            {erro.message}
                        </p>
                    )}

                    <DialogFooter>
                        <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
                        <Button type="submit" disabled={salvando}>
                            {salvando ? "Salvando…" : editando ? "Salvar" : "Criar fase"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
