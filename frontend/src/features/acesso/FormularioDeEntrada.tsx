"use client";

import { LogIn } from "lucide-react";
import { useActionState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EstadoDaEntrada, entrar } from "@/src/lib/sessao/acoes";

/**
 * Os usuários do conjunto de dados de teste (dados_de_teste.sql). A dica só
 * existe em desenvolvimento: no build de produção o bloco inteiro sai.
 */
const ACESSO_LOCAL = { email: "organizador@meutorneio.app", senha: "torneio123" };
const EM_DESENVOLVIMENTO = process.env.NODE_ENV === "development";

export const FormularioDeEntrada = ({ de }: { de?: string }) => {
    const [estado, enviar, enviando] = useActionState<EstadoDaEntrada, FormData>(entrar, {});
    const email = useRef<HTMLInputElement>(null);
    const senha = useRef<HTMLInputElement>(null);

    const preencherDemonstracao = () => {
        if (email.current) email.current.value = ACESSO_LOCAL.email;
        if (senha.current) senha.current.value = ACESSO_LOCAL.senha;
        senha.current?.focus();
    };

    return (
        <form action={enviar} className="space-y-4">
            {de && <input type="hidden" name="de" value={de} />}

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">E-mail</Label>
                {/* O e-mail volta preenchido depois de uma recusa; a chave
                    remonta o campo em vez de trocar o valor inicial dele. */}
                <Input
                    key={estado.email ?? ""}
                    ref={email}
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    defaultValue={estado.email}
                    required
                    aria-invalid={Boolean(estado.erro)}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="senha">Senha</Label>
                <Input
                    ref={senha}
                    id="senha"
                    name="senha"
                    type="password"
                    autoComplete="current-password"
                    required
                    aria-invalid={Boolean(estado.erro)}
                    aria-describedby={estado.erro ? "erro-da-entrada" : undefined}
                />
            </div>

            {estado.erro && (
                <p id="erro-da-entrada" role="alert" className="text-sm text-destructive">
                    {estado.erro}
                </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={enviando}>
                <LogIn />
                {enviando ? "Entrando…" : "Entrar"}
            </Button>

            {EM_DESENVOLVIMENTO && (
                <div className="space-y-2 rounded-2xl border border-dashed border-border px-4 py-3 text-sm">
                    <p className="font-medium">Ambiente local</p>
                    <p className="text-xs text-muted-foreground">
                        Os dados de teste trazem organização, administração e um torcedor sem acesso à
                        gestão, todos com a senha{" "}
                        <span className="font-mono text-foreground">{ACESSO_LOCAL.senha}</span>.
                    </p>
                    <Button type="button" variant="outline" size="sm" onClick={preencherDemonstracao}>
                        Entrar como organização
                    </Button>
                </div>
            )}
        </form>
    );
};
