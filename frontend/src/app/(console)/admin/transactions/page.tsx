"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BreadcrumbItem } from "@/types";
import { useBreadcrumbs } from "@/contexts/BreadcrumbsContext";
import HeadingSmall from "@/components/blocks/heading-small";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table-transaction";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import { format } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from "@/components/datatable/column-header";
import { Ellipsis, Eye, TrashIcon, TicketCheckIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import transactionSearvice from "@/services/transactionSearvice";
import { Transaction, ErrorResponse } from "@/types/transaction";
import bookingSearvice from "@/services/bookingSearvice";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin',
    },
    {
        title: 'Transactions',
        href: '/admin/transactions',
    },
];

export default function TransactionPage() {
    const router = useRouter();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const { setBreadcrumbs } = useBreadcrumbs();

    const fetchTransactions = async () => {
        try {
            const response = await transactionSearvice.all();
            setTransactions(response.data);
        } catch (err: ErrorResponse | any) {
            const errorMessage = err.response.data.message || "An error occurred. Please try again.";
            toast.error("Oops, " + errorMessage);
        }
    };

    useEffect(() => {       
        fetchTransactions();
        setBreadcrumbs(breadcrumbs);
    }, []);

    const ViewEditAndDeleteDropdown = ({transaction} : {transaction: Transaction}) => {
        const [processing, setProcessing] = useState(false);
        const [openViewDialog, setOpenViewDialog] = useState(false);

        const viewBooking = async () => {
            router.push(`/admin/bookings`);
        }

        const onCancel = async () => {
            if(processing) return;
            if(transaction.booking.ticket === "scanned") {
                toast.error("Ticket has already been scanned.");
                return;
            }

            if(transaction.booking.status === "cancelled") {
                toast.error("Ticket has already been cancelled.");
                return;
            }

            setProcessing(true);
            try {
                const response = await bookingSearvice.cancel(transaction.booking.id);
                if(response.success) {
                    toast.success("Booking has been cancelled");
                    fetchTransactions();    
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
                            <AlertDialogTitle>{transaction.booking.avenue.leave_destination.name} to {transaction.booking.avenue.arrive_destination.name}</AlertDialogTitle>
                            <AlertDialogDescription className="text-[15px]">
                                Booking transaction information
                            </AlertDialogDescription>
                            <div className="py-6 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">User</p>
                                    <p className="text-sm font-medium capitalize">{transaction.booking.user.username}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                                    <p className="text-sm font-medium"><Badge variant="outline">{transaction.booking.user.email}</Badge></p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Booking Identifier</p>
                                    <p className="text-sm font-medium capitalize uppercase">{transaction.booking.identifier}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Transaction Identifier</p>
                                    <p className="text-sm font-medium capitalize uppercase">{transaction.identifier}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Date</p>
                                    <p className="text-sm font-medium">{format(transaction.booking.date, 'dd MMMM, yyyy')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                                    <p className="text-sm font-medium capitalize">{transaction.status}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Type</p>
                                    <p className="text-sm font-medium capitalize">{transaction.type}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Payment</p>
                                    <p className="text-sm font-medium capitalize">
                                        {transaction.payment_method}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Created on</p>
                                    <p className="text-sm font-medium">
                                        {format(transaction.created_at, 'dd MMMM, yyyy')}
                                    </p>
                                </div>
                            </div>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Close</AlertDialogCancel>
                            <AlertDialogAction onClick={viewBooking}><TicketCheckIcon /> View booking</AlertDialogAction>
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
                        <DropdownMenuSeparator/> 
                        <DropdownMenuItem onClick={onCancel} disabled={processing}>
                            <TrashIcon className="mr-1" /> Cancel
                        </DropdownMenuItem>         
                    </DropdownMenuContent>
                </DropdownMenu>
            </>
        );
    }
    const columns: ColumnDef<Transaction>[] = [
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
            accessorKey: "method",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Method" />
            ),            
            enableSorting: true,
            enableHiding: true,
            cell: ({ row }) => (
                <div className="capitalize">
                    {row.original.payment_method}
                </div>                
            ),
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "price",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Amount" />
            ),            
            enableSorting: true,
            enableHiding: true,
            cell: ({ row }) => (
                <div className="capitalize">
                    £{row.original.amount.toFixed(2)}
                </div>                
            ),
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "type",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Type" />
            ),            
            enableSorting: true,
            enableHiding: true,
            cell: ({ row }) => (
                <div className="capitalize">
                    {row.getValue("type")}
                </div>                
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
                return <ViewEditAndDeleteDropdown transaction={row.original} />;
            },
            enableSorting: false,
            enableHiding: false,
        },
    ];

    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl px-4 py-6">
            <div className="my-4">
                <HeadingSmall
                    title="Transactions"
                    description="Manage passenger transactions"
                />
                <div className="py-6 w-full">
                    <DataTable columns={columns} data={transactions} />
                </div>
            </div>
        </div>
    );
}