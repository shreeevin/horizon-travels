import { Footer } from "@/components/blocks/footer";
import { Navbar } from "@/components/blocks/navbar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function NotFound() {
    return (
        <>
            <Navbar />
            <div className="flex flex-col py-6">
                <div className="flex-grow py-24 lg:py-32  flex flex-col justify-center">
                    <div className="mt-0 max-w-md w-full text-center mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold text-primary sm:text-4xl">
                            404
                        </h1>
                        <p className="mt-3 text-muted-foreground">
                            Oops! It looks like the page you were trying to access doesn’t exist or has been moved.
                        </p>
                        <Link href="/" className={
                                cn(
                                    buttonVariants({ variant: "outline" }), 
                                    "mt-6"
                                )
                            }
                        >
                            Go back home
                        </Link>
                    </div>                    
                </div>                    
            </div>
            <Footer />
        </>
    )
}