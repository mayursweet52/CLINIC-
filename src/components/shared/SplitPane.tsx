import React from "react"
import { cn } from "@/lib/utils"

export interface SplitPaneProps {
  main: React.ReactNode;
  inspector: React.ReactNode;
  mainCols?: 7 | 8 | 9;
}

const mainColsLookup = {
  7: "lg:col-span-7",
  8: "lg:col-span-8",
  9: "lg:col-span-9",
}

const inspectorColsLookup = {
  7: "lg:col-span-5",
  8: "lg:col-span-4",
  9: "lg:col-span-3",
}

export function SplitPane({ 
  main, 
  inspector, 
  mainCols = 8, 
}: SplitPaneProps) {
  const mainClass = mainColsLookup[mainCols] || "lg:col-span-8"
  const inspectorClass = inspectorColsLookup[mainCols] || "lg:col-span-4"

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className={cn(mainClass, "flex flex-col gap-4 min-w-0")}>
        {main}
      </div>
      <div className={cn(inspectorClass, "lg:sticky lg:top-24")}>
        {inspector}
      </div>
    </div>
  );
}
