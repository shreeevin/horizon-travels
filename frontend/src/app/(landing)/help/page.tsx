"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Compartment } from "@/components/blocks/compartment";
import { useEffect, useState } from "react";
import { ErrorResponse, Faq } from "@/types/faq";
import { toast } from "sonner";
import faqService from "@/services/faqService";

export default function HelpPage() {
    const [faqs, setFaqs] = useState<Faq[]>([]);

    const fetchFaqs = async () => {
        try {
            const response = await faqService.all();
            setFaqs(response.data);
        } catch (err: ErrorResponse | any) {
            const errorMessage = err.response.data.message || "An error occurred. Please try again.";
            toast.error("Oops, " + errorMessage);
        }
    };

    useEffect(() => {      
        fetchFaqs();
    }, []);

    return (
        <Compartment>
            <section className="py-32">
                <div className="space-y-16">
                    <div className="mx-auto flex max-w-3xl flex-col text-left md:text-center">
                        <h2 className="mb-3 text-3xl font-semibold md:mb-4 lg:mb-6 lg:text-4xl">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-muted-foreground lg:text-lg">Find answers to common questions about our products. Can't find what you're looking for? Contact our support team.</p>
                    </div>
                    <Accordion
                        type="single"
                        collapsible
                        className="mx-auto w-full lg:max-w-3xl"
                    >
                        {faqs.map((item) => (
                            <AccordionItem key={item.id} value={String(item.id)}>
                                <AccordionTrigger className="transition-opacity duration-200 hover:no-underline hover:opacity-60">
                                    <div className="font-medium sm:py-1 lg:py-2 lg:text-lg">
                                        {item.question}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="sm:mb-1 lg:mb-2">
                                    <div
                                        className="tiptap text-muted-foreground lg:text-lg"
                                        dangerouslySetInnerHTML={{ __html: item.answer }}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>
        </Compartment>
    );
}