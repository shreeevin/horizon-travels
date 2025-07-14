import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import authService from '@/services/authService';
import { ChevronsUpDown } from "lucide-react";
import { UserMenuContent } from "./user-menu-content";
import { useIsMobile } from '@/hooks/use-mobile';

import dynamic from 'next/dynamic';
const UserInfo = dynamic(() => import('./user-info').then((mod) => mod.UserInfo), {
    ssr: false
});

export function NavUser() {
    const { state } = useSidebar();
    const user = authService.getUser();
    const isMobile = useIsMobile();
    const showEmail = true;

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton size="lg" className="text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent group">
                            <UserInfo user={user} showEmail={showEmail} />
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="end"
                        side={isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'}
                    >
                        <UserMenuContent user={user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>        
    );
}