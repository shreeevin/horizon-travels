import { Timer, Zap, ZoomIn } from "lucide-react";
import { Compartment } from "@/components/blocks/compartment";

const Wcu = () => {
    return (
        <Compartment>
            <section className="py-32">
                <div className="w-full">
                    <p className="mb-4 text-sm text-muted-foreground lg:text-base">
                        OUR VALUES
                    </p>
                    <h2 className="text-3xl font-medium lg:text-4xl">Why Choose Us?</h2>
                    <div className="mt-14 grid gap-6 lg:mt-20 lg:grid-cols-3">
                        <div className="rounded-lg bg-accent p-5">
                            <span className="mb-8 flex size-12 items-center justify-center rounded-full bg-background">
                                <Timer className="size-6" />
                            </span>
                            <h3 className="mb-2 text-xl font-medium">Seamless Booking Experience</h3>
                            <p className="leading-7 text-muted-foreground">
                                Easily plan and confirm your UK journeys in just a few intuitive steps.
                            </p>
                        </div>
                        <div className="rounded-lg bg-accent p-5">
                            <span className="mb-8 flex size-12 items-center justify-center rounded-full bg-background">
                                <ZoomIn className="size-6" />
                            </span>
                            <h3 className="mb-2 text-xl font-medium">Trusted UK Network</h3>
                            <p className="leading-7 text-muted-foreground">
                                Connect to top destinations with reliable air, coach, and train routes.
                            </p>
                        </div>
                        <div className="rounded-lg bg-accent p-5">
                            <span className="mb-8 flex size-12 items-center justify-center rounded-full bg-background">
                                <Zap className="size-6" />
                            </span>
                            <h3 className="mb-2 text-xl font-medium">Real-Time Price Transparency</h3>
                            <p className="leading-7 text-muted-foreground">
                                View fares, discounts, and seat options instantly — no hidden charges.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </Compartment>
    );
};

export { Wcu };
