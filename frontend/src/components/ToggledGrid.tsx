"use client"

import * as React from "react"
import { useState } from "react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"


type ToggleListMember = { title: string, content: React.ReactNode }

interface ToggledGridProps {
    left?: ToggleListMember,
    right?: ToggleListMember[],
}

export const ToggledGrid = ({ left, right }: ToggledGridProps) => {
    let initialTab: ToggleListMember = { title: "Empty", content: <></> };
    if ((right !== undefined) && (right?.length > 0)) {
        initialTab = right[0];
    }

    const [activeTab, setActiveTab] = useState(initialTab)

    const activeTabTitle = activeTab.title;
    const activeContent = activeTab.content;

    return (
        <div className="p-8 flex-1 flex flex-col text-black">
            <div className="grid grid-cols-3 gap-8 flex-1">
                <div className="col-span-1 flex flex-col">
                    <h1 className="text-2xl font-bold mb-4">{left?.title}</h1>
                    {left?.content}
                </div>
                <div className="col-span-2 flex flex-col">
                    <ToggleGroup
                        value={[activeTabTitle]}
                        onValueChange={(val) => {
                            const selected = val[val.length - 1];
                            if (selected) {
                                const foundTab = right?.find(item => item.title === selected) || initialTab;
                                setActiveTab(foundTab);
                            }
                        }}
                        spacing={0}
                        variant="outline"
                        className="mb-4"
                    >
                        {
                            right?.map((item, index) => (
                                <ToggleGroupItem key={index} value={item.title}>
                                    {item.title}
                                </ToggleGroupItem>
                            ))
                        }
                    </ToggleGroup>
                    <div className="flex-1">
                        {activeContent}
                    </div>
                </div>
            </div>
        </div>
    )
}
