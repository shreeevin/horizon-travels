"use client";

import { useBreadcrumbs } from "@/contexts/BreadcrumbsContext";
import changelogService from "@/services/changelogService";
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
import { Changelog, ErrorResponse } from "@/types/changelog";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Changelogs',
        href: '/admin/changelogs',
    },
    {
        title: 'Edit',
        href: '/admin/changelogs/edit/[id]',
    }
];

const formSchema = z.object({
    name: z.string().min(4).max(30),
    content: z.string().min(10).max(2500),
    version: z.string().min(1).max(10),
    status: z.string(),
});

export default function EditChangelogsPage() {
    const router = useRouter();
    const params = useParams(); 
    
    const { setBreadcrumbs } = useBreadcrumbs();
    const [processing, setProcessing] = useState(false);

    const fetchChangelog = async (id: number) => {
        try {
            const response = await changelogService.get(id);
            if (response.success) {
                const changelog = response.data as Changelog;

                form.reset({
                    name: changelog.name,
                    content: changelog.content,
                    version: changelog.version,
                    status: changelog.status,
                });
            } else {
                router.push("/admin/changelogs");
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
            name: '',
            content: '',
            version: '',
            status: 'active',
        },
    })

    useEffect(() => {
        const idParam = params?.id;
        const id = idParam ? parseInt(idParam as string, 10) : null;

        if (id && !isNaN(id)) {
            fetchChangelog(id);
        } else {
            router.push("/admin/changelogs");
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
            const response = await changelogService.update(
                id,
                values.name,
                values.content,
                values.version,
                values.status
            );

            if(response.success) {
                toast.success("Changelog updated successfully!");
                router.push("/admin/changelogs");
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
                    description="Update the changelog."
                />
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full py-10">
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
                                            placeholder="Major update"
                                            type="text"
                                            {...field} 
                                        />
                                    </FormControl>
                                    
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="version"
                                render={({ field }) => (
                                    <FormItem
                                        className="w-full"
                                    >
                                        <FormLabel>Version</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="1.0.0"
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
                                name="status"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col w-full">
                                        <FormLabel>Status</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                    "w-full justify-between",
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
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
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
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Information</FormLabel>
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
                                Create changelog
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
        
    );
}