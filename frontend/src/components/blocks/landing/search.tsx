"use client";

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Destination, ErrorResponse } from "@/types/destination";
import { toast } from "sonner";
import destinationService from "@/services/destinationService";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeftRight, Check, ChevronsUpDown, LoaderCircle } from "lucide-react";
import { DatePicker } from '@/components/ui/date-picker';
import { PassengerPicker } from '@/components/ui/passenger-picker';
import { useRouter } from "next/navigation";
import slugify from "slugify";

const formSchema = z.object({
    from: z.coerce.number().positive({ message: "Please select a valid destination." }),
    to: z.coerce.number().positive({ message: "Please select a valid destination." }),
    date: z.date(),
    passenger: z.coerce.number().positive().min(1).max(10),
    mode: z.string()
});

export default function SearchBooking() {
    const [isSticky, setIsSticky] = useState(false);
    const heroRef = useRef<HTMLDivElement>(null);
    
    const [processing, setProcessing] = useState(false);
    const [destinations, setDestinations] = useState<Destination[]>([]);

    const router = useRouter();

    const getDestinationNameById = (id: number): string => {
        const destination = destinations.find(dest => dest.id === id);
        return destination?.name ?? "";
    };

    const modes = [
        {
            label: 'All',
            value: 'all',
        },
        {
            label: 'Air',
            value: 'air',
        },
        {
            label: 'Train',
            value: 'train',
        },
        {
            label: 'Coach',
            value: 'coach',
        }
    ] as const;

    const fetchDestinations = async () => {
        try {
            const response = await destinationService.all();
            setDestinations(response.data);
            const destinationList: Destination[] = response.data;

            if (destinationList.length >= 2) {
                const randomIndexes = getTwoUniqueRandomIndexes(destinationList.length);
                const fromDestination = destinationList[randomIndexes[0]];
                const toDestination = destinationList[randomIndexes[1]];

                form.setValue('from', fromDestination.id);
                form.setValue('to', toDestination.id);
            }

        } catch (err: ErrorResponse | any) {
            const errorMessage = err.response.data.message || "An error occurred. Please try again.";
            toast.error("Oops, " + errorMessage);
        }
    };

    const getTwoUniqueRandomIndexes = (length: number): [number, number] => {
        const first = Math.floor(Math.random() * length);
        let second = Math.floor(Math.random() * length);

        while (second === first) {
            second = Math.floor(Math.random() * length);
        }

        return [first, second];
    };
    useEffect(() => {       
        fetchDestinations();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const heroHeight = heroRef.current?.offsetHeight || 0;
            const scrollTop = window.scrollY;
            
            setIsSticky(scrollTop > heroHeight);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handelLocationSwitch = () => {
        const fromValue = form.getValues('from');
        const toValue = form.getValues('to');
        
        form.setValue('from', toValue);
        form.setValue('to', fromValue);
    };
    
    const form = useForm < z.infer < typeof formSchema >> ({
        resolver: zodResolver(formSchema),
        defaultValues: {
            from: undefined,
            to: undefined,
            date: new Date(),
            passenger: 1,
            mode: 'all'
        },
    })

    async function onSubmit(values: z.infer < typeof formSchema > ) {
        setProcessing(true)
        try {
            if (values.from === values.to) {
                toast.error("From and To destinations cannot be the same.");
                setProcessing(false);
                return;
            }

            const journeyData = {
                from: values.from,
                to: values.to,
                date: values.date.toISOString(),
                passenger: values.passenger,
                mode: values.mode
            };

            const leave = slugify(getDestinationNameById(values.from), { lower: true });
            const arrive = slugify(getDestinationNameById(values.to), { lower: true });
            const slug = `${leave}-to-${arrive}`;

            const encoded = encodeURIComponent(btoa(JSON.stringify(journeyData)));                    
            router.push(`/journey/${slug}?book=${encoded}`);
        } catch (err: ErrorResponse | any) {
            const errorMessage = err.response.data.message || "An error occurred. Please try again.";
            toast.error("Oops, " + errorMessage);
        } finally {
            setProcessing(false);
        }
    }

    return (
        <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/media/travel-uk.webp)' }}>
            <div className="relative" ref={heroRef}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
                    <div className="text-center text-foreground mt-6 mb-12">
                        <h2 className="text-4xl font-bold lg:text-6xl mb-4 text-foreground">
                            Cheap Tickets in the UK
                        </h2>
                        <p className="text-xl md:text-2xl text-muted-foreground">
                            Search and Compare Ticket times and Prices
                        </p>
                    </div>
                </div>

                <div
                    className={cn(
                        "transition-all duration-300",
                        isSticky
                        ? "fixed top-0 left-0 right-0 z-50 bg-background py-4"
                        : "absolute bottom-0 left-0 right-0 transform translate-y-1/2"
                    )}
                >

                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div
                            className={cn(
                                "bg-background transition-all duration-300",
                                isSticky ? "rounded-none" : "rounded-2xl"
                            )}
                        >
                            <div className="p-6">
                                <div className='my-2'>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full py-4">                        
                                            <div className="flex flex-col lg:flex-row gap-2 items-center w-full">
                                                {/* From Field */}
                                                <FormField
                                                    control={form.control}
                                                    name="from"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col flex-1 w-full">
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
                                                                    <CommandEmpty>No destination found.</CommandEmpty>
                                                                    <CommandGroup>
                                                                        {destinations
                                                                        .filter((d) => d.id !== form.watch("to"))
                                                                        .map((method) => (
                                                                            <CommandItem
                                                                                value={method.name}
                                                                                key={String(method.id)}
                                                                                onSelect={() => {
                                                                                    form.setValue("from", method.id);
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
                                                
                                                {/* Switch Button */}
                                                <div className={cn(buttonVariants({variant: 'ghost', size: 'sm'}), "cursor-pointer")} onClick={handelLocationSwitch}>
                                                    <ArrowLeftRight/>
                                                </div>

                                                {/* To Field */}
                                                <FormField
                                                    control={form.control}
                                                    name="to"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col flex-1 w-full">
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
                                                                        <CommandEmpty>No destination found.</CommandEmpty>
                                                                        <CommandGroup>
                                                                            {destinations
                                                                                .filter((d) => d.id !== form.watch("from"))
                                                                                .map((method) => (
                                                                                <CommandItem
                                                                                    value={method.name}
                                                                                    key={String(method.id)}
                                                                                    onSelect={() => {
                                                                                        form.setValue("to", method.id);
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

                                                {/* Date Field */}
                                                <FormField
                                                    control={form.control}
                                                    name="date"
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1 w-full">
                                                            <FormControl>
                                                                <DatePicker
                                                                    id="journey_date"
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="mode"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col">
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
                                                                        ? modes.find(
                                                                            (mode) => mode.value === field.value
                                                                        )?.label
                                                                        : "Select mode"}
                                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                    </Button>
                                                                </FormControl>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-full p-0">
                                                                <Command>
                                                                    <CommandInput placeholder="Search mode..." />
                                                                    <CommandList>
                                                                    <CommandEmpty>No mode found.</CommandEmpty>
                                                                    <CommandGroup>
                                                                        {modes.map((mode) => (
                                                                        <CommandItem
                                                                            value={mode.label}
                                                                            key={mode.value}
                                                                            onSelect={() => {
                                                                            form.setValue("mode", mode.value);
                                                                            }}
                                                                        >
                                                                            <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                mode.value === field.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                            )}
                                                                            />
                                                                            {mode.label}
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
                                                {/* Passenger Field */}
                                                <FormField
                                                    control={form.control}
                                                    name="passenger"
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1 w-full">
                                                            <FormControl>
                                                                <PassengerPicker 
                                                                    id="passenger_count"
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Submit Button */}
                                                <Button type="submit" tabIndex={5} disabled={processing} className="flex-1 w-full">
                                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                                    Search
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </div>
                                <div className="mt-4 flex items-center justify-center space-x-6 text-sm leading-7 text-muted-foreground">
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                        <span>No booking fee</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span>Best Price Promise</span>
                                        <span className="ml-1">→</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>       
        </div>
    );
}