import { Acompanhamento } from "@/src/features/acompanhamento/Acompanhamento";

const LayoutDoAcompanhamento = async ({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) => {
    const { id } = await params;

    return <Acompanhamento idCompeticao={Number(id)}>{children}</Acompanhamento>;
};

export default LayoutDoAcompanhamento;
