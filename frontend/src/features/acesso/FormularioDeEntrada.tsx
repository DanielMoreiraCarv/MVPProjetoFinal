"use client";

import { LogIn } from "lucide-react";
import { useActionState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EstadoDaEntrada, entrar } from "@/src/lib/sessao/acoes";
import { ORGANIZADOR_DE_DEMONSTRACAO } from "@/src/lib/sessao/sessao";

export const FormularioDeEntrada = ({ de }: { de?: string }) => {
    const [estado, enviar, enviando] = useActionState<EstadoDaEntrada, FormData>(entrar, {});
    const email = useRef<HTMLInputElement>(null);
    const senha = useRef<HTMLInputElement>(null);

    const preencherDemonstracao = () => {
        if (email.current) email.current.value = ORGANIZADOR_DE_DEMONSTRACAO.email;
        if (senha.current) senha.current.value = ORGANIZADOR_DE_DEMONSTRACAO.senha;
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

            <div className="space-y-2 rounded-2xl border border-dashed border-border px-4 py-3 text-sm">
                <p className="font-medium">Acesso de demonstração</p>
                <p className="text-xs text-muted-foreground">
                    O cadastro de usuários ainda está em construção. Por enquanto há um acesso único:{" "}
                    <span className="font-mono text-foreground">{ORGANIZADOR_DE_DEMONSTRACAO.email}</span>{" "}
                    / <span className="font-mono text-foreground">{ORGANIZADOR_DE_DEMONSTRACAO.senha}</span>
                </p>
                <Button type="button" variant="outline" size="sm" onClick={preencherDemonstracao}>
                    Preencher para mim
                </Button>
            </div>
        </form>
    );
};
