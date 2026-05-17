import Link from "next/link"

const Header = () => {
    return (
        <header className="flex items-center w-full bg-green-950">
            <div className="flex items-center flex-1">
                <Link href="/">
                    <span className="ml-3">
                        Início
                    </span>
                </Link>
            </div>
            <nav className="ml-3 mr-3 flex items-center gap-6">
                <Link href="/administracoes">
                    Administrações
                </Link>
            </nav>
            <div className="flex-1">
            </div>
        </header>
    )
};

export default Header;