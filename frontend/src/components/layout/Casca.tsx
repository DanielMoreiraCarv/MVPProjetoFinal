"use client";

import { Drawer } from "@base-ui/react/drawer";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NomeDoApp } from "@/src/components/Emblema";
import { ConteudoDoMenu } from "@/src/components/layout/MenuLateral";
import { PaletaDeCompeticoes } from "@/src/components/layout/PaletaDeCompeticoes";
import { ProvedorDeEscopo } from "@/src/lib/escopo";
import { UsuarioDaSessao } from "@/src/lib/sessao/sessao";

const CHAVE_RECOLHIDO = "tcc.menu.recolhido";

export const Casca = ({
    organizador,
    children,
}: {
    organizador: UsuarioDaSessao;
    children: React.ReactNode;
}) => {
    const [recolhido, setRecolhido] = useState(false);
    const [gavetaAberta, setGavetaAberta] = useState(false);
    const caminho = usePathname();

    useEffect(() => {
        setRecolhido(localStorage.getItem(CHAVE_RECOLHIDO) === "1");
    }, []);

    // A gaveta do celular fecha ao navegar: deixá-la aberta sobre a página
    // nova esconde justamente o que a pessoa acabou de pedir.
    useEffect(() => {
        setGavetaAberta(false);
    }, [caminho]);

    const alternarRecolhido = () => {
        setRecolhido((antes) => {
            const novo = !antes;
            localStorage.setItem(CHAVE_RECOLHIDO, novo ? "1" : "0");
            return novo;
        });
    };

    return (
        <ProvedorDeEscopo>
            <div className="flex min-h-svh bg-background print:block print:min-h-0">
                {/* Mesa: menu fixo, recolhível para uma trilha de ícones. */}
                <aside
                    className={cn(
                        "sticky top-0 hidden h-svh shrink-0 border-r border-sidebar-border transition-[width] duration-200 md:block print:hidden",
                        recolhido ? "w-[4.5rem]" : "w-64",
                    )}
                >
                    <ConteudoDoMenu
                        organizador={organizador}
                        recolhido={recolhido}
                        aoRecolher={alternarRecolhido}
                    />
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    {/* Celular: barra com o botão da gaveta. */}
                    <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:hidden print:hidden">
                        <Drawer.Root open={gavetaAberta} onOpenChange={setGavetaAberta}>
                            <Drawer.Trigger
                                render={<Button variant="ghost" size="icon-sm" />}
                                aria-label="Abrir o menu"
                            >
                                <Menu />
                            </Drawer.Trigger>
                            <Drawer.Portal>
                                <Drawer.Backdrop className="fixed inset-0 z-40 bg-scrim data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
                                <Drawer.Popup className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-sidebar-border outline-none data-open:animate-in data-open:slide-in-from-left data-closed:animate-out data-closed:slide-out-to-left">
                                    <Drawer.Title className="sr-only">Menu</Drawer.Title>
                                    <ConteudoDoMenu
                                        organizador={organizador}
                                        aoNavegar={() => setGavetaAberta(false)}
                                    />
                                </Drawer.Popup>
                            </Drawer.Portal>
                        </Drawer.Root>
                        <NomeDoApp />
                    </div>

                    <main className="flex min-w-0 flex-1 flex-col">{children}</main>
                </div>
            </div>
            <PaletaDeCompeticoes />
        </ProvedorDeEscopo>
    );
};
