import * as React from "react"

interface DuoGridProps {
    left?: { title: string, content: React.ReactNode },
    right?: { title: string, content: React.ReactNode },
}

export const DuoGrid = ({ left, right }: DuoGridProps) => {
    return (
        <div className="p-8 flex-1 flex flex-col text-black">
            <div className="grid grid-cols-3 gap-8 flex-1">
                <div className="col-span-2 flex flex-col">
                    <h1 className="text-2xl font-bold mb-4">{left?.title}</h1>
                    {left?.content}
                </div>
                <div className="col-span-1 flex flex-col">
                    <h1 className="text-2xl font-bold mb-4"> {right?.title} </h1>
                    {right?.content}
                </div>
            </div>
        </div>
    )
}
