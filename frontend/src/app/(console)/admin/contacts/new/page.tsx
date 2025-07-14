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
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/rich-text-editor";
import contactService from "@/services/contactService";
import { ErrorResponse } from "@/types/contact";
import { LoaderCircle } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(4).max(20),
    email: z.string().email(),
    subject: z.string().min(8).max(64),
    message: z.string().min(100).max(500),
});


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Contacts',
        href: '/admin/contacts',
    },
    {
        title: 'New',
        href: '/admin/contacts/new',
    }
];

export default function CreateContactPage() {
    const router = useRouter();
    const { setBreadcrumbs } = useBreadcrumbs();
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        setBreadcrumbs(breadcrumbs);
    }, []);

    const form = useForm < z.infer < typeof formSchema >> ({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            subject: '',
            message: '',
        },
    })

    async function onSubmit(values: z.infer < typeof formSchema > ) {
        setProcessing(true)
        try {
            const response = await contactService.create(
                values.name, 
                values.email, 
                values.subject,
                values.message, 
            );

            if(response.success) {
                toast.success("Contact created successfully!");
                router.push("/admin/contacts");
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
                    title="New Contact"
                    description="Create a new contact message."
                />
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full py-10">
                        <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem
                                        className="w-full"
                                    >
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="John Wick"
                                                type="text"
                                                {...field} 
                                            />
                                        </FormControl>
                                        
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                                
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem
                                        className="w-full"
                                    >
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="john.wick@gmail.com"
                                                type="email"
                                                {...field} 
                                            />
                                        </FormControl>                                        
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem
                                    className="w-full"
                                >
                                    <FormLabel>Subject</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="How can I reset my password?"
                                            type="text"
                                            {...field} 
                                        />
                                    </FormControl>
                                    
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message</FormLabel>
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
                                Create contact
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};