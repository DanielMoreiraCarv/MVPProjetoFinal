"use client"

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Competition } from "@/src/lib/types/competition";
import { listarModalidades, Modalidade } from "@/src/lib/api/modalidades";
import { criarCompeticao, atualizarCompeticao } from "@/src/lib/api/competicoes";

const CATEGORIAS = ["Masculino", "Feminino", "Misto"];
const TIPOS = ["Pontos Corridos", "Mata-Mata"];

interface AddCompetitionDialogProps {
    idAdministracao?: number;
    competicao?: Competition;
    onSaved?: (competicao: Competition) => void;
}

export const AddCompetitionDialog = ({ idAdministracao, competicao, onSaved }: AddCompetitionDialogProps) => {
    const editando = !!competicao;
    const [open, setOpen] = useState(false);
    const [modalidades, setModalidades] = useState<Modalidade[]>([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [modalidadeId, setModalidadeId] = useState<string[]>([]);
    const [categoria, setCategoria] = useState<string[]>(["Masculino"]);
    const [tipo, setTipo] = useState<string[]>(["Pontos Corridos"]);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;

        listarModalidades()
            .then((catalogo) => {
                setModalidades(catalogo);
                setModalidadeId((atual) =>
                    atual.length > 0 ? atual : [String(competicao?.modalidadeId ?? catalogo[0]?.id ?? "")],
                );
            })
            .catch((causa) => setErro(causa instanceof Error ? causa.message : "Não foi possível carregar as modalidades."));
    }, [open, competicao?.modalidadeId]);

    const aoAbrir = (aberto: boolean) => {
        setOpen(aberto);
        if (aberto) {
            setName(competicao?.name ?? "");
            setDescription(competicao?.description ?? "");
            setCategoria([competicao?.modality || "Masculino"]);
            setTipo([competicao?.currentStage === "Pontos Corridos" || !editando ? "Pontos Corridos" : "Mata-Mata"]);
            setModalidadeId(competicao?.modalidadeId ? [String(competicao.modalidadeId)] : []);
            setErro(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const administracaoAlvo = competicao?.administracaoId ?? idAdministracao;
        if (!administracaoAlvo) {
            setErro("Selecione uma administração antes de criar a competição.");
            return;
        }

        setSalvando(true);
        setErro(null);

        try {
            const entrada = {
                nome: name.trim(),
                descricao: description.trim(),
                categoria: categoria[0],
                idAdministracao: administracaoAlvo,
                modalidadesIds: modalidadeId.filter(Boolean).map(Number),
                isMataMata: tipo[0] === "Mata-Mata",
            };

            const salva = editando
                ? await atualizarCompeticao(competicao.id, entrada)
                : await criarCompeticao(entrada);

            onSaved?.(salva);
            setOpen(false);
        } catch (causa) {
            setErro(causa instanceof Error ? causa.message : "Não foi possível salvar a competição.");
        } finally {
            setSalvando(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={aoAbrir}>
            <DialogTrigger render={<Button />}>
                {editando ? "Editar" : "+ Nova Competição"}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editando ? "Editar Competição" : "Nova Competição"}</DialogTitle>
                    <DialogDescription>
                        Preencha os dados da competição.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto max-h-[65vh] pr-1">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="comp-name">Nome</Label>
                        <Input
                            id="comp-name"
                            placeholder="Nome da competição"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="comp-description">Descrição</Label>
                        <Textarea
                            id="comp-description"
                            placeholder="Descrição da competição"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Modalidade</Label>
                        <ToggleGroup
                            value={modalidadeId}
                            onValueChange={(v) => v.length > 0 && setModalidadeId(v)}
                            spacing={0}
                            variant="outline"
                            className="w-full flex-wrap"
                        >
                            {modalidades.map((modalidade) => (
                                <ToggleGroupItem key={modalidade.id} value={String(modalidade.id)} className="flex-1">
                                    {modalidade.nome}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Categoria</Label>
                        <ToggleGroup
                            value={categoria}
                            onValueChange={(v) => v.length > 0 && setCategoria(v)}
                            spacing={0}
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

                    <div className="flex flex-col gap-1.5">
                        <Label>Tipo de Competição</Label>
                        <ToggleGroup
                            value={tipo}
                            onValueChange={(v) => v.length > 0 && setTipo(v)}
                            spacing={0}
                            variant="outline"
                            className="w-full"
                        >
                            {TIPOS.map((t) => (
                                <ToggleGroupItem key={t} value={t} className="flex-1">
                                    {t}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>

                    {erro && (
                        <p role="alert" className="text-sm text-red-600">{erro}</p>
                    )}

                    <DialogFooter>
                        <DialogClose render={<Button className="border border-gray-300 bg-white text-gray-800 hover:bg-gray-50" />}>
                            Cancelar
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={salvando}
                            className="bg-green-700 text-white hover:bg-green-600 disabled:opacity-60"
                        >
                            {salvando ? "Salvando..." : editando ? "Salvar" : "Criar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
