import Link from "next/link"

const Header = () => {
    return (
        <header className="flex items-center w-full bg-green-950 text-white px-5 py-3 shadow-md">
            <div className="flex items-center flex-1">
                <Link href="/" className="font-bold text-lg tracking-tight text-white hover:text-green-200 transition-colors">
                    Meu Torneio
                </Link>
            </div>
            <nav className="flex items-center gap-6 text-sm">
                <Link href="/administracoes" className="text-green-200 hover:text-white transition-colors">
                    Administrações
                </Link>
            </nav>
            <div className="flex-1" />
        </header>
    )
};

export default Header;
