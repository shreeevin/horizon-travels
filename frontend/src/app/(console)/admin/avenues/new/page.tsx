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
import { ErrorResponse } from "@/types/legal";
import destinationService from "@/services/destinationService";
import { Destination } from "@/types/destination";
import avenueService from "@/services/avenueService";
import { TimePicker } from "@/components/ui/time-picker";

const formSchema = z.object({
    leave_destination_id: z.coerce.number().positive({ message: "Please select a valid destination." }),
    arrive_destination_id: z.coerce.number().positive({ message: "Please select a valid destination." }),
    leave_time: z.string(),
    arrive_time: z.string(),
    status: z.string(),
    price: z.coerce.number().positive().min(50).max(150)
});

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Avenues',
        href: '/admin/avenues',
    },
    {
        title: 'New',
        href: '/admin/avenues/new',
    }
];

export default function CreateAvenuesPage() {
    const router = useRouter();
    const { setBreadcrumbs } = useBreadcrumbs();
    const [processing, setProcessing] = useState(false);
    const [destinations, setDestinations] = useState<Destination[]>([]);

    const fetchDestinations = async () => {
        try {
            const response = await destinationService.all();
            setDestinations(response.data);
        } catch (err: ErrorResponse | any) {
            const errorMessage = err.response.data.message || "An error occurred. Please try again.";
            toast.error("Oops, " + errorMessage);
        }
    };

    useEffect(() => {
        fetchDestinations();
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
            leave_destination_id: undefined,
            arrive_destination_id: undefined,
            leave_time: '00:00:00',
            arrive_time: '00:00:00',
            status: 'active',
            price: 110,
        },
    })

    async function onSubmit(values: z.infer < typeof formSchema > ) {
        setProcessing(true)
        try {
            if (values.leave_destination_id === values.arrive_destination_id) {
                toast.error("From and To destinations cannot be the same.");
                setProcessing(false);
                return;
            }

            const response = await avenueService.create(
                values.leave_destination_id, 
                values.arrive_destination_id, 
                String(values.leave_time),
                String(values.arrive_time),
                values.status,
                values.price
            );

            if(response.success) {
                toast.success("Avenues created successfully!");
                router.push("/admin/avenues");
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
                    title="New Avenue"
                    description="Create a new avenue."
                />
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full py-10">                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="leave_destination_id"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>From</FormLabel>
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
                                                        ? destinations.find(
                                                            (destination) => destination.id === field.value
                                                        )?.name
                                                        : "Select destination"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Search destination..." />
                                                <CommandList>
                                                <CommandEmpty>No status found.</CommandEmpty>
                                                <CommandGroup>
                                                    {destinations
                                                    .filter((d) => d.id !== form.watch("arrive_destination_id"))
                                                    .map((method) => (
                                                        <CommandItem
                                                            value={method.name}
                                                            key={String(method.id)}
                                                            onSelect={() => {
                                                                form.setValue("leave_destination_id", method.id);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    method.id === field.value
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                                )}
                                                            />
                                                            {method.name}
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
                                name="arrive_destination_id"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>To</FormLabel>
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
                                                        ? destinations.find(
                                                            (destination) => destination.id === field.value
                                                        )?.name
                                                        : "Select destination"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0 p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search destination..." />
                                                    <CommandList>
                                                    <CommandEmpty>No status found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {destinations
                                                            .filter((d) => d.id !== form.watch("leave_destination_id"))
                                                            .map((method) => (
                                                            <CommandItem
                                                                value={method.name}
                                                                key={String(method.id)}
                                                                onSelect={() => {
                                                                    form.setValue("arrive_destination_id", method.id);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        method.id === field.value
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                    )}
                                                                />
                                                                {method.name}
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
                                name="leave_time"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Leave Time</FormLabel>
                                        <TimePicker
                                            id="leave_time"
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="arrive_time"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Arrive Time</FormLabel>
                                        <TimePicker
                                            id="arrive_time"
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    
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

                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price (£)</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="110"                                            
                                                type="number"
                                                {...field} 
                                            />
                                        </FormControl>
                                        
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" className="mt-2" tabIndex={5} disabled={processing}>
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Create page
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};