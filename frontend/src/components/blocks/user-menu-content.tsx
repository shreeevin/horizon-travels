import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types/auth';
import Link from "next/link";
import { LogOut, Settings, UserCircle } from 'lucide-react';

import { useRouter } from 'next/navigation';
import authService from '@/services/authService';

import dynamic from 'next/dynamic';
const UserInfo = dynamic(() => import('./user-info').then((mod) => mod.UserInfo), {
    ssr: false
});

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const router = useRouter();

    const handleLogout = () => {
        authService.logout();
        router.replace("/login");
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href="/profile" onClick={cleanup}>
                        <UserCircle className="mr-2" />
                        Profile
                    </Link>
                </DropdownMenuItem>      
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href="/setting" onClick={cleanup}>
                        <Settings className="mr-2" />
                        Setting
                    </Link>
                </DropdownMenuItem>                
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2" />
                Log out
            </DropdownMenuItem>
        </>
    );
}