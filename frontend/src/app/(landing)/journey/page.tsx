"use client";

import { Compartment } from "@/components/blocks/compartment";
import { PriceModeBadge } from "@/components/blocks/landing/price-mode-badge";
import { formatTo12Hour } from "@/lib/formatTime";
import avenueService from "@/services/avenueService";
import { Avenue, ErrorResponse, Price } from "@/types/avenue";
import { ArrowLeftRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import slugify from "slugify";

export default function JourneyPage() {
    const router = useRouter();
    const [avenues, setAvenues] = useState<Avenue[]>([]);
    
    const fetchAvenues = async () => {
        try {
            const response = await avenueService.all();
            setAvenues(response.data);
        } catch (err: ErrorResponse | any) {
            const errorMessage = err.response.data.message || "An error occurred. Please try again.";
            toast.error("Oops, " + errorMessage);
        }
    };

    const getAvailableModes = (modes: Price) => {
        const availableModes: { mode: string; amount: number }[] = [];
        if (modes.air) availableModes.push({ mode: 'air', amount: modes.air });
        if (modes.coach) availableModes.push({ mode: 'coach', amount: modes.coach });
        if (modes.train) availableModes.push({ mode: 'train', amount: modes.train });
        return availableModes;
    };

    const groupAvenuesByLeaveDestination = (avenues: Avenue[]) => {
        return avenues.reduce((grouped, avenue) => {
            const leaveDestinationName = avenue.leave_destination.name;
            if (!grouped[leaveDestinationName]) {
                grouped[leaveDestinationName] = [];
            }
            grouped[leaveDestinationName].push(avenue);
            return grouped;
        }, {} as Record<string, Avenue[]>);
    };

    const handelLink = (avenue: Avenue) => {
        const journeyData = {
            from: avenue.leave_destination.id,
            to: avenue.arrive_destination.id,
            date: (new Date()).toISOString(),
            passenger: 1,
        };

        const leave = slugify(avenue.leave_destination.name, { lower: true });
        const arrive = slugify(avenue.arrive_destination.name, { lower: true });
        const slug = `${leave}-to-${arrive}`;
        
        const encoded = encodeURIComponent(btoa(JSON.stringify(journeyData)));
        router.push(`/journey/${slug}?book=${encoded}`);
    }
    
    useEffect(() => {       
        fetchAvenues();
    }, []);

    const groupedAvenues = groupAvenuesByLeaveDestination(avenues);

    return (
        <Compartment>
            <section className="py-32">
                <div className="w-full">
                    <div className="text-center lg:text-left">
                        <h1 className="text-left text-3xl font-medium md:text-4xl">
                            Popular Journies
                        </h1>
                        <p className="mt-4 whitespace-pre-wrap text-muted-foreground md:mb-20 md:text-lg">
                            Discover the most popular routes for your next adventure.
                        </p>
                    </div>
                    <div className="mt-6 flex flex-col gap-16 md:mt-14">
                        {Object.keys(groupedAvenues).map((leaveDestination) => (
                            <div key={leaveDestination}>
                                <h2 className="text-2xl font-semibold">{leaveDestination}</h2>
                                <div className="grid mt-4 gap-4">
                                    {groupedAvenues[leaveDestination].map((avenue) => (
                                        <div key={avenue.id} className="border-b">
                                            <div
                                                className="flex items-center justify-between py-4 transition-transform transform hover:scale-101 duration-200 cursor-pointer"
                                                onClick={() => handelLink(avenue)}
                                            >
                                                <div className="flex flex-col font-semibold">
                                                    <div className="flex items-center gap-2">
                                                        {avenue.leave_destination.name}
                                                        <ArrowLeftRight className="inline-block h-4 w-4" />
                                                        {avenue.arrive_destination.name}
                                                    </div>
                                                    <span className="text-sm text-muted-foreground font-normal">
                                                        {formatTo12Hour(avenue.leave_time)} - {formatTo12Hour(avenue.arrive_time)}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    {getAvailableModes(avenue.price)
                                                        .filter(({ amount }) => amount > 0)
                                                        .map(({ mode, amount }) => (
                                                            <PriceModeBadge key={mode} mode={mode} amount={amount} />
                                                        ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </Compartment>
    );
}
