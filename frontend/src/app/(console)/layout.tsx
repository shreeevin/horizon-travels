"use client";

import { AppContent } from '@/components/blocks/app-content';
import { AppShell } from '@/components/blocks/app-shell';
import { AppSidebar } from '@/components/blocks/app-sidebar';
import { AppSidebarHeader } from '@/components/blocks/app-sidebar-header';
import { type PropsWithChildren } from 'react';

import { AuthProvider } from "@/contexts/AuthContext";
import { BreadcrumbsProvider, useBreadcrumbs } from "@/contexts/BreadcrumbsContext";

function LayoutContent({ children }: PropsWithChildren) {
    const { breadcrumbs } = useBreadcrumbs();

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}

export default function AppSidebarLayout({ children }: PropsWithChildren) {
    return (
        <AuthProvider>
            <BreadcrumbsProvider>
                <LayoutContent>{children}</LayoutContent>
            </BreadcrumbsProvider>
        </AuthProvider>
    );
}