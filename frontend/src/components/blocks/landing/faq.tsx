"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useState, useEffect } from "react";
import { ErrorResponse, Faq } from "@/types/faq";
import faqService from "@/services/faqService";
import { toast } from "sonner";
import TextLink from "@/components/blocks/text-link";

const FAQs = () => {
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
        <section className="py-32">
            <div className="container space-y-16">
                <div className="mx-auto flex max-w-3xl flex-col text-left md:text-center">
                    <h2 className="mb-3 text-3xl font-semibold md:mb-4 lg:mb-6 lg:text-4xl">
                        FAQs about Journey in the UK
                    </h2>
                </div>
                <Accordion
                    type="single"
                    collapsible
                    className="mx-auto w-full lg:max-w-3xl"
                >
                {faqs.slice(0, 5).map((faq) => (
                    <AccordionItem key={faq.id} value={String(faq.id)}>
                    <AccordionTrigger className="transition-opacity duration-200 hover:no-underline hover:opacity-60">
                        <div className="font-medium sm:py-1 lg:py-2 lg:text-lg">
                            {faq.question}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="sm:mb-1 lg:mb-2">
                        <div
                            className="tiptap text-muted-foreground lg:text-lg"
                            dangerouslySetInnerHTML={{ __html: faq.answer }}
                        />
                    </AccordionContent>
                    </AccordionItem>
                ))}
                </Accordion>     
                <div className="flex justify-end mx-auto w-full lg:max-w-3xl">
                    <TextLink href="/help">
                        Check More FAQs
                    </TextLink>
                </div>           
            </div>
        </section>
    );
};

export { FAQs };
