import { ArrowRight, LayoutDashboard, LogIn } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AlternarTema } from "@/src/components/AlternarTema";
import { MarcaDoApp } from "@/src/features/acompanhamento/CascaPublica";
import { CompeticoesAbertas } from "@/src/features/apresentacao/CompeticoesAbertas";
import { PreviaDoProduto } from "@/src/features/apresentacao/PreviaDoProduto";
import { Conceito, ICONES } from "@/src/lib/icones";
import { PAINEL } from "@/src/lib/sessao/sessao";
import { organizadorAtual } from "@/src/lib/sessao/servidor";

const RECURSOS: { conceito: Conceito; titulo: string; descricao: string }[] = [
    {
        conceito: "competicao",
        titulo: "Competições e administrações",
        descricao: "Escolas, empresas e ligas organizam várias competições, cada uma com suas equipes inscritas.",
    },
    {
        conceito: "estrutura",
        titulo: "Estrutura em fases",
        descricao: "Pontos corridos, fase de grupos e mata-mata encadeados, conferidos antes de qualquer jogo existir.",
    },
    {
        conceito: "partida",
        titulo: "Partidas geradas de uma vez",
        descricao: "Um botão gera todos os confrontos; a fase seguinte nasce sozinha quando a anterior termina.",
    },
    {
        conceito: "sumula",
        titulo: "Súmula à beira do campo",
        descricao: "Gols, cartões e faltas lançados em um toque, com o segundo amarelo virando vermelho sozinho.",
    },
    {
        conceito: "classificacao",
        titulo: "Classificação e chave",
        descricao: "Tabela por grupo e chave da eliminatória calculadas a partir das partidas encerradas.",
    },
    {
        conceito: "calendario",
        titulo: "Link público ao vivo",
        descricao: "A torcida acompanha placar, lances e tabela pelo celular, sem login e sem poder alterar nada.",
    },
];

const PASSOS = [
    { titulo: "Monte", descricao: "Cadastre as equipes, desenhe as fases e gere as partidas." },
    { titulo: "Jogue", descricao: "Abra a súmula no celular e lance cada gol e cartão na hora." },
    { titulo: "Compartilhe", descricao: "Abra a competição ao público e mande o link no grupo." },
];

/**
 * A porta de entrada para quem ainda não entrou. Mostra o que o app faz e
 * leva a dois lugares: a entrada da organização e as competições abertas.
 */
const ApresentacaoPage = async () => {
    const organizador = await organizadorAtual();

    const chamada = organizador ? (
        <Button size="lg" nativeButton={false} render={<Link href={PAINEL} />}>
            <LayoutDashboard />
            Abrir o painel
        </Button>
    ) : (
        <Button size="lg" nativeButton={false} render={<Link href="/entrar" />}>
            <LogIn />
            Entrar
        </Button>
    );

    return (
        <div className="min-h-svh bg-background">
            <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
                <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-5 py-3 sm:px-6">
                    <MarcaDoApp />
                    <nav className="ml-auto flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            nativeButton={false}
                            className="hidden sm:inline-flex"
                            render={<a href="#recursos" />}
                        >
                            Recursos
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            nativeButton={false}
                            className="hidden sm:inline-flex"
                            render={<a href="#acompanhar" />}
                        >
                            Acompanhar
                        </Button>
                        <AlternarTema compacto />
                        {organizador ? (
                            <Button size="sm" nativeButton={false} render={<Link href={PAINEL} />}>
                                Painel
                            </Button>
                        ) : (
                            <Button size="sm" nativeButton={false} render={<Link href="/entrar" />}>
                                Entrar
                            </Button>
                        )}
                    </nav>
                </div>
            </header>

            <main>
                <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
                    <div className="space-y-6">
                        <p className="text-sm font-medium text-primary">
                            Gestão de competições esportivas amadoras
                        </p>
                        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                            Organize o torneio. A torcida acompanha ao vivo.
                        </h1>
                        <p className="max-w-xl text-lg text-muted-foreground text-pretty">
                            Monte as fases, gere os jogos, registre a súmula à beira do campo e
                            compartilhe um link para todo mundo ver placar e classificação na hora.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {chamada}
                            <Button
                                size="lg"
                                variant="outline"
                                nativeButton={false}
                                render={<a href="#acompanhar" />}
                            >
                                Ver competições abertas
                                <ArrowRight />
                            </Button>
                        </div>
                    </div>
                    <PreviaDoProduto />
                </section>

                <section id="recursos" className="scroll-mt-20 border-t border-border bg-muted/30">
                    <div className="mx-auto w-full max-w-6xl space-y-8 px-5 py-14 sm:px-6">
                        <div className="max-w-2xl space-y-2">
                            <h2 className="text-2xl font-semibold tracking-tight">
                                Do sorteio ao apito final
                            </h2>
                            <p className="text-muted-foreground">
                                Tudo o que a organização de um campeonato de escola, empresa ou bairro
                                faz hoje em planilha e papel.
                            </p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {RECURSOS.map(({ conceito, titulo, descricao }) => {
                                const Icone = ICONES[conceito];
                                return (
                                    <div
                                        key={titulo}
                                        className="space-y-3 rounded-3xl border border-border bg-card px-5 py-5"
                                    >
                                        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                            <Icone className="size-5" />
                                        </span>
                                        <h3 className="font-medium">{titulo}</h3>
                                        <p className="text-sm text-muted-foreground">{descricao}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6">
                    <ol className="grid gap-6 sm:grid-cols-3">
                        {PASSOS.map((passo, i) => (
                            <li key={passo.titulo} className="space-y-2">
                                <span className="numero-tabular flex size-9 items-center justify-center rounded-full bg-primary font-mono text-sm font-semibold text-primary-foreground">
                                    {i + 1}
                                </span>
                                <h3 className="font-medium">{passo.titulo}</h3>
                                <p className="text-sm text-muted-foreground">{passo.descricao}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section id="acompanhar" className="scroll-mt-20 border-t border-border">
                    <div className="mx-auto w-full max-w-6xl space-y-6 px-5 py-14 sm:px-6">
                        <div className="max-w-2xl space-y-2">
                            <h2 className="text-2xl font-semibold tracking-tight">
                                Competições abertas ao público
                            </h2>
                            <p className="text-muted-foreground">
                                Sem login: escolha uma e acompanhe os jogos, os lances e a
                                classificação.
                            </p>
                        </div>
                        <CompeticoesAbertas />
                    </div>
                </section>
            </main>

            <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
                Meu Torneio · Trabalho de Conclusão de Curso · Unifor
            </footer>
        </div>
    );
};

export default ApresentacaoPage;
