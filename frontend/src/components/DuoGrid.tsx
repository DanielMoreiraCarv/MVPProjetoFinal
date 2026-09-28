import * as React from "react"

interface DuoGridProps {
    left?: { title: string, content: React.ReactNode },
    right?: { title: string, content: React.ReactNode },
}

export const DuoGrid = ({ left, right }: DuoGridProps) => {
    return (
        <div className="flex-1 flex flex-col">
            <div className="grid grid-cols-3 gap-8 flex-1">
                <div className="col-span-2 flex flex-col">
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{left?.title}</h2>
                    {left?.content}
                </div>
                <div className="col-span-1 flex flex-col">
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground"> {right?.title} </h2>
                    {right?.content}
                </div>
            </div>
        </div>
    )
}
