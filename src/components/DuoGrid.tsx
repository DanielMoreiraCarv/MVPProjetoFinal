import * as React from "react"

interface DuoGridProps {
    left?: React.ReactNode,
    right?: React.ReactNode,
}

export const DuoGrid = ({ left, right }: DuoGridProps) => {
    return (
        <div className="p-8 flex-1 flex flex-col text-black">
            <div className="grid grid-cols-3 gap-8 flex-1">
                <div className="col-span-2 flex flex-col">
                    <h1 className="text-2xl font-bold mb-4">Minhas Administrações</h1>
                    {left}
                </div>
                <div className="col-span-1 flex flex-col">
                    <h1 className="text-2xl font-bold mb-4"> Campeonatos </h1>
                    {right}
                </div>
            </div>
        </div>
    )
}
