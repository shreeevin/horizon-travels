"use client";

import authService from "@/services/authService";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { BreadcrumbItem } from "@/types";
import { useBreadcrumbs } from "@/contexts/BreadcrumbsContext";
import HeadingSmall from "@/components/blocks/heading-small";
import Image from 'next/image';
import { format } from 'date-fns';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile',
        href: '/profile',
    },
];

export default function Profile() {
    const { setBreadcrumbs } = useBreadcrumbs();
    const user = authService.getUser();

    useEffect(() => {
        setBreadcrumbs(breadcrumbs);
    }, []);

    const formattedDate = format(new Date(user.created_at), 'dd MMMM, yyyy');

    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl px-4 py-6">
            <div className="my-4">
                <HeadingSmall
                    title="User profile"
                    description="See your profile information"
                />
                <div className="relative max-w-md border border-muted-foreground/10 rounded-lg my-8">
                    <div className="relative">
                        <div className="w-full h-24 bg-muted-foreground/10 rounded-t-lg"></div>
                        <div className="absolute bottom-[-24px] left-4">
                            <Image
                                src={user.avatar}
                                width={48}
                                height={48}
                                alt={user.username}
                                className="rounded-full border-2 bg-muted-foreground shadow-md"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-8 max-w-md p-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-muted-foreground">Username</span>
                            <p className="text-sm font-medium text-foreground">{user.username}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-muted-foreground">Email</span>
                            <p className="text-sm font-medium text-foreground">{user.email}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-muted-foreground">Role</span>
                            <p className="text-sm font-medium text-foreground capitalize">{user.role}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-muted-foreground">Joined</span>
                            <p className="text-sm font-medium text-foreground">{formattedDate}</p>
                        </div>                        
                    </div>
                </div>
            </div>
        </div>
    );
}