"use client";

import AppLogoIcon from '@/components/blocks/app-logo-icon';
import { type PropsWithChildren } from 'react';
import Link from "next/link";

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

interface AuthQuote {
    author: string;
    message: string;
}

export default function AuthLayout({ children }: PropsWithChildren<AuthLayoutProps>) {
    const quote = { "author": "Horizon Travel", "message": "The journey of a thousand miles begins with a single step."} as AuthQuote;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-zinc-900" />
                <Link href="/" className="relative z-20 flex gap-2 items-center text-lg font-medium">
                    <AppLogoIcon className="size-8 rounded-lg fill-current text-back dark:text-white" />                    
                    Horizon Travel
                </Link>
                {quote && (
                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-2">
                            <p className="text-lg">&ldquo;{quote.message}&rdquo;</p>
                            <footer className="text-sm text-neutral-300">{quote.author}</footer>
                        </blockquote>
                    </div>
                )}
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link href="/" className="relative z-20 flex items-center justify-center lg:hidden">
                        <AppLogoIcon className="size-10 sm:size-12 rounded-lg fill-current text-back dark:text-white" />              
                    </Link>
                    {children}
                </div>
            </div>
        </div>
    );
}