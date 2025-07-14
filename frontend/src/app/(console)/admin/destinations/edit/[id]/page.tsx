"use client";

import { useBreadcrumbs } from "@/contexts/BreadcrumbsContext";
import destinationService from "@/services/destinationService";
import { BreadcrumbItem } from "@/types";
import { ErrorResponse, Destination } from "@/types/destination";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import HeadingSmall from "@/components/blocks/heading-small";
import RichTextEditor from "@/components/rich-text-editor";
import slugify from 'slugify';
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Destinations',
        href: '/admin/destinations',
    },
    {
        title: 'Edit',
        href: '/admin/destinations/edit/[id]',
    }
];

const formSchema = z.object({
    name: z.string().min(4).max(20),
    air: z.string(),
    coach: z.string(),
    train: z.string(),
    status: z.string(),
});

export default function EditDestinationPage() {
    const router = useRouter();
    const params = useParams(); 
    
    const { setBreadcrumbs } = useBreadcrumbs();
    const [processing, setProcessing] = useState(false);

    const fetchDestination = async (id: number) => {
        try {
            const response = await destinationService.get(id);
            if (response.success) {
                const destination = response.data as Destination;
                form.reset({
                    name: destination.name,
                    air: String(destination.modes.air),
                    coach: String(destination.modes.coach),
                    train: String(destination.modes.train),
                    status: destination.status,
                });
            } else {
                router.push("/admin/destinations");
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
    
    const methodAvailable = [
        {
            label: 'Available',
            value: 'true',
        },
        {
            label: "Not Available",
            value: 'false',
        }
    ] as const;

    const form = useForm < z.infer < typeof formSchema >> ({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            air: 'true',
            coach: 'true',
            train: 'true',
            status: 'active',
        },
    })

    useEffect(() => {
        const idParam = params?.id;
        const id = idParam ? parseInt(idParam as string, 10) : null;

        if (id && !isNaN(id)) {
            fetchDestination(id);
        } else {
            router.push("/admin/destinations");
        }
    }, [params]);
    

    function convertToBoolean(value: string): boolean {
        return value === 'true';
    }

    async function onSubmit(values: z.infer < typeof formSchema > ) {
        setProcessing(true)
        try {
            const idParam = params?.id;
            const id = idParam ? parseInt(idParam as string, 10) : null;

            if (!id || isNaN(id)) {
                toast.error("An error occurred. Please try again.");
                return;
            }
            const response = await destinationService.update(
                id,
                values.name, 
                convertToBoolean(values.air), 
                convertToBoolean(values.coach),
                convertToBoolean(values.train),
                values.status,
            );

            if(response.success) {
                toast.success("Destination updated successfully!");
                router.push("/admin/destinations");
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
                    description="Update the destination location."
                />
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full py-10">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input 
                                        placeholder="Aberdeen"
                                        
                                        type="text"
                                        {...field} />
                                    </FormControl>
                                    
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="air"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Air</FormLabel>
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
                                                        ? methodAvailable.find(
                                                            (status) => status.value === field.value
                                                        )?.label
                                                        : "Select availability"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Search status..." />
                                                <CommandList>
                                                <CommandEmpty>No status found.</CommandEmpty>
                                                <CommandGroup>
                                                    {methodAvailable.map((method) => (
                                                        <CommandItem
                                                            value={method.label}
                                                            key={method.value}
                                                            onSelect={() => {
                                                            form.setValue("air", method.value);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    method.value === field.value
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                                )}
                                                            />
                                                            {method.label}
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
                            
                            <FormField
                                control={form.control}
                                name="coach"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Coach</FormLabel>
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
                                                        ? methodAvailable.find(
                                                            (status) => status.value === field.value
                                                        )?.label
                                                        : "Select availability"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Search status..." />
                                                <CommandList>
                                                <CommandEmpty>No status found.</CommandEmpty>
                                                <CommandGroup>
                                                    {methodAvailable.map((method) => (
                                                        <CommandItem
                                                            value={method.label}
                                                            key={method.value}
                                                            onSelect={() => {
                                                            form.setValue("coach", method.value);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    method.value === field.value
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                                )}
                                                            />
                                                            {method.label}
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

                            <FormField
                                control={form.control}
                                name="train"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Train</FormLabel>
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
                                                        ? methodAvailable.find(
                                                            (status) => status.value === field.value
                                                        )?.label
                                                        : "Select availability"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Search status..." />
                                                <CommandList>
                                                <CommandEmpty>No status found.</CommandEmpty>
                                                <CommandGroup>
                                                    {methodAvailable.map((method) => (
                                                        <CommandItem
                                                            value={method.label}
                                                            key={method.value}
                                                            onSelect={() => {
                                                            form.setValue("train", method.value);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    method.value === field.value
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                                )}
                                                            />
                                                            {method.label}
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
                                            <PopoverContent className="w-full p-0">
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
                        <div className="flex justify-end">
                            <Button type="submit" className="mt-2" tabIndex={5} disabled={processing}>
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Update destination
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
        
    );
}