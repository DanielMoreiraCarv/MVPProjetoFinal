"use client";

import { Button } from "@/components/ui/button";
import { Confirmacao } from "@/src/components/estado/Confirmacao";
import {
    CarregandoCartoes,
    CarregandoLista,
    CarregandoTabela,
    Erro,
    Vazio,
} from "@/src/components/estado/Estados";
import { ApiError } from "@/src/lib/api/client";
import { useAvisos } from "@/src/lib/avisos";

const Bloco = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
    <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{titulo}</p>
        {children}
    </div>
);

export const AmostraDeEstados = () => {
    const avisos = useAvisos();

    return (
        <div className="space-y-6">
            <Bloco titulo="Carregando — lista">
                <CarregandoLista linhas={2} />
            </Bloco>

            <Bloco titulo="Carregando — cartões">
                <CarregandoCartoes cartoes={3} />
            </Bloco>

            <Bloco titulo="Carregando — tabela">
                <CarregandoTabela linhas={3} colunas={5} />
            </Bloco>

            <Bloco titulo="Vazio">
                <Vazio
                    conceito="equipe"
                    titulo="Nenhuma equipe inscrita"
                    descricao="Inscreva as equipes que vão disputar esta competição."
                    acao={<Button size="sm">Inscrever equipe</Button>}
                />
            </Bloco>

            <Bloco titulo="Erro">
                <Erro
                    causa={
                        new ApiError(
                            400,
                            "A equipe visitante deve ser diferente da mandante.",
                        )
                    }
                    aoTentarDeNovo={() => {
                        avisos.aviso("Tentaria de novo aqui.");
                    }}
                />
            </Bloco>

            <Bloco titulo="Confirmação e aviso">
                <div className="flex flex-wrap gap-2">
                    <Confirmacao
                        gatilho={<Button variant="destructive">Excluir competição</Button>}
                        titulo="Excluir a competição?"
                        descricao="As partidas e a classificação vão junto. Não dá para desfazer."
                        rotuloDaAcao="Excluir competição"
                        aoConfirmar={() => {
                            avisos.sucesso("Competição excluída.");
                        }}
                    />
                    <Button variant="outline" onClick={() => {
                            avisos.sucesso("Competição salva.");
                        }}>
                        Aviso de sucesso
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            avisos.erro(
                                new ApiError(409, "Já existe uma equipe com esse nome."),
                            );
                        }}
                    >
                        Aviso de erro
                    </Button>
                </div>
            </Bloco>
        </div>
    );
};
