import React from "react";
import { Compartment } from "@/components/blocks/compartment";
import Link from 'next/link';
import AppLogoIcon from "./app-logo-icon";

interface FooterProps {
    logo?: {
        url: string;
        title?: string;
    };
    sections?: Array<{
        title: string;
        links: Array<{ name: string; href: string }>;
    }>;
    description?: string;
    copyright?: string;
    legalLinks?: Array<{
        name: string;
        href: string;
    }>;
}

const defaultSections = [
    {
        title: "App",
        links: [
            { name: "Popular Routes", href: "/popular-routes" },
            { name: "Top Destination", href: "/top-destination" },
            { name: "Popular Station", href: "/popular-station" },
        ],
    },
    {
        title: "Company",
        links: [
            { name: "About", href: "/about" },
            { name: "Changelog", href: "/changelog" },
            { name: "Contact", href: "/contact" },
        ],
    },
    {
        title: "Resources",
        links: [
            { name: "Help", href: "/help" },
            { name: "Sales", href: "/legal/sales-policy" },
            { name: "Advertise", href: "/legal/advertisement-policy" },
            { name: "Refund", href: "/legal/refund-policy" },
        ],
    },
];

const defaultLegalLinks = [
    { name: "Terms and Conditions", href: "/legal/terms-and-conditions" },
    { name: "Privacy Policy", href: "/legal/privacy-policy" },
];

const Footer = ({
    logo = {
        url: "/",
        title: "Horizon Travel",
    },
    sections = defaultSections,
    description = "Discover the world with Horizon Travels",
    copyright = "Horizon Travels. All rights reserved.",
    legalLinks = defaultLegalLinks,
}: FooterProps) => {
    const currentYear = new Date().getFullYear();

    return (
        <Compartment>
            <section className="py-32">
                <div className="w-full">
                    <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
                        <div className="flex w-full flex-col justify-between gap-6 lg:items-start">
                            <div className="flex items-center gap-2 lg:justify-start">
                                <Link href={logo.url}>
                                    <AppLogoIcon className="size-8 rounded-lg fill-current text-back dark:text-white" />              
                                </Link>
                                <h2 className="text-xl font-semibold">{logo.title}</h2>
                            </div>
                            <p className="text-muted-foreground max-w-[70%] text-sm">
                                {description}
                            </p>
                        </div>
                        <div className="grid w-full gap-6 md:grid-cols-3 lg:gap-20">
                            {sections.map((section, sectionIdx) => (
                                <div key={sectionIdx}>
                                    <h3 className="mb-4 font-bold">{section.title}</h3>
                                    <ul className="text-muted-foreground space-y-3 text-sm">
                                    {section.links.map((link, linkIdx) => (
                                        <li
                                            key={linkIdx}
                                            className="hover:text-primary font-medium"
                                        >
                                            <Link href={link.href}>
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                    </ul>
                            </div>
                            ))}
                        </div>
                    </div>
                    <div className="text-muted-foreground mt-8 flex flex-col justify-between gap-4 border-t py-8 text-xs font-medium md:flex-row md:items-center md:text-left">
                        <p className="order-2 lg:order-1">© {currentYear} {copyright}</p>
                        <ul className="order-1 flex flex-col gap-2 md:order-2 md:flex-row">
                            {legalLinks.map((link, idx) => (
                                <li key={idx} className="hover:text-primary">
                                    <Link href={link.href}> {link.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>
        </Compartment>
    );
};

export { Footer };
