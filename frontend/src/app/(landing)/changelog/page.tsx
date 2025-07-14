"use client";

import { Compartment } from "@/components/blocks/compartment";
import { Badge } from "@/components/ui/badge";
import changelogService from "@/services/changelogService";
import { Changelog, ErrorResponse } from "@/types/changelog";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ChangelogPage() {
    const [changelogs, setChangelogs] = useState<Changelog[]>([]);
    const fetchChangelogs = async () => {
        try {
            const response = await changelogService.all();
            setChangelogs(response.data);
        } catch (err: ErrorResponse | any) {
            const errorMessage = err.response.data.message || "An error occurred. Please try again.";
            toast.error("Oops, " + errorMessage);
        }
    };

    useEffect(() => {      
        fetchChangelogs();
    }, []);  

    return (
        <Compartment>
            <section className="py-32">
                <div className="w-full">
                    <div className="w-full">
                        <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
                            Horizon Changelog
                        </h1>
                        <p className="mb-6 text-base text-muted-foreground md:text-lg">
                            Get the latest updates and improvements to our platform.
                        </p>
                    </div>
                    <div className="mt-16 max-w-3xl space-y-16 md:mt-24 md:space-y-24">
                        {changelogs.map((changelog, index) => (
                            <div
                                key={index}
                                className="relative flex flex-col gap-4 md:flex-row md:gap-16"
                            >
                            <div className="top-8 flex h-min w-64 shrink-0 items-center gap-4 md:sticky">
                                <Badge variant="secondary" className="text-xs">
                                    Version {changelog.version}
                                </Badge>
                                <span className="text-xs font-medium text-muted-foreground">
                                    {format(new Date(changelog.created_at), 'dd MMMM, yyyy')}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <h2 className="mb-3 text-lg leading-tight font-bold text-foreground/90 md:text-2xl">
                                    {changelog.name}
                                </h2>
                                <div
                                    className="tiptap text-muted-foreground text-sm "
                                    dangerouslySetInnerHTML={{ __html: changelog.content }}
                                />                                
                            </div>
                            </div>
                        ))}
                        </div>
                    </div>
            </section>
        </Compartment>
    );
}