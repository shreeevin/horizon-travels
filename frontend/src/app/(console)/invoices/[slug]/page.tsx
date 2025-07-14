"use client";

import HeadingSmall from "@/components/blocks/heading-small";
import { useBreadcrumbs } from "@/contexts/BreadcrumbsContext";
import { BreadcrumbItem } from "@/types";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Booking } from "@/types/booking";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import Link from "next/link";
import AppLogoIcon from "@/components/blocks/app-logo-icon";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Invoices',
        href: '/invoices',
    },
    {
        title: 'Detail',
        href: '/invoices',
    }
];

export default function InvoicePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [booking, setBooking] = useState<Booking | null>(null);

    const { setBreadcrumbs } = useBreadcrumbs();
    useEffect(() => {        
        setBreadcrumbs(breadcrumbs);
    }, []);

    useEffect(() => {
        const raw = searchParams.get("token");
        if (!raw) {
            router.push("/journey");
            return;
        }

        try {
            const decoded = atob(decodeURIComponent(raw));
            const parsed = JSON.parse(decoded);

            setBooking(parsed);
        } catch {
            router.push("/invoices");
            return;
        }
    }, [searchParams, router]);

    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl px-4 py-6">
            <div className="my-4">
                <HeadingSmall
                    title="Invoice"
                    description="Manage your booking invoice"
                />
                <div className="py-6 w-full">
                    {booking && (
                        <Card className="w-full my-6">
                            <CardHeader className="flex flex-row justify-between mb-12">
                                <Link 
                                    href="/" 
                                    className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md"
                                >
                                    <AppLogoIcon className= "size-5 fill-current text-white dark:text-black" />
                                </Link>

                                <div className="flex flex-col text-right">
                                    <CardTitle className="text-2xl">Invoice #{booking.identifier}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{format(new Date(booking.created_at), 'dd MMMM, yyyy hh:mm a')}</p>

                                    <div className="text-muted-foreground mt-12">
                                        <p className="text-sm">Horizen Travels LLC</p>
                                        <p className="text-sm">Bristol BS1 6QH, United Kingdom</p>
                                        <p className="text-sm">hello@horizen.com</p>
                                        <p className="text-sm">+44 078 6875 5398</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col md:flex-row justify-between my-12 gap-4">
                                    <div className="mb-2 text-left">
                                        <h3 className="font-semibold text-lg mb-2">From</h3>
                                        <p className="text-muted-foreground">Horizen Travels LLC</p>
                                        <p className="text-muted-foreground">Bristol BS1 6QH, United Kingdom</p>
                                        <p className="text-muted-foreground">hello@horizen.com</p>
                                    </div>
                                    <div className="mb-2 text-left md:text-right">
                                        <h3 className="font-semibold text-lg mb-2">To</h3>
                                        <p className="text-muted-foreground capitalize">{booking.user.username}</p>
                                        <p className="text-muted-foreground">{booking.user.email}</p>
                                    </div>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Identifier</TableHead>                                
                                            <TableHead>Journery</TableHead>
                                            <TableHead>Datetime</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Class</TableHead>
                                            <TableHead>Seat</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-medium">{booking.identifier}</TableCell>
                                            <TableCell className="capitalize">{booking.avenue.leave_destination.name} to {booking.avenue.arrive_destination.name}</TableCell>
                                            <TableCell className="capitalize">{format(new Date(booking.date), 'dd MMM, yyyy')}</TableCell>
                                            <TableCell className="capitalize">{booking.status}</TableCell>
                                            <TableCell className="capitalize">{booking.type}</TableCell>
                                            <TableCell>x {booking.seat}</TableCell>
                                            <TableCell className="text-right">Rs. {booking.price.toFixed(2)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                                
                                <div className="mt-12 md:mt-24 mb-8">
                                    <h3 className="font-semibold text-md mb-2 text-muted-foreground">Transactions</h3>
                                    <Table >
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Identifier</TableHead>                                
                                                <TableHead>Gateway</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {booking.transactions.map((transaction, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{transaction.identifier}</TableCell>
                                                    <TableCell className="capitalize">{transaction.payment_method}</TableCell>
                                                    <TableCell className="capitalize">{transaction.status}</TableCell>
                                                    <TableCell className="capitalize">{transaction.type}</TableCell>
                                                    <TableCell className="capitalize">{format(new Date(transaction.created_at), 'dd MMM, yyyy')}</TableCell>
                                                    <TableCell className="text-right">{transaction.amount.toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <Separator className="mt-12 md:mt-24 mb-8" />

                                <div className="flex justify-end my-6">
                                    <div className="w-full md:w-1/4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Subtotal</span>
                                            <span>£{booking.price.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Shipping</span>
                                            <span>£{0.0.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-medium">
                                            <span>Total</span>
                                            <span>£{booking.price.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>                        
                            </CardContent>
                            <CardFooter>
                                <p className="text-sm text-muted-foreground mt-12 mb-2">
                                    If you have any questions regarding this invoice, feel free to reach out through our{' '}
                                    <Link 
                                        href="/contact"
                                        className="hover:underline text-primary"
                                    >
                                        support center
                                    </Link>{' '}
                                    or visit our website at{' '}
                                    <Link
                                        href="/"
                                        className="hover:underline text-primary"
                                    >
                                        horizen.com
                                    </Link>
                                    .
                                </p>
                            </CardFooter>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}