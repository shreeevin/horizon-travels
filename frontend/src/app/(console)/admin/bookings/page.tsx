"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BreadcrumbItem } from "@/types";
import { useBreadcrumbs } from "@/contexts/BreadcrumbsContext";
import HeadingSmall from "@/components/blocks/heading-small";
import { Booking, ErrorResponse } from "@/types/booking";
import { toast } from "sonner";
import bookingSearvice from "@/services/bookingSearvice";
import { DataTable } from "@/components/data-table-booking";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import { format } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from "@/components/datatable/column-header";
import { formatTo12Hour } from "@/lib/formatTime";
import { Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import { Ellipsis, Eye, TrashIcon, Check, X, QrCodeIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {QRCodeSVG} from 'qrcode.react';
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ModeBadge } from "@/components/blocks/landing/mode-badge";
import { SeatModeBadge } from "@/components/blocks/landing/seat-mode-badge";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin',
    },
    {
        title: 'Bookings',
        href: '/admin/bookings',
    },
];

type TicketScannedProps = {
    scanned: boolean;
}

export default function BookingPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const { setBreadcrumbs } = useBreadcrumbs();

    const fetchAllBookings = async () => {
        try {
            const response = await bookingSearvice.all();
            setBookings(response.data);
        } catch (err: ErrorResponse | any) {
            const errorMessage = err.response.data.message || "An error occurred. Please try again.";
            toast.error("Oops, " + errorMessage);
        }
    };

    useEffect(() => {        

        fetchAllBookings();
        setBreadcrumbs(breadcrumbs);
    }, []);
    
    const TicketScannedIcon = ({scanned} : TicketScannedProps) => {
        if (scanned) {
            return <Check className="h-4 w-4 text-green-500" />;
        } else {
            return <X className="h-4 w-4 text-red-500" />;
        }
    }

    const ViewEditAndDeleteDropdown = ({booking} : {booking: Booking}) => {
        const [processing, setProcessing] = useState(false);
        const [openViewDialog, setOpenViewDialog] = useState(false);
        const [openQrcodeDialog, setOpenQrcodeDialog] = useState(false);

        const onCancel = async () => {
            if(processing) return;
            if(booking.ticket === "scanned") {
                toast.error("Ticket has already been scanned.");
                return;
            }

            if(booking.status === "cancelled") {
                toast.error("Ticket has already been cancelled.");
                return;
            }

            setProcessing(true);
            try {
                const response = await bookingSearvice.cancel(booking.id);
                if(response.success) {
                    toast.success("Booking has been cancelled");
                    fetchAllBookings();    
                }

            } catch (err: ErrorResponse | any) {
                const errorMessage = err.response.data.message || "An error occurred. Please try again.";
                toast.error("Oops, " + errorMessage);
            } finally {
                setProcessing(false);
            }
        }

        return (
            <>
                <AlertDialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{booking.avenue.leave_destination.name} to {booking.avenue.arrive_destination.name}</AlertDialogTitle>
                            <AlertDialogDescription className="text-[15px]">
                                Your boarding journey information
                            </AlertDialogDescription>
                            <div className="py-6 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">User</p>
                                    <p className="text-sm font-medium capitalize">{booking.user.username}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Date</p>
                                    <p className="text-sm font-medium">{format(booking.date, 'dd MMMM, yyyy')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Time</p>
                                    <p className="text-sm font-medium">{formatTo12Hour(booking.avenue.leave_time)} - {booking.avenue.arrive_time}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Mode</p>
                                    <p className="text-sm font-medium capitalize">                                                                
                                        <ModeBadge mode={booking.mode}/>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Seat</p>
                                    <p className="text-sm font-medium capitalize"><SeatModeBadge mode={booking.type}/></p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Price</p>
                                    <p className="text-sm font-medium capitalize">£{booking.price.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Passenger</p>
                                    <p className="text-sm font-medium capitalize"><Badge variant="outline">{booking.seat}</Badge></p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                                    <p className="text-sm font-medium capitalize">{booking.status}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Ticket</p>
                                    <p className="text-sm font-medium capitalize">{booking.ticket}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Payment</p>
                                    <p className="text-sm font-medium capitalize">
                                        {booking.transactions[0]?.payment_method || "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Created on</p>
                                    <p className="text-sm font-medium">
                                        {format(booking.date, 'dd MMMM, yyyy')}
                                    </p>
                                </div>
                            </div>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Close</AlertDialogCancel>
                            <AlertDialogAction onClick={() => setOpenQrcodeDialog(true)}><QrCodeIcon /> View Ticket</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={openQrcodeDialog} onOpenChange={setOpenQrcodeDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{booking.avenue.leave_destination.name} to {booking.avenue.arrive_destination.name}</AlertDialogTitle>
                            <AlertDialogDescription className="text-[15px]">
                                Scan this ticket to board your journey.
                            </AlertDialogDescription>
                            <figure className="shrink-0 my-6">    
                                <div className="flex items-center justify-center w-full">
                                    <div className="inline-flex items-center justify-center border bg-white rounded-md p-2">                                        
                                        <QRCodeSVG                                      
                                            value={booking.identifier} 
                                            size={128} 
                                            level="H" 
                                            fgColor="#000000" 
                                            bgColor="#ffffff" 
                                        />
                                    </div>                                              
                                </div>

                                <figcaption className="pt-4 text-xs text-muted-foreground flex justify-between gap-1 mt-2">
                                    <span className="uppercase">#{booking.identifier}</span>
                                    <Badge variant="outline">
                                        <span className="capitalize">{booking.ticket}</span>
                                    </Badge>
                                </figcaption>
                            </figure>        
                            <p className="text-sm text-muted-foreground mb-2">
                                If you have any questions regarding this ticket, feel free to reach out through our{' '}
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
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Close</AlertDialogCancel>
                            <AlertDialogAction onClick={() => setOpenViewDialog(true)}> <Eye /> View info</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Ellipsis />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="mt-2">
                        <DropdownMenuItem onClick={() => setOpenViewDialog(true)}>
                            <Eye className="mr-1" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setOpenQrcodeDialog(true)}>
                            <QrCodeIcon className="mr-1" /> Ticket
                        </DropdownMenuItem>   
                        <DropdownMenuSeparator/> 
                        <DropdownMenuItem onClick={onCancel} disabled={processing}>
                            <TrashIcon className="mr-1" /> Cancel
                        </DropdownMenuItem>         
                    </DropdownMenuContent>
                </DropdownMenu>
            </>
        );
    }
    const columns: ColumnDef<Booking>[] = [
        {
            id: "id",
            accessorKey: "id",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />                
            ),
            cell: ({ row }) => {
                return (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                );
            },
            enableSorting: false,
            enableHiding: false,
        },        
        {
            accessorKey: "identifier",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Identifier" />
            ),
            enableSorting: false,
            enableHiding: false,
            filterFn: (row, id, value) => {
                const rowValue = (row.getValue(id) as string)?.toLowerCase() ?? "";
                const searchValue = (value as string).toLowerCase();
                return rowValue.includes(searchValue);
            },
        }, 
        {
            accessorKey: "name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Name" />
            ),            
            enableSorting: true,
            enableHiding: true,
            cell: ({ row }) => (
                <div className="capitalize">
                    {row.original.user.username}
                </div>                
            ),
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        }, 
        {
            accessorKey: "destination",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Destination" />
            ),            
            enableSorting: true,
            enableHiding: true,
            cell: ({ row }) => (
                <div className="capitalize">
                    {row.original.avenue.leave_destination.name} to {row.original.avenue.arrive_destination.name}
                </div>                
            ),
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "date",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Date" />
            ),
            cell: ({ row }) => {
                return (
                <div className="flex w-[100px] items-center">
                    <span className="capitalize">            
                        {format(new Date(row.original.date), 'dd MMM, yyyy')}
                    </span>
                </div>
                );
            },
            enableSorting: true,
            enableHiding: true,
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "seat",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Seat" />
            ),            
            enableSorting: true,
            enableHiding: true,
            cell: ({ row }) => ( 
                <Badge variant="outline">{row.original.seat}</Badge>             
            ),
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "ticket",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Ticket" />
            ),            
            enableSorting: true,
            enableHiding: true,
            cell: ({ row }) => (
                <Tooltip>
                    <TooltipTrigger>
                        <TicketScannedIcon scanned={row.original.ticket === "scanned"} />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="capitalize">{row.original.ticket}</p>
                    </TooltipContent>
                </Tooltip>
            ),
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Status" />
            ),            
            enableSorting: true,
            enableHiding: true,
            cell: ({ row }) => (
                <div className="capitalize">
                    {row.getValue("status")}
                </div>                
            ),
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            id: "actions",
            cell: ({ row }) => { 
                return <ViewEditAndDeleteDropdown booking={row.original} />                    
            },
            enableSorting: false,
            enableHiding: false,
        },
    ];

    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl px-4 py-6">
            <div className="my-4">
                <HeadingSmall
                    title="Bookings"
                    description="Manage journey tickets"
                />
                <div className="py-6 w-full">
                    <DataTable columns={columns} data={bookings} />
                </div>
            </div>
        </div>
    );
}