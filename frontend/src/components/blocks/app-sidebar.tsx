import { NavFooter } from '@/components/blocks/nav-footer';
import { NavMain } from '@/components/blocks/nav-main';
import { NavUser } from '@/components/blocks/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types/index';
import Link from "next/link";
import { BookOpen, Folder, LayoutGrid, ReceiptText, TicketCheck, Calendar, Tickets, Users, Route, LoaderCircle, Command, File, LifeBuoy, MapPinned, MessageCircle, FileClockIcon, TicketsPlane, CirclePoundSterling, ChartLineIcon, ChartSplineIcon } from 'lucide-react';
import AppLogo from './app-logo';
import authService from '@/services/authService';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminNavMain } from '@/components/blocks/admin-nav-main';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Bookings',
        href: '/bookings',
        icon: Tickets,
    },
    {
        title: 'Invoices',
        href: '/invoices',
        icon: CirclePoundSterling,
    }
];

const adminNavItems: NavItem[] = [
    {
        title: 'Analytics',
        href: '/admin',
        icon: ChartSplineIcon,
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Destinations',
        href: '/admin/destinations',
        icon: MapPinned,
    },
    {
        title: 'Avenues',
        href: '/admin/avenues',
        icon: Route,
    },
    {
        title: 'Bookings',
        href: '/admin/bookings',
        icon: TicketsPlane,
    },
    {
        title: 'Transactions',
        href: '/admin/transactions',
        icon: CirclePoundSterling,
    },
    {
        title: 'Legal',
        href: '/admin/legal',
        icon: File,
    },
    {
        title: 'Faqs',
        href: '/admin/faqs',
        icon: LifeBuoy,
    }, 
    {
        title: 'Contacts',
        href: '/admin/contacts',
        icon: MessageCircle,
    },
    {
        title: 'Changelogs',
        href: '/admin/changelogs',
        icon: FileClockIcon,
    }
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/horizen/horizen',
        icon: Folder,
    },
    {
        title: 'Author',
        href: 'https://horizen.com',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const router = useRouter();
    const [processing, setProcessing] = useState(true);
    const  [isAdmin, setIsAdmin] = useState(false);
    useEffect(() => {    
        setProcessing(true);
        const isAuthenticated = authService.isAuthenticated();
                
        if (!isAuthenticated) {
            router.push("/login");
        } else {
            setIsAdmin(authService.isAdmin());
            setProcessing(false);
        }
    }, []);

    if (processing) {
        return null;
    }
    
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                {
                    isAdmin && (
                        <AdminNavMain items={adminNavItems} /> 
                    )
                }
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto hidden" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}