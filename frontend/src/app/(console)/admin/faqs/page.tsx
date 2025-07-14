"use client";

import { useEffect, useState } from "react";
import { BreadcrumbItem } from "@/types";
import { useBreadcrumbs } from "@/contexts/BreadcrumbsContext";
import HeadingSmall from "@/components/blocks/heading-small";
import { DataTable } from '@/components/data-table-faqs';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from "@/components/datatable/column-header";

import { format } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorResponse } from "@/types/faq";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Ellipsis, Eye,  PenBox, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import faqService from "@/services/faqService";
import { Faq } from "@/types/faq";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Faqs',
        href: '/admin/faqs',
    }
];

type EditAndDeleteProps = {
    id: number;
    question: string;
}

export default function FaqsPages() {
    const router = useRouter();
    
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const { setBreadcrumbs } = useBreadcrumbs();

    const fetchFaqs = async () => {
        try {
            const response = await faqService.all();
            setFaqs(response.data);
        } catch (err: ErrorResponse | any) {
            const errorMessage = err.response.data.message || "An error occurred. Please try again.";
            toast.error("Oops, " + errorMessage);
        }
    };

    useEffect(() => {        

        fetchFaqs();
        setBreadcrumbs(breadcrumbs);
    }, []);

    const EditAndDeleteDropdown = ({ id, question} : EditAndDeleteProps) => {
        const [processing, setProcessing] = useState(false);

        const onEdit = () => {
            router.push(`/admin/faqs/edit/${id}`);
        }

        const onView = () => {
            router.push('/help');
        }
        
        async function onDelete() {
            setProcessing(true)
            try {
                const response = await faqService.delete(id);
                if(response.success){
                    toast.info("Deleted " + question + " successfully");
                    fetchFaqs();
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
    const columns: ColumnDef<Faq>[] = [
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
            accessorKey: "question",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="question" />
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
                return <EditAndDeleteDropdown id={row.getValue("id")} question={row.getValue("question")} />                    
            },
            enableSorting: false,
            enableHiding: false,
        },
    ];

    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl px-4 py-6">
            <div className="my-4">
                <HeadingSmall
                    title="Faqs"
                    description="Manage system FAQs"
                />

                <div className="py-6 w-full">
                    <DataTable columns={columns} data={faqs} />
                </div>
            </div>
        </div>
    );
}