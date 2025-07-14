"use client";

import { useEffect, useState } from "react";
import { BreadcrumbItem } from "@/types";
import { useBreadcrumbs } from "@/contexts/BreadcrumbsContext";
import HeadingSmall from "@/components/blocks/heading-small";
import { DataTable } from '@/components/data-table-avenue';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from "@/components/datatable/column-header";

import { format } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorResponse, Avenue } from "@/types/avenue";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Ellipsis, Eye,  PenBox, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import avenueService from "@/services/avenueService";
import { formatTo12Hour } from "@/lib/formatTime";
import slugify from "slugify";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Avenues',
        href: '/admin/avenues',
    }
];

type EditAndDeleteProps = {
    avenue: Avenue;
}

export default function AvenuesPages() {
    const router = useRouter();
    
    const [avenues, setAvenues] = useState<Avenue[]>([]);
    const { setBreadcrumbs } = useBreadcrumbs();

    const fetchAvenues = async () => {
        try {
            const response = await avenueService.all();
            setAvenues(response.data);
        } catch (err: ErrorResponse | any) {
            const errorMessage = err.response.data.message || "An error occurred. Please try again.";
            toast.error("Oops, " + errorMessage);
        }
    };

    useEffect(() => {       
        fetchAvenues();
        setBreadcrumbs(breadcrumbs);
    }, []);

    const EditAndDeleteDropdown = ({ avenue } : EditAndDeleteProps) => {
        const [processing, setProcessing] = useState(false);

        const onEdit = () => {
            router.push(`/admin/avenues/edit/${avenue.id}`);
        }

        const onView = () => {
            const journeyData = {
                from: avenue.leave_destination.id,
                to: avenue.arrive_destination.id,
                date: (new Date()).toISOString(),
                passenger: 1,
            };

            const leave = slugify(avenue.leave_destination.name, { lower: true });
            const arrive = slugify(avenue.arrive_destination.name, { lower: true });
            const slug = `${leave}-to-${arrive}`;
            
            const encoded = encodeURIComponent(btoa(JSON.stringify(journeyData)));
            router.push(`/journey/${slug}?book=${encoded}`);
        }
        
        async function onDelete() {
            setProcessing(true)
            try {
                const response = await avenueService.delete(avenue.id);
                if(response.success){
                    toast.info("Deleted avenue from " + avenue.leave_destination.name + " to " + avenue.arrive_destination.name + " successfully");
                    fetchAvenues();
                }
            } catch (err: ErrorResponse | any) {
                const errorMessage = err.response.data.message || "An error occurred. Please try again.";
                toast.error("Oops, " + errorMessage);
            } finally {
                setProcessing(false);
            }
        }

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Ellipsis />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="mt-2">
                    <DropdownMenuItem onClick={onEdit} disabled={processing}>
                        <PenBox className="mr-1" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onView} disabled={processing}>
                        <Eye className="mr-1" /> View
                    </DropdownMenuItem>      
                    <DropdownMenuSeparator/> 
                    <DropdownMenuItem onClick={onDelete} disabled={processing}>
                        <TrashIcon className="mr-1" /> Delete
                    </DropdownMenuItem>         
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }
    const columns: ColumnDef<Avenue>[] = [
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
            accessorKey: "leave_destination",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="From" />
            ),            
            enableSorting: true,
            enableHiding: true,
            cell: ({ row }) => (
                <div className="capitalize">
                    {row.original.leave_destination.name}
                </div>   
            ),
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "arrive_destination",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="To" />
            ),            
            enableSorting: true,
            enableHiding: true,
            cell: ({ row }) => (
                <div className="capitalize">
                    {row.original.arrive_destination.name}
                </div>   
            ),
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "leave_time",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Leave" />
            ),            
            enableSorting: true,
            enableHiding: true,
            cell: ({ row }) => (
                <div className="capitalize">
                    {formatTo12Hour(row.getValue("leave_time"))}
                </div>                
            ),
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "arrive_time",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Arrive" />
            ),            
            enableSorting: true,
            enableHiding: true,
            cell: ({ row }) => (
                <div className="capitalize">
                    {formatTo12Hour(row.getValue("arrive_time"))}
                </div>                
            ),
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "price",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Price" />
            ),            
            enableSorting: true,
            enableHiding: true,
            cell: ({ row }) => (
                <div className="capitalize">
                    £{row.original.price.air}
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
            accessorKey: "created_at",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Date" />
            ),
            cell: ({ row }) => {

                return (
                <div className="flex w-[100px] items-center">
                    <span className="capitalize">            
                        {format(new Date(row.getValue("created_at")), ' dd MMMM, yyyy')}
                    </span>
                </div>
                );
            },
            enableSorting: true,
            enableHiding: true,
            filterFn: (row, id, value) => {
                const rowDate = new Date(row.getValue(id));
                const [startDate, endDate] = value;
                return rowDate >= startDate && rowDate <= endDate;
            },
        },
        {
            accessorKey: "combined_destination",
            header: () => null,
            cell: () => null,
            enableHiding: false,
            enableSorting: false,
            filterFn: (row, id, value) => {
                const leave = row.original.leave_destination?.name?.toLowerCase() || "";
                const arrive = row.original.arrive_destination?.name?.toLowerCase() || "";
                const searchValue = value.toLowerCase();
                return leave.includes(searchValue) || arrive.includes(searchValue);
            },
        },     
        {
            id: "actions",
            cell: ({ row }) => { 
                return <EditAndDeleteDropdown avenue={row.original} />                    
            },
            enableSorting: false,
            enableHiding: false,
        },
    ];

    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl px-4 py-6">
            <div className="my-4">
                <HeadingSmall
                    title="Avenues"
                    description="Manage travel avenues"
                />

                <div className="py-6 w-full">
                    <DataTable columns={columns} data={avenues} />
                </div>
            </div>
        </div>
    );
}