"use client";

import { useBreadcrumbs } from "@/contexts/BreadcrumbsContext";
import faqService from "@/services/faqService";
import { BreadcrumbItem } from "@/types";
import { ErrorResponse } from "@/types/faq";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import HeadingSmall from "@/components/blocks/heading-small";
import RichTextEditor from "@/components/rich-text-editor";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Faq } from "@/types/faq";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Faqs',
        href: '/admin/faqs',
    },
    {
        title: 'Edit',
        href: '/admin/faqs/edit/[id]',
    }
];

const formSchema = z.object({
    question: z.string().min(12).max(100),
    status: z.string(),
    answer: z.string().min(100).max(25000)
});

export default function EditFaqPage() {
    const router = useRouter();
    const params = useParams(); 
    
    const { setBreadcrumbs } = useBreadcrumbs();
    const [processing, setProcessing] = useState(false);

    const fetchFaq = async (id: number) => {
        try {
            const response = await faqService.get(id);
            if (response.success) {
                const faq = response.data as Faq;
                form.reset({
                    question: faq.question,
                    status: faq.status,
                    answer: faq.answer,
                });
            } else {
                router.push("/admin/legal");
            }
        } catch (err: any) {
            const error = err.response.data as ErrorResponse;
            toast.error(error.message);
        } 
    };
    
    useEffect(() => {      
        setBreadcrumbs(breadcrumbs);
    }, []);

    const statuses = [
        {
            label: 'Active',
            value: 'active',
        },
        {
            label: 'Inactive',
            value: 'inactive',
        }
    ] as const;
    
    const form = useForm < z.infer < typeof formSchema >> ({
        resolver: zodResolver(formSchema),
        defaultValues: {
            question: '',
            status: 'active',
            answer: '',
        },
    })

    useEffect(() => {
        const idParam = params?.id;
        const id = idParam ? parseInt(idParam as string, 10) : null;

        if (id && !isNaN(id)) {
            fetchFaq(id);
        } else {
            router.push("/admin/faqs");
        }
    }, [params]);
    

    async function onSubmit(values: z.infer < typeof formSchema > ) {
        setProcessing(true)
        try {
            const idParam = params?.id;
            const id = idParam ? parseInt(idParam as string, 10) : null;

            if (!id || isNaN(id)) {
                toast.error("An error occurred. Please try again.");
                return;
            }
            const response = await faqService.update(
                id,
                values.question, 
                values.answer,
                values.status
            );

            if(response.success) {
                toast.success("Faq updated successfully!");
                router.push("/admin/faqs");
            }

        } catch (err: ErrorResponse | any) {
            const errorMessage = err.response.data.message || "An error occurred. Please try again.";
            toast.error("Oops, " + errorMessage);
        } finally {
            setProcessing(false);
        }
    }

    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl px-4 py-6">
            <div className="my-4">
                <HeadingSmall
                    title="Edit page"
                    description="Update the legal page."
                />
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full py-10">                        
                        <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="question"
                                render={({ field }) => (
                                    <FormItem
                                        className="flex-1"
                                    >
                                        <FormLabel>Question</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="How to use the app?"
                                                type="text"
                                            {...field} />
                                        </FormControl>
                                        
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Status</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-[200px] justify-between",
                                                        !field.value && "text-muted-foreground"
                                                    )}                                                
                                                >
                                                {field.value
                                                    ? statuses.find(
                                                        (status) => status.value === field.value
                                                    )?.label
                                                    : "Select status"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[200px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search status..." />
                                                <CommandList>
                                                <CommandEmpty>No status found.</CommandEmpty>
                                                <CommandGroup>
                                                    {statuses.map((status) => (
                                                    <CommandItem
                                                        value={status.label}
                                                        key={status.value}
                                                        onSelect={() => {
                                                        form.setValue("status", status.value);
                                                        }}
                                                    >
                                                        <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            status.value === field.value
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                        )}
                                                        />
                                                        {status.label}
                                                    </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                                </CommandList>
                                            </Command>
                                            </PopoverContent>
                                        </Popover>
                                        
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                        </div>
                        <FormField
                            control={form.control}
                            name="answer"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Answer</FormLabel>
                                    <FormControl>
                                        <RichTextEditor
                                            content={field.value}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end">
                            <Button type="submit" className="mt-2" tabIndex={5} disabled={processing}>
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Update page
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
        
    );
}