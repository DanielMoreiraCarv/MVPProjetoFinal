import { CabecalhoDaPagina, CorpoDaPagina } from "@/src/components/layout/CabecalhoDaPagina";
import { AdministracoesDuoGrid } from "@/src/features/administracoes/administracoesDuoGrid";

// O conteúdo ainda é a tela antiga; o que muda aqui é a moldura. A tela em si
// é reescrita na entrega da página de administrações.
const AdministracaoPage = () => (
    <>
        <CabecalhoDaPagina
            conceito="administracao"
            titulo="Administrações"
            descricao="Quem organiza as competições: liga, associação, escola."
        />
        <CorpoDaPagina>
            <AdministracoesDuoGrid />
        </CorpoDaPagina>
    </>
);

export default AdministracaoPage;
