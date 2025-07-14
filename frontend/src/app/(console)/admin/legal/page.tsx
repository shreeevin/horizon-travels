"use client";

import { useEffect, useState } from "react";
import { BreadcrumbItem } from "@/types";
import { useBreadcrumbs } from "@/contexts/BreadcrumbsContext";
import HeadingSmall from "@/components/blocks/heading-small";
import { DataTable } from '@/components/data-table-legal';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from "@/components/datatable/column-header";

import { format } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorResponse, Legal } from "@/types/legal";
import axiosInstance from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Ellipsis, Eye,  PenBox, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import legalService from "@/services/legalService";
import { useRouter } from "next/navigation";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Legal',
        href: '/admin/legal',
    }
];

type EditAndDeleteProps = {
    id: number;
    name: string;
    slug: string;
}

export default function LegalPages() {
    const router = useRouter();
    
    const [legals, setLegals] = useState<Legal[]>([]);
    const { setBreadcrumbs } = useBreadcrumbs();

    const fetchLegals = async () => {
        try {
            const response = await axiosInstance.get("/api/admin/legal/pages");
            setLegals(response.data.pages);
        } catch (err: ErrorResponse | any) {
            const errorMessage = err.response.data.message || "An error occurred. Please try again.";
            toast.error("Oops, " + errorMessage);
        }
    };

    useEffect(() => {        

        fetchLegals();
        setBreadcrumbs(breadcrumbs);
    }, []);

    const EditAndDeleteDropdown = ({ id, name, slug} : EditAndDeleteProps) => {
        const [processing, setProcessing] = useState(false);

        const onEdit = () => {
            router.push(`/admin/legal/edit/${id}`);
        }

        const onView = () => {
            router.push(`/legal/${slug}`);
        }
        
        async function onDelete() {
            setProcessing(true)
            try {
                const response = await legalService.delete(id);
                if(response.success){
                    toast.info("Deleted " + name + " successfully");
                    fetchLegals();
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
    const columns: ColumnDef<Legal>[] = [
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
                <DataTableColumnHeader column={column} title="name" />
            ),
            enableSorting: true,
            enableHiding: true,
            filterFn: (row, id, value) => {
                const rowValue = (row.getValue(id) as string)?.toLowerCase() ?? "";
                const searchValue = (value as string).toLowerCase();
                return rowValue.includes(searchValue);
            },
        },
        {
            accessorKey: "slug",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="slug" />
            ),            
            enableSorting: true,
            enableHiding: true,
            cell: ({ row }) => (
                <Badge variant="outline">{row.getValue("slug")}</Badge>
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
            id: "actions",
            cell: ({ row }) => { 
                return <EditAndDeleteDropdown id={row.getValue("id")} name={row.getValue("name")} slug={row.getValue("slug")} />                    
            },
            enableSorting: false,
            enableHiding: false,
        },
    ];

    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl px-4 py-6">
            <div className="my-4">
                <HeadingSmall
                    title="Legal"
                    description="Manage legal pages"
                />

                <div className="py-6 w-full">
                    <DataTable columns={columns} data={legals} />
                </div>
            </div>
        </div>
    );
}