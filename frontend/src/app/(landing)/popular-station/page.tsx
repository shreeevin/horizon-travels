"use client";

import { Compartment } from "@/components/blocks/compartment";
import { useEffect, useState } from "react";
import { Destination, ErrorResponse, Modes } from "@/types/destination";
import { toast } from "sonner";
import destinationService from "@/services/destinationService";
import { ArrowRight } from "lucide-react";
import { ModeBadge } from "@/components/blocks/landing/mode-badge";
import { useRouter } from "next/navigation";
import slugify from "slugify";

export default function PopularStationPage() {
    const router = useRouter();
    const [destinations, setDestinations] = useState<Destination[]>([]);

    const fetchDestinations = async () => {
        try {
            const response = await destinationService.all();
            setDestinations(response.data);
        } catch (err: ErrorResponse | any) {
            const errorMessage = err.response.data.message || "An error occurred. Please try again.";
            toast.error("Oops, " + errorMessage);
        }
    };

    const getAvailableModes = (modes: Modes) => {
        const availableModes: string[] = [];
        if (modes.air) availableModes.push('air');
        if (modes.coach) availableModes.push('coach');
        if (modes.train) availableModes.push('train');
        return availableModes;
    };

    const handelLink = (destination: Destination) => {
        const journeyData = {
            from: destination.id,
            date: (new Date()).toISOString(),
            passenger: 1,
        };
        
        const slug = slugify(destination.name, { lower: true, strict: true });
        const encoded = encodeURIComponent(btoa(JSON.stringify(journeyData)));
        router.push(`/journey/${slug}?book=${encoded}`);
    }

    useEffect(() => {       
        fetchDestinations();
    }, []);

    return (
        <Compartment>
            <section className="py-32">
                <div className="w-full">
                    <h2 className="text-4xl font-medium md:text-6xl">Popular station</h2>
                    <p className="mt-6 whitespace-pre-wrap text-muted-foreground md:mb-20 md:text-lg">
                        Discover the top destinations for your next adventure.
                    </p>
                    <div className="mt-12 md:mt-20">
                        <ul className="divide-y divide-border border-y border-border">
                            {destinations.map((destination) => (
                                <li key={destination.id} className="group">
                                    <div onClick={() => handelLink(destination)} className="flex items-center py-6">
                                        <div>
                                            <div className="font-medium md:text-lg">{destination.name}</div>
                                            <div className="flex gap-1 text-xs text-muted-foreground md:mt-2 md:text-sm">
                                                {
                                                    getAvailableModes(destination.modes)
                                                        .map((mode) => (
                                                            <ModeBadge key={mode} mode={mode}/>
                                                        ))
                                                }
                                            </div>
                                        </div>
                                        <ArrowRight className="ml-auto size-6 -translate-x-6 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>
        </Compartment>
    );
}