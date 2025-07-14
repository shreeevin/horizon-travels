"use client";

import { Compartment } from "@/components/blocks/compartment";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { CircleCheck, LoaderCircle, Terminal, CircleFadingArrowUp, Rocket } from "lucide-react";
import avenueService from "@/services/avenueService";
import { AvailableAvenue, ErrorResponse } from "@/types/avenue";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatTo12Hour } from "@/lib/formatTime";
import { Package, CreditCard, Truck, Shield } from "lucide-react";
import { ModeBadge } from "@/components/blocks/landing/mode-badge";
import EmptySkeleton from "@/components/blocks/empty";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";
import { PassengerPicker } from "@/components/ui/passenger-picker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SeatTypeName, seatOptions } from "@/types/seat";
import { PaymentTypeName, paymentMethods } from "@/types/payment";
import bookingSearvice from "@/services/bookingSearvice";
import { DatePicker } from '@/components/ui/date-picker';

export default function JourneyDetailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();    
    const [journey, setJourney] = useState<null | {
        from: number;
        to: number;
        date: Date;
        passenger: number;
        mode: string;
    }>(null);
    
    const [avenues, setAvenues] = useState<AvailableAvenue[]>([]);
    const [date, setDate] = useState<Date>(new Date());
    const [discount, setDiscount] = useState<number>(0);
    const [subtotal, setSubtotal] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [seat, setSeat] = useState<SeatTypeName>("economy");
    const [payment, setPayment] = useState<PaymentTypeName>("paypal");
    const [passengers, setPassengers] = useState<number>(1);
    const [trip, setTrip] = useState<AvailableAvenue | null>(null);
    const [checkout, setCheckout] = useState<boolean>(true);

    const handelTripSelect = (avenue: AvailableAvenue) => {
        setTrip(avenue);
        computePricing(avenue, seat, passengers);
    };

    const getPrice = (avenue: AvailableAvenue, seat: SeatTypeName): number => {
        if (seat === "first") return avenue.prices.first;
        if (seat === "business") return avenue.prices.business;
        return avenue.prices.economy;
    };

    const getSeat = (avenue: AvailableAvenue, seat: SeatTypeName): number => {
        if (seat === "first") return avenue.seat_availability.first;
        if (seat === "business") return avenue.seat_availability.business;
        return avenue.seat_availability.economy;
    };

    const computePricing = (avenue: AvailableAvenue, seatType: SeatTypeName, pax: number) => {
        const seatPrice = getPrice(avenue, seatType);
        const discountAmount = avenue.discount ? (seatPrice * avenue.discount / 100) : 0;
        const finalSubtotal = seatPrice * pax;
        const finalDiscount = discountAmount * pax;
        const finalTotal = finalSubtotal - finalDiscount;

        setSubtotal(finalSubtotal);
        setDiscount(finalDiscount);
        setTotal(finalTotal);
    };


    const fetchAvenueDetail = async (
        from: number,
        to: number,
        date: string,
        passenger: number,
        mode: string,
    ) => {
        try {
            const response = await avenueService.available(
                from,
                to,
                date,
                passenger,
                mode,
            );

            setAvenues(response.data);
            
            setTrip(null);
            setSubtotal(0);
            setDiscount(0);
            setTotal(0);
            setCheckout(true);

        } catch (err: ErrorResponse | any) {
            const errorMessage = err.response.data.message || "An error occurred. Please try again.";
            toast.error("Oops, " + errorMessage);
        }
    };

    useEffect(() => {
        const raw = searchParams.get("book");
        if (!raw) {
            router.push("/journey");
            return;
        }

        try {
            const decoded = atob(decodeURIComponent(raw));
            const parsed = JSON.parse(decoded);

            setJourney(parsed);

            setDate(parsed.date);
            setPassengers(parsed.passenger);

            fetchAvenueDetail(
                parsed.from,
                parsed.to,
                parsed.date,
                parsed.passenger,
                parsed.mode,
            );
        } catch {
            router.push("/journey");
            return;
        }

    }, [searchParams, router]);

    useEffect(() => {
        if (!journey) return;
        const formattedDate = new Date(date).toISOString().slice(0, 10);

        fetchAvenueDetail(
            journey.from,
            journey.to,
            formattedDate,
            passengers,
            journey.mode,
        );
    }, [date]);

    useEffect(() => {
        if (trip) {
            computePricing(trip, seat, passengers);
        }

        if (trip && seat && passengers) {
            setCheckout(false);
        }

        if (passengers < 1) {
            setCheckout(true);
        }

    }, [trip, seat, date, passengers]);

    const handelPayment = async () => {
        if (!trip) {
            toast.error("Please select a journey");
            return;
        }

        if (passengers < 1) {
            toast.error("Please select at least 1 passenger");
            return;
        }

        if (passengers > 10) {
            toast.error("You can only book up to 10 passengers at a time");
            return;
        }

        const mode = trip.travel_mode as SeatTypeName;
        if (getSeat(trip, mode) < passengers) {
            toast.error("Sorry, there are no more seats available");
            return;
        }

        const formattedDate = new Date(date).toISOString().slice(0, 10);

        try {
            const response = await bookingSearvice.create(
                trip.id,
                formattedDate,
                trip.travel_mode,
                seat,
                passengers,
                total,
                payment,
            );

            if(response.success){
                toast.success("Booking successful");
                router.push("/bookings");
            }
        } catch (err: ErrorResponse | any) {
            const errorMessage = err.response.data.message || "An error occurred. Please try again.";
            toast.error("Oops, " + errorMessage);
        }
    }

    if (!journey || !avenues) {
        return (
            <Compartment>
                <div className="flex flex-col items-center justify-center w-full h-screen">
                    <LoaderCircle className="animate-spin size-8 text-muted-foreground"/>
                </div>
            </Compartment>
        );
    }

    return (
        <Compartment>
            <section className="py-32">
                <div className="w-full">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <div>
                                <h1 className="text-2xl font-semibold">Available Journey</h1>
                                <p className="text-muted-foreground">
                                    {avenues.length} journey for you
                                </p>
                            </div>

                            <div className="space-y-4">
                                {!trip && (
                                    <Alert variant="default">
                                        <Terminal />
                                        <AlertTitle>Select a Trip First</AlertTitle>
                                        <AlertDescription>
                                            Trip selection is required to unlock the next steps.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                { avenues.length === 0 ? (
                                    <EmptySkeleton title="No available journey" description="Please try with different date" />
                                ) : (
                                    avenues.map((avenue, index) => (
                                        <Card 
                                            key={`avenue.id-${index}-${avenue.travel_mode}`} 
                                            className={cn(
                                                "overflow-hidden p-0 transition-transform transform hover:scale-102 duration-200 cursor-pointer",
                                            )} 
                                            onClick={() => handelTripSelect(avenue)}
                                        >
                                            <CardContent className="p-0">
                                                <div className="flex h-full flex-col md:flex-row">
                                                    <div className="flex-1 p-6 pb-3">
                                                        <div className="flex justify-between">
                                                            <div>
                                                                <h3 className="font-medium">
                                                                    {avenue.leave_destination.name} to {avenue.arrive_destination.name}
                                                                </h3>
                                                                <p className="text-muted-foreground text-sm">
                                                                    {formatTo12Hour(avenue.leave_time)} - {formatTo12Hour(avenue.arrive_time)}
                                                                </p>
                                                            </div>      
                                                            <span className="text-muted-foreground text-sm">
                                                                {format(new Date(date), "d LLL, yyyy")}
                                                            </span>                                      
                                                        </div>

                                                        <div className="mt-4 flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <ModeBadge mode={avenue.travel_mode}/>
                                                            </div>

                                                            <div className="text-right">
                                                                <div className="font-medium">
                                                                    £{(avenue.prices.economy - avenue.discount/100 * avenue.prices.economy).toFixed(2)}
                                                                </div>
                                                                {avenue.discount > 0 && (
                                                                    <div className="text-muted-foreground text-sm line-through">
                                                                        £{(avenue.prices.economy).toFixed(2)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Trip Summary</CardTitle>
                                    <CardDescription>
                                        Please review your trip details before proceeding.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>Seat</Label>
                                        <RadioGroup.Root
                                            value={seat}
                                            onValueChange={(value: string) => {
                                                setSeat(value as SeatTypeName);
                                                if (trip) computePricing(trip, value as SeatTypeName, passengers);
                                            }}
                                            className="max-w-md w-full grid grid-cols-3 gap-4"
                                        >
                                            {seatOptions.map(({ label, value, icon: Icon }) => (
                                                <RadioGroup.Item
                                                    key={value}
                                                    value={value}
                                                    className={cn(
                                                        "relative group ring-[1px] ring-border rounded py-2 px-3 text-start",
                                                        "data-[state=checked]:ring-3 data-[state=checked]:ring-muted-foreground-500"
                                                    )}
                                                >
                                                <CircleCheck className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-6 w-6 text-primary fill-muted-foreground stroke-background group-data-[state=unchecked]:hidden" />
                                                <Icon className="mb-2 text-muted-foreground h-5 w-5" />
                                                <span className="text-sm font-semibold tracking-tight">{label}</span>
                                                {trip && (
                                                    <p className="text-xs">
                                                        £{getPrice(trip, value).toFixed(2)}
                                                    </p>
                                                )}
                                                </RadioGroup.Item>
                                            ))}
                                        </RadioGroup.Root>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <DatePicker
                                            id="journey_date"
                                            value={date}
                                            onChange={(val: Date) => {
                                                setDate(val);
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Passenger</Label>
                                        <PassengerPicker 
                                            id="passenger_count"
                                            value={passengers}
                                            onChange={(val: number) => {
                                                setPassengers(val);
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Payment</Label>
                                        <RadioGroup.Root
                                            value={payment}
                                            onValueChange={(value: string) => {
                                                setPayment(value as PaymentTypeName);
                                            }}
                                            className="max-w-md w-full grid grid-cols-3 gap-4"
                                        >
                                            {paymentMethods.map(({ label, value }) => (
                                                <RadioGroup.Item
                                                    key={value}
                                                    value={value}
                                                    className={
                                                        cn("ring-[1px] ring-border rounded py-1 px-3 data-[state=checked]:ring-3 data-[state=checked]:ring-muted-foreground-500"
                                                    )}
                                                    >
                                                    <span className="text-sm tracking-tight">{label}</span>
                                                </RadioGroup.Item>
                                            ))}
                                        </RadioGroup.Root>
                                    </div>
                                    <div className="space-y-2">
                                        {trip && (
                                            <div className="flex justify-between text-sm">
                                                <span>Mode</span>
                                                <ModeBadge mode={trip.travel_mode}/>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm">
                                            <span>Subtotal</span>
                                            <span>£{subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Discount</span>
                                            <span>£{discount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-medium">
                                            <span>Total</span>
                                            <span>£{total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 border-t pt-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Package className="text-primary h-4 w-4" />
                                            <span>Free returns within 30 days</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Shield className="text-primary h-4 w-4" />
                                            <span>Secure payment</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Truck className="text-primary h-4 w-4" />
                                            <span>Fast delivery</span>
                                        </div>
                                    </div>

                                    <Button className="w-full" disabled={checkout} onClick={handelPayment}>
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Proceed to Checkout
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>
        </Compartment>
    );
}
