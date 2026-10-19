"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Confirmacao } from "@/src/components/estado/Confirmacao";
import { CarregandoLista, Erro, Vazio } from "@/src/components/estado/Estados";
import { CabecalhoDaPagina, CorpoDaPagina } from "@/src/components/layout/CabecalhoDaPagina";
import { Secao } from "@/src/components/layout/Secao";
import { FederacaoDialog } from "@/src/features/cadastros/FederacaoDialog";
import { Federacao, listarFederacoes, removerFederacao } from "@/src/lib/api/federacoes";
import { Modalidade, listarModalidades } from "@/src/lib/api/modalidades";
import { useAvisos } from "@/src/lib/avisos";
import { ICONES } from "@/src/lib/icones";

/**
 * Os cadastros de apoio numa página só: modalidade e federação não têm tela
 * própria porque nenhuma das duas tem detalhe para mostrar — uma é catálogo de
 * leitura, a outra tem um campo.
 */
const CadastroPage = () => {
    const avisos = useAvisos();
    const IconeModalidade = ICONES.modalidade;
    const IconeFederacao = ICONES.federacao;

    const [modalidades, setModalidades] = useState<Modalidade[]>([]);
    const [federacoes, setFederacoes] = useState<Federacao[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<unknown>(null);

    const carregar = () => {
        setCarregando(true);
        setErro(null);
        Promise.all([listarModalidades(), listarFederacoes()])
            .then(([catalogo, cadastradas]) => {
                setModalidades(catalogo);
                setFederacoes(cadastradas);
            })
            .catch(setErro)
            .finally(() => setCarregando(false));
    };

    useEffect(carregar, []);

    const excluir = async (federacao: Federacao) => {
        try {
            await removerFederacao(federacao.id);
            setFederacoes((atuais) => atuais.filter((outra) => outra.id !== federacao.id));
            avisos.sucesso(`${federacao.nome} foi excluída.`);
        } catch (causa) {
            // O servidor conta quantas equipes seguram a federação e diz na
            // mensagem; é o que a pessoa precisa para saber o que desvincular.
            avisos.erro(causa);
        }
    };

    return (
        <>
            <CabecalhoDaPagina
                conceito="cadastro"
                titulo="Cadastros"
                descricao="As modalidades e as federações que o resto do sistema referencia."
            />
            <CorpoDaPagina>
                {erro ? (
                    <Erro causa={erro} aoTentarDeNovo={carregar} />
                ) : (
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Secao
                            titulo="Modalidades"
                            descricao="Catálogo fixo do sistema, só para consulta."
                        >
                            {carregando ? (
                                <CarregandoLista linhas={6} />
                            ) : modalidades.length === 0 ? (
                                <Vazio
                                    conceito="modalidade"
                                    titulo="Catálogo vazio"
                                    descricao="Nenhuma modalidade disponível. Sem elas não é possível cadastrar equipe nem competição."
                                />
                            ) : (
                                <div className="space-y-2">
                                    {modalidades.map((modalidade) => (
                                        <Card key={modalidade.id}>
                                            <CardHeader>
                                                <CardTitle className="flex items-center justify-between gap-2 text-sm">
                                                    <span className="flex min-w-0 items-center gap-2">
                                                        <IconeModalidade className="size-4 shrink-0 text-muted-foreground" />
                                                        <span className="min-w-0 truncate">
                                                            {modalidade.nome}
                                                        </span>
                                                    </span>
                                                    <span className="flex shrink-0 items-center gap-1">
                                                        {!modalidade.ativo && (
                                                            <Badge variant="outline">
                                                                Inativa
                                                            </Badge>
                                                        )}
                                                        <Badge variant="secondary">
                                                            {modalidade.atletasEmQuadra} em
                                                            quadra
                                                        </Badge>
                                                    </span>
                                                </CardTitle>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </Secao>

                        <Secao
                            titulo="Federações"
                            descricao="Quem as equipes e os árbitros representam. Uma federação com equipe vinculada não pode ser excluída."
                            acao={
                                <FederacaoDialog
                                    aoSalvar={(criada) => {
                                        setFederacoes((atuais) => [...atuais, criada]);
                                        avisos.sucesso(`${criada.nome} cadastrada.`);
                                    }}
                                />
                            }
                        >
                            {carregando ? (
                                <CarregandoLista linhas={4} />
                            ) : federacoes.length === 0 ? (
                                <Vazio
                                    conceito="federacao"
                                    titulo="Nenhuma federação cadastrada"
                                    descricao="A equipe precisa de uma federação para ser cadastrada."
                                />
                            ) : (
                                <div className="space-y-2">
                                    {federacoes.map((federacao) => (
                                        <Card
                                            key={federacao.id}
                                            className="transition-colors hover:border-ring"
                                        >
                                            <CardHeader>
                                                <CardTitle className="flex items-center justify-between gap-2 text-sm">
                                                    <span className="flex min-w-0 items-center gap-2">
                                                        <IconeFederacao className="size-4 shrink-0 text-muted-foreground" />
                                                        <span className="min-w-0 truncate">
                                                            {federacao.nome}
                                                        </span>
                                                    </span>
                                                    <span className="flex shrink-0 items-center gap-1">
                                                        <FederacaoDialog
                                                            federacao={federacao}
                                                            aoSalvar={(salva) => {
                                                                setFederacoes((atuais) =>
                                                                    atuais.map((outra) =>
                                                                        outra.id === salva.id
                                                                            ? salva
                                                                            : outra,
                                                                    ),
                                                                );
                                                                avisos.sucesso(
                                                                    `${salva.nome} atualizada.`,
                                                                );
                                                            }}
                                                        />
                                                        <Confirmacao
                                                            gatilho={
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon-xs"
                                                                    aria-label={`Excluir ${federacao.nome}`}
                                                                    title="Excluir federação"
                                                                >
                                                                    <Trash2 />
                                                                </Button>
                                                            }
                                                            titulo={`Excluir ${federacao.nome}?`}
                                                            descricao="As equipes e os árbitros dela não são apagados. Com equipe vinculada, a exclusão é recusada e a mensagem diz quantas são."
                                                            rotuloDaAcao="Excluir federação"
                                                            aoConfirmar={() => excluir(federacao)}
                                                        />
                                                    </span>
                                                </CardTitle>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </Secao>
                    </div>
                )}
            </CorpoDaPagina>
        </>
    );
};

export default CadastroPage;
