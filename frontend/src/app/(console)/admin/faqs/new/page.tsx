"use client";

import HeadingSmall from "@/components/blocks/heading-small";
import { useBreadcrumbs } from "@/contexts/BreadcrumbsContext";
import { BreadcrumbItem } from "@/types";
import { useEffect } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/rich-text-editor";
import faqService from "@/services/faqService";
import { ErrorResponse } from "@/types/faq";

const formSchema = z.object({
    question: z.string().min(12).max(100),
    status: z.string(),
    answer: z.string().min(100).max(25000)
});


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
        title: 'New',
        href: '/admin/faqs/new',
    }
];

export default function CreateFaqPage() {
    const router = useRouter();
    const { setBreadcrumbs } = useBreadcrumbs();
    const [processing, setProcessing] = useState(false);

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

    async function onSubmit(values: z.infer < typeof formSchema > ) {
        setProcessing(true)
        try {
            const response = await faqService.create(
                values.question, 
                values.answer, 
                values.status,
            );

            if(response.success) {
                toast.success("Faq created successfully!");
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
                    title="New Faq"
                    description="Create a new faq question and answer"
                />
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full py-10">
                        <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="question"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
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
                                Create faq
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};