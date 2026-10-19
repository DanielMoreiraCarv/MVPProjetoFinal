"use client";

import { Plus } from "lucide-react";
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
import { ApiError } from "@/src/lib/api/client";
import { atualizarAtleta, criarAtleta } from "@/src/lib/api/atletas";
import { useAvisos } from "@/src/lib/avisos";
import { Atleta } from "@/src/lib/types/atleta";

/**
 * Cadastra um atleta novo já dentro da equipe, ou edita um que está nela.
 *
 * Não é o mesmo que trazer um atleta que já existe — isso é
 * `TrazerAtletaDialog`. Aqui nasce uma pessoa no cadastro; lá ela só troca de
 * equipe.
 *
 * A atualização manda o formulário inteiro de propósito: `PUT /atleta/{id}`
 * sobrescreve os campos que recebe e zera os que não recebe, então enviar só
 * o que mudou apagaria o resto. Por isso a modalidade da equipe vai junto: é
 * a única fonte da modalidade do atleta que a tela tem, já que a resposta não
 * a devolve.
 */
export const AtletaDialog = ({
    idEquipe,
    idModalidadeDaEquipe,
    atleta,
    aoSalvar,
    gatilho,
}: {
    idEquipe: number;
    idModalidadeDaEquipe?: number;
    atleta?: Atleta;
    aoSalvar: (atleta: Atleta) => void;
    gatilho?: React.ReactElement;
}) => {
    const editando = !!atleta;
    const avisos = useAvisos();

    const [aberto, setAberto] = useState(false);
    const [nome, setNome] = useState("");
    const [numCamisa, setNumCamisa] = useState("");
    const [idade, setIdade] = useState("");
    const [cpf, setCpf] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<Error | null>(null);

    const aoAbrir = (abrindo: boolean) => {
        setAberto(abrindo);
        if (!abrindo) return;

        setNome(atleta?.nome ?? "");
        setNumCamisa(atleta?.numCamisa?.toString() ?? "");
        setIdade(atleta?.idade?.toString() ?? "");
        setCpf(atleta?.cpf ?? "");
        setErro(null);
    };

    const mensagemDoCampo = (campo: string) =>
        erro instanceof ApiError ? erro.mensagemDoCampo(campo) : undefined;

    const enviar = async (evento: React.FormEvent) => {
        evento.preventDefault();
        setSalvando(true);
        setErro(null);

        const comum = {
            nome: nome.trim(),
            numCamisa: numCamisa ? Number(numCamisa) : undefined,
            idade: idade ? Number(idade) : undefined,
            cpf: cpf.trim() || undefined,
            idModalidade: idModalidadeDaEquipe,
        };

        try {
            const salvo = editando
                ? await atualizarAtleta(atleta.id, comum)
                : await criarAtleta({ ...comum, idEquipe });

            aoSalvar(salvo);
            avisos.sucesso(editando ? `${salvo.nome} atualizado.` : `${salvo.nome} cadastrado.`);
            setAberto(false);
        } catch (causa) {
            setErro(causa instanceof Error ? causa : new Error("Não foi possível salvar."));
            avisos.erro(causa);
        } finally {
            setSalvando(false);
        }
    };

    return (
        <Dialog open={aberto} onOpenChange={aoAbrir}>
            <DialogTrigger
                render={
                    gatilho ?? (
                        <Button size="sm">
                            <Plus />
                            Cadastrar atleta
                        </Button>
                    )
                }
            />
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {editando ? `Editar ${atleta.nome}` : "Cadastrar atleta novo"}
                    </DialogTitle>
                    <DialogDescription>
                        {editando
                            ? "Os dados do atleta. A equipe dele não muda aqui."
                            : "Cria o atleta no cadastro e já o coloca neste elenco. Para trazer alguém que já existe, use “Trazer atleta”."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={enviar} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="atleta-nome">Nome</Label>
                        <Input
                            id="atleta-nome"
                            value={nome}
                            onChange={(evento) => setNome(evento.target.value)}
                            placeholder="Nome do atleta"
                            aria-invalid={!!mensagemDoCampo("nome")}
                            required
                        />
                        {mensagemDoCampo("nome") && (
                            <p role="alert" className="text-xs text-destructive">
                                {mensagemDoCampo("nome")}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="atleta-camisa">Número da camisa</Label>
                            <Input
                                id="atleta-camisa"
                                type="number"
                                min={1}
                                max={99}
                                value={numCamisa}
                                onChange={(evento) => setNumCamisa(evento.target.value)}
                                placeholder="10"
                                aria-invalid={!!mensagemDoCampo("numCamisa")}
                            />
                            {mensagemDoCampo("numCamisa") && (
                                <p role="alert" className="text-xs text-destructive">
                                    {mensagemDoCampo("numCamisa")}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="atleta-idade">Idade</Label>
                            <Input
                                id="atleta-idade"
                                type="number"
                                min={1}
                                max={120}
                                value={idade}
                                onChange={(evento) => setIdade(evento.target.value)}
                                placeholder="17"
                                aria-invalid={!!mensagemDoCampo("idade")}
                            />
                            {mensagemDoCampo("idade") && (
                                <p role="alert" className="text-xs text-destructive">
                                    {mensagemDoCampo("idade")}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="atleta-cpf">CPF</Label>
                        <Input
                            id="atleta-cpf"
                            value={cpf}
                            onChange={(evento) => setCpf(evento.target.value)}
                            placeholder="Opcional"
                            aria-invalid={!!mensagemDoCampo("cpf")}
                        />
                        {mensagemDoCampo("cpf") && (
                            <p role="alert" className="text-xs text-destructive">
                                {mensagemDoCampo("cpf")}
                            </p>
                        )}
                    </div>

                    {erro && (!(erro instanceof ApiError) || erro.detalhes.length === 0) && (
                        <p role="alert" className="text-sm text-destructive">
                            {erro.message}
                        </p>
                    )}

                    <DialogFooter>
                        <DialogClose render={<Button type="button" variant="outline" />}>
                            Cancelar
                        </DialogClose>
                        <Button type="submit" disabled={salvando || !nome.trim()}>
                            {salvando ? "Salvando…" : editando ? "Salvar atleta" : "Cadastrar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
