import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Compartment } from "@/components/blocks/compartment";
import Link from "next/link";

interface CtaProps {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonUrl?: string;
    items?: string[];
}

const defaultItems = [
    "Instant Booking",
    "Live Seat Availability",
    "Early-Bird Discounts",
    "Secure Login",
    "Downloadable Receipts",
];

const Cta = ({
    title = "Book Your Journey",
    description = "Start your next UK adventure with fast, flexible, and trusted travel booking.",
    buttonText = "Get Started",
    buttonUrl = "/register",
    items = defaultItems,
}: CtaProps) => {
    return (
        <Compartment>
            <section className="py-32">
                <div className="w-full">
                    <div className="flex justify-center">
                    <div className="w-full">
                        <div className="flex flex-col items-start justify-between gap-8 rounded-lg bg-muted px-6 py-10 md:flex-row lg:px-20 lg:py-16">
                        <div className="md:w-1/2">
                            <h4 className="mb-1 text-2xl font-bold md:text-3xl">{title}</h4>
                            <p className="text-muted-foreground">{description}</p>
                            <Button className="mt-6" asChild>
                                <Link href={buttonUrl}>
                                    {buttonText} <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </div>
                        <div className="md:w-1/3">
                            <ul className="flex flex-col space-y-2 text-sm font-medium">
                            {items.map((item, idx) => (
                                <li className="flex items-center" key={idx}>
                                    <Check className="mr-4 size-4 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                            </ul>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
            </section>
        </Compartment>
    );
};

export { Cta };
