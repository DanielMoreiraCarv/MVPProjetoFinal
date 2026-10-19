"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

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
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Escolha } from "@/src/components/Escolha";
import { ApiError } from "@/src/lib/api/client";
import { atualizarCompeticao, criarCompeticao } from "@/src/lib/api/competicoes";
import { listarModalidades, Modalidade } from "@/src/lib/api/modalidades";
import { Competicao } from "@/src/lib/types/competicao";

const CATEGORIAS = ["Masculino", "Feminino", "Misto"];

const Erro = ({ mensagem }: { mensagem?: string }) =>
    mensagem ? (
        <p role="alert" className="text-xs text-destructive">
            {mensagem}
        </p>
    ) : null;

/** Criar e editar a mesma competição: os campos são os mesmos. */
export const CompeticaoDialog = ({
    idAdministracao,
    competicao,
    aoSalvar,
    gatilho,
}: {
    idAdministracao?: number;
    competicao?: Competicao;
    aoSalvar?: (competicao: Competicao) => void;
    gatilho?: React.ReactElement;
}) => {
    const editando = !!competicao;
    const [aberto, setAberto] = useState(false);
    const [modalidades, setModalidades] = useState<Modalidade[]>([]);
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [modalidade, setModalidade] = useState("");
    const [categoria, setCategoria] = useState(CATEGORIAS[0]);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<unknown>(null);

    useEffect(() => {
        if (!aberto) return;
        listarModalidades()
            .then((catalogo) => {
                setModalidades(catalogo);
                setModalidade((atual) => atual || String(catalogo[0]?.id ?? ""));
            })
            .catch(setErro);
    }, [aberto]);

    const aoAbrir = (proximo: boolean) => {
        setAberto(proximo);
        if (!proximo) return;
        setNome(competicao?.nome ?? "");
        setDescricao(competicao?.descricao ?? "");
        setModalidade(competicao?.modalidadeId ? String(competicao.modalidadeId) : "");
        setCategoria(competicao?.categoria || CATEGORIAS[0]);
        setErro(null);
    };

    const mensagemDoCampo = (campo: string) =>
        erro instanceof ApiError ? erro.mensagemDoCampo(campo) : undefined;

    const salvar = async (evento: React.FormEvent) => {
        evento.preventDefault();
        const administracao = competicao?.idAdministracao ?? idAdministracao;
        if (!administracao) {
            setErro(new Error("Escolha uma administração antes de criar a competição."));
            return;
        }

        setSalvando(true);
        setErro(null);
        try {
            const entrada = {
                nome: nome.trim(),
                descricao: descricao.trim(),
                categoria,
                idAdministracao: administracao,
                modalidadesIds: modalidade ? [Number(modalidade)] : [],
                // O formato mora nas fases, montadas na Estrutura. O campo
                // antigo segue no contrato e só é preservado.
                isMataMata: competicao?.isMataMata ?? false,
            };
            const salva = editando
                ? await atualizarCompeticao(competicao.id, entrada)
                : await criarCompeticao(entrada);
            aoSalvar?.(salva);
            setAberto(false);
        } catch (causa) {
            setErro(causa);
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
                            Nova competição
                        </Button>
                    )
                }
            />
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editando ? "Editar competição" : "Nova competição"}</DialogTitle>
                    <DialogDescription>
                        A modalidade decide quais equipes podem se inscrever. As fases e o
                        regulamento são montados depois, na Estrutura.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={salvar} className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto pr-1">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="competicao-nome">Nome</Label>
                        <Input
                            id="competicao-nome"
                            value={nome}
                            onChange={(evento) => setNome(evento.target.value)}
                            placeholder="Ex.: Interclasses 2026 — Futsal masculino"
                            aria-invalid={!!mensagemDoCampo("nome")}
                            required
                        />
                        <Erro mensagem={mensagemDoCampo("nome")} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="competicao-descricao">Descrição</Label>
                        <Textarea
                            id="competicao-descricao"
                            value={descricao}
                            onChange={(evento) => setDescricao(evento.target.value)}
                            placeholder="Opcional"
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="competicao-modalidade">Modalidade</Label>
                            <Escolha
                                id="competicao-modalidade"
                                valor={modalidade}
                                aoMudar={setModalidade}
                                opcoes={modalidades.map((m) => ({
                                    valor: String(m.id),
                                    rotulo: m.nome,
                                }))}
                                vazio="Carregando…"
                                invalido={!!mensagemDoCampo("modalidadesIds")}
                            />
                            <Erro mensagem={mensagemDoCampo("modalidadesIds")} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label>Categoria</Label>
                            <ToggleGroup
                                value={[categoria]}
                                onValueChange={(valor) => valor.length > 0 && setCategoria(valor[0])}
                                variant="outline"
                                className="w-full"
                            >
                                {CATEGORIAS.map((c) => (
                                    <ToggleGroupItem key={c} value={c} className="flex-1">
                                        {c}
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                        </div>
                    </div>


                    {erro instanceof Error &&
                        (!(erro instanceof ApiError) || erro.detalhes.length === 0) && (
                            <p role="alert" className="text-sm text-destructive">
                                {erro.message}
                            </p>
                        )}

                    <DialogFooter>
                        <DialogClose render={<Button type="button" variant="outline" />}>
                            Cancelar
                        </DialogClose>
                        <Button type="submit" disabled={salvando || !nome.trim() || !modalidade}>
                            {salvando ? "Salvando…" : editando ? "Salvar competição" : "Criar competição"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
