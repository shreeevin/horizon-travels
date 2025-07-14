"use client";

import { useBreadcrumbs } from "@/contexts/BreadcrumbsContext";
import destinationService from "@/services/destinationService";
import { BreadcrumbItem } from "@/types";
import { ErrorResponse, Destination } from "@/types/destination";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import HeadingSmall from "@/components/blocks/heading-small";
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
import { TimePicker } from "@/components/ui/time-picker";
import avenueService from "@/services/avenueService";
import { Avenue } from "@/types/avenue";

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
        title: 'Edit',
        href: '/admin/avenues/edit/[id]',
    }
];

const formSchema = z.object({
    leave_destination_id: z.coerce.number().positive({ message: "Please select a valid destination." }),
    arrive_destination_id: z.coerce.number().positive({ message: "Please select a valid destination." }),
    leave_time: z.string(),
    arrive_time: z.string(),
    status: z.string(),
    price: z.coerce.number().positive().min(50).max(150)
});

export default function EditDestinationPage() {
    const router = useRouter();
    const params = useParams(); 
    
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
    
    const fetchAvenue = async (id: number) => {
        try {
            const response = await avenueService.get(id);
            if (response.success) {
                const avenue = response.data as Avenue;
                                
                form.reset({
                    leave_destination_id: avenue.leave_destination.id,
                    arrive_destination_id: avenue.arrive_destination.id,
                    leave_time: avenue.leave_time,
                    arrive_time: avenue.arrive_time,
                    status: avenue.status,
                    price: avenue.price.air,
                });
            } else {
                router.push("/admin/avenues");
            }
        } catch (err: any) {
            const error = err.response.data as ErrorResponse;
            toast.error(error.message);
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

    useEffect(() => {
        const idParam = params?.id;
        const id = idParam ? parseInt(idParam as string, 10) : null;

        if (id && !isNaN(id)) {
            fetchAvenue(id);
        } else {
            router.push("/admin/avenues");
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
            const response = await avenueService.update(
                id,
                values.leave_destination_id, 
                values.arrive_destination_id, 
                values.leave_time,
                values.arrive_time,
                values.status,
                values.price
            );

            if(response.success) {
                toast.success("Avenue updated successfully!");
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
                    title="Edit page"
                    description="Update the destination location."
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
                                Update destination
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
        
    );
}