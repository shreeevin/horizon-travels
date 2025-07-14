"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { type BreadcrumbItem } from "@/types";

type BreadcrumbsContextType = {
    breadcrumbs: BreadcrumbItem[];
    setBreadcrumbs: (items: BreadcrumbItem[]) => void;
};

const BreadcrumbsContext = createContext<BreadcrumbsContextType | undefined>(undefined);

export function BreadcrumbsProvider({ children }: { children: ReactNode }) {
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
    
    return (
        <BreadcrumbsContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
            {children}
        </BreadcrumbsContext.Provider>
    );
}

export function useBreadcrumbs() {
    const context = useContext(BreadcrumbsContext);
    if (!context) {
        throw new Error("useBreadcrumbs must be used within a BreadcrumbsProvider");
    }

    return context;
}
