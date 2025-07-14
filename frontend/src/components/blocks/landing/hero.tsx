import Image from "next/image";
import { ArrowRight, ArrowUpRight, RocketIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Compartment } from "@/components/blocks/compartment";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function HeroSplit() {
  return (
    <Compartment>
      <section className="py-32">
        <div className="container">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <Badge variant="outline">
                <div className="w-1 h-1 bg-green-500 rounded-full mr-1"></div>
                No booking fee
                <ArrowUpRight className="ml-2 size-4" />
              </Badge>

              <h1 className="my-6 text-pretty text-4xl font-bold lg:text-6xl">
                Book Smarter, Travel Freer
              </h1>
              <p className="text-muted-foreground mb-8 max-w-xl lg:text-xl">
                Find the best deals on trains, flights, and coaches — all in one place.
              </p>
              <div className="flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start">
                <Link 
                  href="/register"
                  className={cn(
                    buttonVariants({
                      variant: "default",
                    }),
                  )}
                >
                  Get Started
                </Link>
                
                  <Link 
                    href="/popular-routes"
                    className={cn(
                      buttonVariants({
                      variant: "outline",
                    }),
                    )}
                  >
                    <RocketIcon/> Browse routes
                  </Link>
              </div>
            </div>
            <Image
              src="/media/about-uk.webp"
              alt="United Kingdom"
              width={1920}
              height={1440}
              className="max-h-96 w-full rounded-md object-cover"
            />   
          </div>
        </div>
      </section>
    </Compartment>
  );
}
