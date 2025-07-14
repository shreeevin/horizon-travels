import AppLogoIcon from "@/components/blocks/app-logo-icon";
import { Compartment } from "@/components/blocks/compartment";
import { Community } from "@/components/blocks/landing/community";
import { buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
    const defaultAchievements = [
        { label: "Companies Supported", value: "300+" },
        { label: "Projects Finalized", value: "800+" },
        { label: "Happy Customers", value: "99%" },
        { label: "Recognized Awards", value: "10+" },
    ];

    return (
        <Compartment>
            <section className="py-32">
                <div className="w-full">
                    <div className="mb-14 grid gap-5 text-center md:grid-cols-2 md:text-left">
                        <h1 className="text-5xl font-semibold">About Us</h1>
                        <p className="text-muted-foreground">Horizon Travels is a UK-based travel booking platform that helps users plan, compare, and book air, coach, and train journeys with ease. We’re committed to making travel simpler, smarter, and more accessible across major UK destinations.</p>
                    </div>
                    <div className="grid gap-7 lg:grid-cols-3">
                        <Image
                            src="/media/about-uk.webp"
                            alt="United Kingdom"
                            width={1920}
                            height={1440}
                            className="size-full max-h-[620px] rounded-xl object-cover lg:col-span-2"
                        />   
                        <div className="flex flex-col gap-7 md:flex-row lg:flex-col">
                            <div className="flex flex-col justify-between gap-6 rounded-xl bg-muted p-7 md:w-1/2 lg:w-auto">
                                <AppLogoIcon className="size-8 rounded-lg fill-current text-back dark:text-white" />
                                <div>
                                    <p className="mb-2 text-lg font-semibold">Plan Ahead & Save</p>
                                    <p className="text-muted-foreground">Get up to 30% off when you book your journey in advance — it’s smart travel made simple.</p>
                                </div>
                                <Link 
                                    className={
                                        buttonVariants({
                                            variant: "default",
                                        })
                                    }
                                    href="/"
                                >
                                    Book now
                                </Link>
                            </div>
                            <Image
                                src="/media/about-banner-uk.webp"
                                alt="United Kingdom"
                                width={1920}
                                height={1440}
                                className="grow basis-0 rounded-xl object-cover md:w-1/2 lg:min-h-0 lg:w-auto"
                            />
                        </div>                 
                    </div>
                    
                    <Community />   
                    
                    <div className="relative overflow-hidden rounded-xl bg-muted p-10 md:p-16 mt-8">
                        <div className="flex flex-col gap-4 text-center md:text-left">
                            <h2 className="text-4xl font-semibold">Our Achievements in Numbers</h2>
                            <p className="max-w-xl text-muted-foreground">
                                We’re proud to have helped millions of people travel across the UK.
                            </p>
                        </div>
                        <div className="mt-10 flex flex-wrap justify-between gap-10 text-center">
                            {defaultAchievements.map((item, idx) => (
                                <div className="flex flex-col gap-4" key={item.label + idx}>
                                    <p>{item.label}</p>
                                    <span className="text-4xl font-semibold md:text-5xl">
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div> 
                    </div>
                </div>
                
            </section>
        </Compartment>
    );
}