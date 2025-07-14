"use client";

import { useEffect, useState } from "react";
import { BreadcrumbItem } from "@/types";
import { useBreadcrumbs } from "@/contexts/BreadcrumbsContext";
import HeadingSmall from "@/components/blocks/heading-small";
import { DataTable } from '@/components/data-table-destination';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from "@/components/datatable/column-header";

import { format } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorResponse, Destination } from "@/types/destination";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Check, Ellipsis, Eye,  PenBox, TrashIcon, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import destinationService from "@/services/destinationService";
import slugify from "slugify";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Destinations',
        href: '/admin/destinations',
    }
];

type EditAndDeleteProps = {
    destination: Destination;
}

type MethodAvibilityProps = {
    avibility: boolean;
}

export default function DestinationPages() {
    const router = useRouter();
    
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const { setBreadcrumbs } = useBreadcrumbs();

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

    const MethodAvibilityIcon = ({avibility} : MethodAvibilityProps) => {
        if (avibility) {
            return <Check className="h-4 w-4 text-green-500" />;
        } else {
            return <X className="h-4 w-4 text-red-500" />;
        }
    }

    const EditAndDeleteDropdown = ({ destination } : EditAndDeleteProps) => {
        const [processing, setProcessing] = useState(false);

        const onEdit = () => {
            router.push(`/admin/destinations/edit/${destination.id}`);
        }

        const onView = () => {
            const journeyData = {
                from: destination.id,
                date: (new Date()).toISOString(),
                passenger: 1,
            };
            
            const slug = slugify(destination.name, { lower: true, strict: true });
            const encoded = encodeURIComponent(btoa(JSON.stringify(journeyData)));
            router.push(`/journey/${slug}?book=${encoded}`);
        }
        
        async function onDelete() {
            setProcessing(true)
            try {
                const response = await destinationService.delete(destination.id);
                if(response.success){
                    toast.info("Deleted " + destination.name + " successfully");
                    fetchDestinations();
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
    
    const columns: ColumnDef<Destination>[] = [
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
            accessorKey: "name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Name" />
            ),
            enableSorting: true,
            enableHiding: false,
            filterFn: (row, id, value) => {
                const rowValue = (row.getValue(id) as string)?.toLowerCase() ?? "";
                const searchValue = (value as string).toLowerCase();
                return rowValue.includes(searchValue);
            },
        },
        {
            accessorKey: "air",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Air" />
            ),
            enableSorting: true,
            enableHiding: true,
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
            cell: ({ row }) => { 
                return <MethodAvibilityIcon avibility={row.original.modes.air} />                    
            },
        },      
        {
            accessorKey: "coach",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Coach" />
            ),
            enableSorting: true,
            enableHiding: true,
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
            cell: ({ row }) => { 
                return <MethodAvibilityIcon avibility={row.original.modes.coach} />                    
            },
        },  
        {
            accessorKey: "train",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Train" />
            ),
            enableSorting: true,
            enableHiding: true,
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
            cell: ({ row }) => { 
                return <MethodAvibilityIcon avibility={row.original.modes.train} />                    
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
            id: "actions",
            cell: ({ row }) => { 
                return <EditAndDeleteDropdown destination={row.original} />                    
            },
            enableSorting: false,
            enableHiding: false,
        },
    ];

    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl px-4 py-6">
            <div className="my-4">
                <HeadingSmall
                    title="Destinations"
                    description="Manage travel destinations"
                />

                <div className="py-6 w-full">
                    <DataTable columns={columns} data={destinations} />
                </div>
            </div>
        </div>
    );
}