import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AlternarTema } from "@/src/components/AlternarTema";
import { FormularioDeCadastro } from "@/src/features/acesso/FormularioDeCadastro";
import { MarcaDoApp } from "@/src/features/acompanhamento/CascaPublica";

export const metadata = { title: "Criar conta · Meu Torneio" };

const CriarContaPage = () => (
    <div className="flex min-h-svh flex-col bg-background">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
            <MarcaDoApp />
            <AlternarTema compacto />
        </header>

        <main className="flex flex-1 items-center justify-center px-5 py-10">
            <div className="w-full max-w-sm space-y-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Criar conta</h1>
                    <p className="text-sm text-muted-foreground">
                        Monte suas competições e convide quem organiza com você.
                    </p>
                </div>
                <div className="rounded-3xl border border-border bg-card px-5 py-6 sm:px-6">
                    <FormularioDeCadastro />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                    Já tem conta?{" "}
                    <Link href="/entrar" className="font-medium text-primary hover:underline">
                        Entrar
                    </Link>
                </p>
                <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/" />}>
                    <ArrowLeft />
                    Voltar para o início
                </Button>
            </div>
        </main>
    </div>
);

export default CriarContaPage;
