"use client";

import { UserPlus } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EstadoDoCadastro, criarConta } from "@/src/lib/sessao/acoes";

const Campo = ({
    id,
    rotulo,
    erro,
    dica,
    ...entrada
}: {
    id: "nome" | "email" | "senha";
    rotulo: string;
    erro?: string;
    dica?: string;
} & React.ComponentProps<"input">) => (
    <div className="flex flex-col gap-1.5">
        <Label htmlFor={id}>{rotulo}</Label>
        <Input
            id={id}
            name={id}
            aria-invalid={Boolean(erro)}
            aria-describedby={erro || dica ? `${id}-ajuda` : undefined}
            {...entrada}
        />
        {(erro || dica) && (
            <p id={`${id}-ajuda`} className={erro ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
                {erro ?? dica}
            </p>
        )}
    </div>
);

export const FormularioDeCadastro = () => {
    const [estado, enviar, enviando] = useActionState<EstadoDoCadastro, FormData>(criarConta, {});

    return (
        <form action={enviar} className="space-y-4">
            {/* A chave remonta os campos com o valor devolvido, em vez de trocar o valor inicial deles. */}
            <Campo
                key={`nome-${estado.nome ?? ""}`}
                id="nome"
                rotulo="Seu nome ou o da organização"
                autoComplete="name"
                defaultValue={estado.nome}
                required
                maxLength={180}
                erro={estado.campos?.nome}
            />
            <Campo
                key={`email-${estado.email ?? ""}`}
                id="email"
                rotulo="E-mail"
                type="email"
                autoComplete="username"
                defaultValue={estado.email}
                required
                maxLength={180}
                erro={estado.campos?.email}
            />
            <Campo
                id="senha"
                rotulo="Senha"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={72}
                erro={estado.campos?.senha}
                dica="Ao menos 8 caracteres, com letra e número."
            />

            {estado.erro && (
                <p role="alert" className="text-sm text-destructive">
                    {estado.erro}
                </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={enviando}>
                <UserPlus />
                {enviando ? "Criando…" : "Criar conta"}
            </Button>
        </form>
    );
};
