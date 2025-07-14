"use client";

import { Compartment } from "@/components/blocks/compartment";
import legalService from "@/services/legalService";
import { ErrorResponse, Legal } from "@/types/legal";
import { LoaderCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import slugify from 'slugify';

interface TocItem {
    id: string;
    text: string;
    level: number;
}

export default function Terms() {
    const params = useParams(); 
    const router = useRouter();
    const contentRef = useRef<HTMLDivElement>(null);

    const [legal, setLegal] = useState<Legal | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [tocItems, setTocItems] = useState<TocItem[]>([]);

    const fetchLegal = async (slug: string) => {
        try {
            const response = await legalService.getBySlug(slug);
            if (response.success && response.data) {
                const legalRaw = response.data as Legal;
                setLegal(legalRaw);
            } else {
                toast.error('Page not found');
                router.push("/404"); 
            }
        } catch (err: any) {
            const error = err.response?.data as ErrorResponse;
            toast.error(error.message || 'Page not found');
            router.push("/404"); 
        } finally {
            setLoading(false); 
        }
    };

    const [processedContent, setProcessedContent] = useState<string>('');

    const processContentWithIds = (htmlContent: string) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        const headings = tempDiv.querySelectorAll('h1, h2, h3');
        const items: TocItem[] = [];
        
        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            const text = heading.textContent?.trim() || '';
            
            const slug = slugify(text, { lower: true });            
            const id = slug;
            
            heading.id = id;
            
            if (text) {
                items.push({ id, text, level });
            }
        });
        
        setTocItems(items);
        return tempDiv.innerHTML;
    };

    const scrollToHeading = (id: string) => {
        const element = document.getElementById(id);        
        if (element) {
            const yOffset = -100; 
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            
            window.scrollTo({
                top: y,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        const slugParam = params?.slug;

        if (slugParam) {
            const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
            fetchLegal(slug);  
        } 
    }, [params, router]);

    useEffect(() => {
        if (legal?.content) {
            const processed = processContentWithIds(legal.content);
            setProcessedContent(processed);
        }
    }, [legal?.content]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-screen">
                <LoaderCircle className="animate-spin size-8 text-muted-foreground"/>
            </div>
        );
    }
    
    if (!legal) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-screen">
                <LoaderCircle className="animate-spin size-8 text-muted-foreground"/>
            </div>
        );
    }

    return (
        <Compartment>
            <section className="py-32">
                <div className="w-full mx-auto px-4">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl">
                        {legal.name}
                    </h1>               
                </div>
                <div className="flex gap-8 px-4 mt-10">
                    <div className="flex-1 px-4 mt-10 tiptap" ref={contentRef}>
                        {processedContent && (
                            <div
                                className="prose dark:prose-invert prose-sm mx-auto"
                                dangerouslySetInnerHTML={{ __html: processedContent }}
                            />
                        )}
                    </div>
                    
                    {/* Table of Contents */}
                    {tocItems.length > 0 && (
                        <div className="w-64 sticky top-32 h-fit">
                            <div className="bg-muted/50 rounded-lg p-4 border">
                                <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                                    Table of Contents
                                </h3>
                                <nav className="space-y-1">
                                    {tocItems.map((item, index) => (
                                        <button
                                            key={`${item.id}-${index}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                scrollToHeading(item.id);
                                            }}
                                            className={`
                                                block w-full text-left text-sm hover:text-primary transition-colors duration-200
                                                ${item.level === 1 ? 'font-medium' : ''}
                                                ${item.level === 2 ? 'pl-3' : ''}
                                                ${item.level === 3 ? 'pl-6' : ''}
                                                py-1.5 px-2 rounded hover:bg-muted/70 cursor-pointer
                                            `}
                                            type="button"
                                        >
                                            {item.text}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </Compartment>
    );
};