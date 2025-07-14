"use client";

import { useBreadcrumbs } from "@/contexts/BreadcrumbsContext";
import contactService from "@/services/contactService";
import { BreadcrumbItem } from "@/types";
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
import { Check, ChevronsUpDown, LoaderCircle, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Contact, ErrorResponse } from "@/types/contact";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
        title: 'Edit',
        href: '/admin/contacts/edit/[id]',
    }
];

const formSchema = z.object({
    name: z.string().min(4).max(20),
    email: z.string().email(),
    subject: z.string().min(8).max(64),
    message: z.string().min(100).max(500),
    status: z.string(),
});

export default function EditContactPage() {
    const router = useRouter();
    const params = useParams(); 
    
    const { setBreadcrumbs } = useBreadcrumbs();
    const [processing, setProcessing] = useState(false);

    const fetchContact = async (id: number) => {
        try {
            const response = await contactService.get(id);
            if (response.success) {
                const contact = response.data as Contact;
                form.reset({
                    name: contact.name,
                    email: contact.email,
                    subject: contact.subject,
                    message: contact.message,
                    status: contact.status,
                });
            } else {
                router.push("/admin/contacts");
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
            label: 'Read',
            value: 'read',
        },
        {
            label: 'Unread',
            value: 'unread',
        }
    ] as const;
    
    const form = useForm < z.infer < typeof formSchema >> ({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            subject: '',
            message: '',
            status: 'unread',
        },
    })

    useEffect(() => {
        const idParam = params?.id;
        const id = idParam ? parseInt(idParam as string, 10) : null;

        if (id && !isNaN(id)) {
            fetchContact(id);
        } else {
            router.push("/admin/contacts");
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
            const response = await contactService.update(
                id,
                values.status
            );

            if(response.success) {
                toast.success("Contact updated successfully!");
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
                    title="Edit page"
                    description="Update the contact message."
                />
                
                <Alert variant="destructive" className="mt-4">
                    <Terminal />
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription>
                        You can only update the status of the contact message.
                    </AlertDescription>
                </Alert>
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
                                                readOnly
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
                                                readOnly
                                                {...field} 
                                            />
                                        </FormControl>                                        
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="subject"
                                render={({ field }) => (
                                    <FormItem
                                        className="flex-1"
                                    >
                                        <FormLabel>Subject</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="How can I reset my password?"
                                                type="text"
                                                readOnly
                                                {...field} 
                                            />
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
                                Update contact
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
        
    );
}