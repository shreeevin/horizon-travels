import authService from '@/services/authService';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserMenuContent } from './user-menu-content-landing';

import dynamic from 'next/dynamic';
const UserInfo = dynamic(() => import('./user-info').then((mod) => mod.UserInfo), {
    ssr: false
});

export function NavUserLanding() {
    const user = authService.getUser();
    const showEmail = true;
    const showInfo = false;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <UserInfo user={user} showEmail={showEmail} showInfo={showInfo} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <UserMenuContent user={user} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}