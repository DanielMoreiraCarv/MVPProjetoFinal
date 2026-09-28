import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Página de conferência da base visual. Existe para a revisão da entrega de
// tokens poder ser feita olhando, nos dois temas, em vez de lendo CSS. Sai do
// repositório quando o redesign terminar.

const SUPERFICIES = [
    { nome: "background", classe: "bg-background", texto: "text-foreground" },
    { nome: "card", classe: "bg-card", texto: "text-card-foreground" },
    { nome: "popover", classe: "bg-popover", texto: "text-popover-foreground" },
    { nome: "muted", classe: "bg-muted", texto: "text-muted-foreground" },
    { nome: "secondary", classe: "bg-secondary", texto: "text-secondary-foreground" },
    { nome: "accent", classe: "bg-accent", texto: "text-accent-foreground" },
];

const ACOES = [
    { nome: "primary", classe: "bg-primary", texto: "text-primary-foreground" },
    { nome: "destructive", classe: "bg-destructive", texto: "text-destructive-foreground" },
    { nome: "success", classe: "bg-success", texto: "text-success-foreground" },
    { nome: "warning", classe: "bg-warning", texto: "text-warning-foreground" },
];

const RAIOS = ["rounded-sm", "rounded-md", "rounded-lg", "rounded-xl", "rounded-2xl", "rounded-3xl", "rounded-4xl"];

const VARIANTES = ["default", "secondary", "outline", "ghost", "destructive", "link"] as const;
const TAMANHOS = ["xs", "sm", "default", "lg"] as const;

const Secao = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
    <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {titulo}
        </h2>
        {children}
    </section>
);

const TokensPage = () => {
    return (
        <div className="mx-auto w-full max-w-5xl space-y-10 px-5 py-8">
            <header className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">Base visual</h1>
                <p className="text-sm text-muted-foreground">
                    Alterne o tema no canto superior direito: tudo aqui é token, então
                    nada deve perder contraste nem trocar de cor fora de hora.
                </p>
            </header>

            <Secao titulo="Superfícies">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {SUPERFICIES.map(({ nome, classe, texto }) => (
                        <div
                            key={nome}
                            className={`${classe} ${texto} rounded-xl border border-border p-4`}
                        >
                            <p className="font-medium">{nome}</p>
                            <p className="text-sm opacity-80">
                                Texto sobre a superfície, no par previsto.
                            </p>
                        </div>
                    ))}
                </div>
            </Secao>

            <Secao titulo="Cor de ação e de estado">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {ACOES.map(({ nome, classe, texto }) => (
                        <div key={nome} className={`${classe} ${texto} rounded-xl p-4`}>
                            <p className="font-medium">{nome}</p>
                            <p className="text-sm opacity-90">Aa 123</p>
                        </div>
                    ))}
                </div>
            </Secao>

            <Secao titulo="Raios">
                <div className="flex flex-wrap gap-3">
                    {RAIOS.map((raio) => (
                        <div
                            key={raio}
                            className={`${raio} flex size-20 items-center justify-center border border-border bg-card text-xs text-muted-foreground`}
                        >
                            {raio.replace("rounded-", "")}
                        </div>
                    ))}
                </div>
            </Secao>

            <Secao titulo="Botões">
                <div className="space-y-3">
                    {TAMANHOS.map((tamanho) => (
                        <div key={tamanho} className="flex flex-wrap items-center gap-2">
                            <span className="w-16 text-xs text-muted-foreground">{tamanho}</span>
                            {VARIANTES.map((variante) => (
                                <Button key={variante} variant={variante} size={tamanho}>
                                    {variante}
                                </Button>
                            ))}
                        </div>
                    ))}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="w-16 text-xs text-muted-foreground">inativo</span>
                        {VARIANTES.map((variante) => (
                            <Button key={variante} variant={variante} disabled>
                                {variante}
                            </Button>
                        ))}
                    </div>
                </div>
            </Secao>

            <Secao titulo="Tipografia">
                <Card>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-3xl font-semibold tracking-tight">
                                Interclasses Colégio São João
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Futebol de campo · Masculino · 16 equipes
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                Número em coluna, com e sem largura fixa
                            </p>
                            <div className="grid max-w-xs grid-cols-2 gap-x-6 text-sm">
                                <div className="space-y-0.5">
                                    {["11 · 118", "7 · 41", "19 · 203"].map((linha) => (
                                        <p key={linha} className="numero-tabular font-mono">
                                            {linha}
                                        </p>
                                    ))}
                                </div>
                                <div className="space-y-0.5 text-muted-foreground">
                                    {["11 · 118", "7 · 41", "19 · 203"].map((linha) => (
                                        <p key={linha}>{linha}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Secao>

            <Secao titulo="Formulário e etiqueta">
                <Card>
                    <CardHeader>
                        <CardTitle>Nova competição</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="amostra-nome">Nome</Label>
                                <Input id="amostra-nome" placeholder="Copa de verão" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="amostra-erro">Com erro</Label>
                                <Input id="amostra-erro" aria-invalid defaultValue="" />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge>Em andamento</Badge>
                            <Badge variant="secondary">Rascunho</Badge>
                            <Badge variant="outline">Encerrada</Badge>
                            <Badge variant="destructive">Cancelada</Badge>
                        </div>
                    </CardContent>
                </Card>
            </Secao>
        </div>
    );
};

export default TokensPage;
