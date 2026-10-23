#!/usr/bin/env node
// Recusa cor fixa nas telas: toda cor tem que vir de token, senão o tema
// escuro fica com texto preto sobre fundo preto — que foi exatamente como
// `text-black` num contêiner escondeu quatro títulos ilegíveis.
//
// Roda no pre-commit junto do build, e à mão com `yarn cores`.
//
// Por que um grep e não uma regra de ESLint: classe do Tailwind é string, e
// nenhuma regra padrão olha dentro dela. O custo de errar aqui é alto e o de
// um grep é zero.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;

// Onde procurar. `components/ui` fica fora: são componentes de terceiro, e lá
// `bg-transparent` e `bg-black/30` (véu do diálogo) são corretos.
const ALVOS = ["app", "src"];

const PALETA =
    "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone";
const PREFIXO =
    "bg|text|border|ring|divide|outline|decoration|placeholder|caret|accent|shadow|from|via|to|fill|stroke";

const PROIBIDO = [
    {
        // bg-red-500, text-gray-400, border-green-700…
        regex: new RegExp(`\\b(?:${PREFIXO})-(?:${PALETA})-\\d{2,3}\\b`, "g"),
        porque: "cor da paleta do Tailwind; use o token (bg-card, text-muted-foreground, text-destructive…)",
    },
    {
        // text-black, bg-white — os que não têm número e passam por qualquer
        // varredura que só procure dígito.
        regex: /\b(?:bg|text|border|ring|divide|fill|stroke)-(?:black|white)\b/g,
        porque: "preto ou branco fixo; no tema escuro fica ilegível. Use foreground, background ou card",
    },
    {
        // text-[#1a1a1a], bg-[rgb(...)]
        regex: /\b(?:bg|text|border|ring|fill|stroke)-\[(?:#|rgb|hsl|oklch)[^\]]*\]/g,
        porque: "cor literal fora dos tokens",
    },
];

const arquivos = [];
const varrer = (dir) => {
    for (const nome of readdirSync(dir)) {
        const caminho = join(dir, nome);
        if (statSync(caminho).isDirectory()) varrer(caminho);
        else if (/\.(tsx|ts|css)$/.test(nome)) arquivos.push(caminho);
    }
};
for (const alvo of ALVOS) {
    try {
        varrer(join(RAIZ, alvo));
    } catch {
        /* pasta ainda não existe */
    }
}

const achados = [];
for (const caminho of arquivos) {
    // globals.css é onde os tokens são definidos: é o único lugar que pode
    // ter cor literal.
    if (caminho.endsWith("app/globals.css")) continue;

    const linhas = readFileSync(caminho, "utf8").split("\n");
    linhas.forEach((linha, i) => {
        for (const { regex, porque } of PROIBIDO) {
            for (const achado of linha.matchAll(regex)) {
                achados.push({
                    onde: `${relative(RAIZ, caminho)}:${i + 1}`,
                    classe: achado[0],
                    porque,
                });
            }
        }
    });
}

if (achados.length === 0) {
    console.log(`cores ok — ${arquivos.length} arquivos, nenhuma cor fora dos tokens`);
    process.exit(0);
}

console.error(`\n${achados.length} cor(es) fora dos tokens:\n`);
for (const { onde, classe, porque } of achados) {
    console.error(`  ${onde}\n    ${classe} — ${porque}`);
}
console.error(
    "\nOs tokens estão em app/globals.css e há uma amostra de todos em /tokens.\n",
);
process.exit(1);
