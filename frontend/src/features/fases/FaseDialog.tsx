"use client";

import { Pencil, Plus, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

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
import { Escolha } from "@/src/components/Escolha";
import {
    CamposDaFase,
    paraCampo,
    paraServidor,
    pendenciasDosCampos,
} from "@/src/features/fases/CamposDaFase";
import { ApiError } from "@/src/lib/api/client";
import {
    AtributoDeFase,
    Fase,
    FORMATOS_DE_FASE,
    FormatoDeFase,
    ROTULO_DO_FORMATO,
    atualizarFase,
    criarFase,
    definirAtributoDaFase,
    listarAtributosDaFase,
    listarAtributosDoTipo,
    validarFase,
} from "@/src/lib/api/fases";
import { useAvisos } from "@/src/lib/avisos";

const INSCRITAS = "inscritas";
const DESEMPATE_PELA_ORDEM = "desconsiderarEmpatesNaEntrada";

/**
 * Na primeira fase ninguém tem classificação, e a eliminatória precisa de
 * uma ordem para semear 1 contra o último: chavear pela ordem de inscrição é
 * o ponto de partida razoável, e a pessoa ainda pode desligar.
 */
const comDesempateNaPrimeiraFase = (
    rascunho: Record<string, string>,
    formato: FormatoDeFase,
    anterior: string,
    atributos: AtributoDeFase[],
) =>
    formato === "ELIMINATORIA" &&
    anterior === INSCRITAS &&
    atributos.some((a) => a.codigo === DESEMPATE_PELA_ORDEM)
        ? { ...rascunho, [DESEMPATE_PELA_ORDEM]: "true" }
        : rascunho;

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

const anteriorDe = (fase: Fase | undefined, fases: Fase[]) =>
    fase ? fases.find((outra) => outra.idFaseSucessora === fase.id) : undefined;

/**
 * Quantas equipes entram numa fase: as inscritas, na primeira; nas outras,
 * os classificados da anterior — ou, sem quantidade informada, todas as que
 * entraram nela.
 */
export const equipesQueEntram = (
    anterior: Fase | undefined,
    fases: Fase[],
    inscritas: number,
    visitadas = new Set<number>(),
): number => {
    if (!anterior || visitadas.has(anterior.id)) return inscritas;
    if (anterior.classificados) return anterior.classificados;
    visitadas.add(anterior.id);
    return equipesQueEntram(anteriorDe(anterior, fases), fases, inscritas, visitadas);
};

/** Como a fase vai ficar com o que está preenchido, numa frase. */
const previa = (formato: FormatoDeFase, entram: number, rascunho: Record<string, string>) => {
    const inteiro = (codigo: string) => Number.parseInt(rascunho[codigo] ?? "", 10);
    const idaEVolta = rascunho.idaEVolta === "true";

    if (entram < 2) return "São necessárias ao menos 2 equipes.";

    if (formato === "GRUPOS") {
        const numero = inteiro("numeroDeGrupos");
        const tamanho = inteiro("tamanhoDoGrupo");
        if (numero > 0 && tamanho > 0) {
            return "Preencha só um: o número de grupos ou as equipes por grupo.";
        }
        const grupos = numero > 0 ? numero : tamanho > 0 ? Math.ceil(entram / tamanho) : 0;
        if (!grupos) return "Informe o número de grupos ou quantas equipes por grupo.";
        if (grupos > entram) return `São ${grupos} grupos para ${entram} equipes.`;

        const base = Math.floor(entram / grupos);
        const maiores = entram % grupos;
        const divisao =
            maiores === 0
                ? `${plural(grupos, "grupo", "grupos")} de ${base}`
                : `${plural(maiores, "grupo", "grupos")} de ${base + 1} e ${plural(grupos - maiores, "grupo", "grupos")} de ${base}`;
        const desiguais = maiores > 0 && rascunho.permiteGruposDesiguais !== "true";
        return desiguais
            ? `${divisao} — grupos desiguais precisam ser permitidos nas regras.`
            : `${divisao}, todos contra todos${idaEVolta ? " em ida e volta" : ""}.`;
    }

    if (formato === "ELIMINATORIA") {
        const aoFinal = inteiro("pararEmNTimes") > 0 ? inteiro("pararEmNTimes") : 1;
        const etapas = [entram];
        while (etapas[etapas.length - 1] > aoFinal && etapas[etapas.length - 1] % 2 === 0) {
            etapas.push(etapas[etapas.length - 1] / 2);
        }
        if (etapas[etapas.length - 1] !== aoFinal) {
            return `${entram} equipes não chegam a ${aoFinal} eliminando metade a cada rodada.`;
        }
        return `${etapas.join(" → ")} — ${plural(etapas.length - 1, "rodada", "rodadas")}${idaEVolta ? " em ida e volta" : ""}.`;
    }

    const jogos = (entram - 1) * (idaEVolta ? 2 : 1);
    return `Cada equipe faz ${plural(jogos, "jogo", "jogos")}, ${idaEVolta ? "turno e returno" : "turno único"}.`;
};

/**
 * Criar e editar fase no mesmo diálogo. O formato escolhido traz os campos
 * que a estratégia do servidor declara, e o resumo diz quantas equipes
 * entram — a conta que antes ficava para a validação descobrir depois.
 */
export const FaseDialog = ({
    idCompeticao,
    fase,
    fases,
    equipesInscritas,
    aoSalvar,
}: {
    idCompeticao: number;
    /** Ausente quando é criação. */
    fase?: Fase;
    /** Todas as fases da competição. */
    fases: Fase[];
    equipesInscritas: number;
    aoSalvar: (fase: Fase) => void;
}) => {
    const editando = Boolean(fase);
    const avisos = useAvisos();
    const outras = useMemo(() => fases.filter((outra) => outra.id !== fase?.id), [fases, fase]);

    const [aberto, setAberto] = useState(false);
    const [nome, setNome] = useState("");
    const [formato, setFormato] = useState<FormatoDeFase>(FORMATOS_DE_FASE[0]);
    const [anterior, setAnterior] = useState(INSCRITAS);
    // O efeito que carrega os campos lê a origem sem depender dela: trocar a
    // origem não pode recarregar o catálogo e apagar o que já foi digitado.
    const anteriorAtual = useRef(INSCRITAS);
    const [ordem, setOrdem] = useState("1");
    const [classificados, setClassificados] = useState("");
    const [atributos, setAtributos] = useState<AtributoDeFase[]>([]);
    const [rascunho, setRascunho] = useState<Record<string, string>>({});
    const [carregandoCampos, setCarregandoCampos] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [tentou, setTentou] = useState(false);
    const [erro, setErro] = useState<unknown>(null);

    const aoAbrir = (abrindo: boolean) => {
        setAberto(abrindo);
        if (!abrindo) return;

        // Criando, a fase nova vem depois da última que ainda não leva a
        // lugar nenhum: é o caso de quem monta a competição em sequência.
        const ultimaSemSucessora = [...outras]
            .filter((outra) => !outra.idFaseSucessora)
            .sort((a, b) => (b.ordem ?? 0) - (a.ordem ?? 0))[0];
        const antes = fase ? anteriorDe(fase, fases) : ultimaSemSucessora;

        setNome(fase?.nome ?? "");
        setFormato(fase?.formato ?? FORMATOS_DE_FASE[0]);
        setAnterior(antes ? String(antes.id) : INSCRITAS);
        anteriorAtual.current = antes ? String(antes.id) : INSCRITAS;
        setOrdem(String(fase?.ordem ?? (antes?.ordem ?? 0) + 1));
        setClassificados(fase?.classificados ? String(fase.classificados) : "");
        setCarregandoCampos(true);
        setTentou(false);
        setErro(null);
    };

    const trocarFormato = (novo: FormatoDeFase) => {
        if (novo === formato) return;
        setCarregandoCampos(true);
        setFormato(novo);
    };

    // Os campos do formato: os valores da própria fase quando ela já é desse
    // formato; o catálogo do tipo, com os padrões, quando é nova ou mudou.
    useEffect(() => {
        if (!aberto) return;
        let vigente = true;
        const busca =
            fase && fase.formato === formato
                ? listarAtributosDaFase(fase.id)
                : listarAtributosDoTipo(formato);
        busca
            .then((lista) => {
                if (!vigente) return;
                setAtributos(lista);
                const doServidor = Object.fromEntries(lista.map((a) => [a.codigo, paraCampo(a)]));
                const mesmaFase = fase && fase.formato === formato;
                setRascunho(
                    mesmaFase
                        ? doServidor
                        : comDesempateNaPrimeiraFase(doServidor, formato, anteriorAtual.current, lista),
                );
            })
            .catch((causa) => vigente && setErro(causa))
            .finally(() => vigente && setCarregandoCampos(false));
        return () => {
            vigente = false;
        };
    }, [aberto, formato, fase]);

    const faseAnterior = outras.find((outra) => String(outra.id) === anterior);
    const entram = equipesQueEntram(faseAnterior, fases, equipesInscritas);
    const origem = faseAnterior
        ? faseAnterior.classificados
            ? `classificados de ${faseAnterior.nome}`
            : `vindas de ${faseAnterior.nome} (todas: ela não define classificados)`
        : "inscritas na competição";

    const nClassificados = Number(classificados);
    const pendencias = [
        ...(carregandoCampos ? [] : pendenciasDosCampos(atributos, rascunho)),
        ...(formato === "ELIMINATORIA" &&
        !faseAnterior &&
        atributos.some((a) => a.codigo === DESEMPATE_PELA_ORDEM) &&
        rascunho[DESEMPATE_PELA_ORDEM] !== "true"
            ? [
                  "Na primeira fase as equipes não têm classificação: ative \"Aceitar empates na entrada\" nas regras para chavear pela ordem de inscrição.",
              ]
            : []),
        ...(classificados && nClassificados > entram
            ? [`Classificados não podem passar das ${entram} equipes que entram.`]
            : []),
    ];

    const mensagemDoCampo = (campo: string) =>
        erro instanceof ApiError ? erro.mensagemDoCampo(campo) : undefined;

    const escolherAnterior = (valor: string) => {
        setAnterior(valor);
        anteriorAtual.current = valor;
        setRascunho((antes) => comDesempateNaPrimeiraFase(antes, formato, valor, atributos));
        const antes = outras.find((outra) => String(outra.id) === valor);
        setOrdem(String((antes?.ordem ?? 0) + 1));
    };

    const encadear = async (alvo: Fase, idSucessora: number | undefined) => {
        if (!alvo.formato) return;
        await atualizarFase(alvo.id, {
            nome: alvo.nome,
            ordem: alvo.ordem ?? 1,
            fasePartida: alvo.formato,
            idCompeticao,
            qtdClassificados: alvo.classificados,
            idFaseSucessora: idSucessora,
        });
    };

    const enviar = async (evento: React.FormEvent) => {
        evento.preventDefault();
        // O que falta só aparece depois de tentar: em vermelho antes de a
        // pessoa digitar qualquer coisa, parecia erro dela.
        setTentou(true);
        if (pendencias.length > 0) return;
        setSalvando(true);
        setErro(null);

        try {
            const entrada = {
                nome: nome.trim(),
                ordem: Number(ordem),
                fasePartida: formato,
                idCompeticao,
                qtdClassificados: classificados ? nClassificados : undefined,
                // O `PUT` grava a sucessora que vier, inclusive a ausência:
                // editar o resto da fase não pode desfazer o encadeamento.
                idFaseSucessora: fase?.idFaseSucessora,
            };
            const salva = fase ? await atualizarFase(fase.id, entrada) : await criarFase(entrada);

            // Só o que mudou em relação ao que o servidor já tem (ou ao
            // padrão): uma chamada por campo, e o vazio apaga.
            for (const atributo of atributos) {
                const novo = rascunho[atributo.codigo] ?? "";
                if (novo !== paraCampo(atributo)) {
                    await definirAtributoDaFase(salva.id, atributo.codigo, paraServidor(atributo, novo));
                }
            }

            const anteriorAntes = anteriorDe(fase, fases);
            if (anteriorAntes && anteriorAntes.id !== faseAnterior?.id) {
                await encadear(anteriorAntes, undefined);
            }
            if (faseAnterior && faseAnterior.idFaseSucessora !== salva.id) {
                await encadear(faseAnterior, salva.id);
            }

            const validacao = await validarFase(salva.id);
            if (validacao.valido) {
                avisos.sucesso(editando ? "Fase atualizada." : "Fase criada e pronta para gerar os confrontos.");
            } else {
                avisos.aviso(editando ? "Fase atualizada." : "Fase criada.", validacao.erros.join(" "));
            }
            aoSalvar(salva);
            setAberto(false);
        } catch (causa) {
            setErro(causa);
            if (!(causa instanceof ApiError && causa.ehValidacao)) avisos.erro(causa);
        } finally {
            setSalvando(false);
        }
    };

    return (
        <Dialog open={aberto} onOpenChange={aoAbrir}>
            <DialogTrigger render={<Button variant={editando ? "outline" : "default"} size="sm" />}>
                {editando ? <Pencil /> : <Plus />}
                {editando ? "Editar" : "Nova fase"}
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{editando ? `Editar ${fase?.nome}` : "Nova fase"}</DialogTitle>
                    <DialogDescription>
                        O formato decide como os confrontos são montados; os campos dele aparecem
                        logo abaixo.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={enviar} className="flex min-h-0 min-w-0 flex-col gap-4">
                    <div className="-mr-2 flex max-h-[62vh] min-w-0 flex-col gap-5 overflow-y-auto pr-2">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="fase-nome">Nome</Label>
                        <Input
                            id="fase-nome"
                            placeholder={outras.length === 0 ? "Primeira fase" : "Semifinal"}
                            value={nome}
                            onChange={(evento) => setNome(evento.target.value)}
                            aria-invalid={!!mensagemDoCampo("nome")}
                            required
                        />
                        {mensagemDoCampo("nome") && (
                            <p role="alert" className="text-xs text-destructive">
                                {mensagemDoCampo("nome")}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Formato</Label>
                        <ToggleGroup
                            value={[formato]}
                            onValueChange={(valor) => valor.length > 0 && trocarFormato(valor[0] as FormatoDeFase)}
                            variant="outline"
                            className="w-full flex-wrap"
                        >
                            {FORMATOS_DE_FASE.map((cada) => (
                                <ToggleGroupItem key={cada} value={cada} className="flex-1 basis-28">
                                    {ROTULO_DO_FORMATO[cada]}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="fase-anterior">Recebe as equipes de</Label>
                            <Escolha
                                id="fase-anterior"
                                valor={anterior}
                                aoMudar={escolherAnterior}
                                opcoes={[
                                    { valor: INSCRITAS, rotulo: "Inscritas na competição — é a primeira fase" },
                                    ...outras.map((outra) => ({
                                        valor: String(outra.id),
                                        rotulo: `Classificados de ${outra.nome}`,
                                    })),
                                ]}
                            />
                        </div>
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
                        </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl bg-muted/60 px-4 py-3">
                        <Users className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div className="space-y-0.5 text-sm">
                            <p>
                                Entram{" "}
                                <span className="numero-tabular font-mono font-semibold">{entram}</span>{" "}
                                {entram === 1 ? "equipe" : "equipes"}, {origem}.
                            </p>
                            {!carregandoCampos && (
                                <p className="text-muted-foreground">
                                    {previa(formato, entram, rascunho)}
                                    {formato === "ELIMINATORIA" &&
                                        !faseAnterior &&
                                        rascunho[DESEMPATE_PELA_ORDEM] === "true" &&
                                        " Chaveamento pela ordem de inscrição: 1º contra o último."}
                                </p>
                            )}
                        </div>
                    </div>

                    {carregandoCampos ? (
                        <p className="text-sm text-muted-foreground">Carregando os campos do formato…</p>
                    ) : (
                        <CamposDaFase
                            atributos={atributos}
                            rascunho={rascunho}
                            aoMudar={(codigo, valor) =>
                                setRascunho((antes) => ({ ...antes, [codigo]: valor }))
                            }
                        />
                    )}

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="fase-classificados">Classificados</Label>
                        <Input
                            id="fase-classificados"
                            type="number"
                            min={1}
                            max={entram}
                            className="numero-tabular font-mono sm:w-40"
                            placeholder={`até ${entram}`}
                            value={classificados}
                            onChange={(evento) => setClassificados(evento.target.value)}
                            aria-invalid={!!classificados && nClassificados > entram}
                        />
                        <p className="text-xs text-muted-foreground">
                            Quantas avançam para a fase seguinte. Em branco, todas seguem; a última
                            fase não precisa.
                        </p>
                    </div>

                    {tentou && pendencias.length > 0 && (
                        <ul role="alert" className="space-y-1 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {pendencias.map((pendencia) => (
                                <li key={pendencia}>{pendencia}</li>
                            ))}
                        </ul>
                    )}

                    {erro instanceof Error &&
                        (!(erro instanceof ApiError) || erro.detalhes.length === 0) && (
                            <p role="alert" className="text-sm text-destructive">
                                {erro.message}
                            </p>
                        )}

                    </div>

                    <DialogFooter>
                        <DialogClose render={<Button type="button" variant="outline" />}>
                            Cancelar
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={salvando || carregandoCampos || !nome.trim()}
                        >
                            {salvando ? "Salvando…" : editando ? "Salvar fase" : "Criar fase"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
