"use client";

import { useEffect, useState } from "react";
import { BreadcrumbItem } from "@/types";
import { useBreadcrumbs } from "@/contexts/BreadcrumbsContext";
import HeadingSmall from "@/components/blocks/heading-small";
import { DataTable } from '@/components/data-table-changelog';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from "@/components/datatable/column-header";

import { format } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorResponse } from "@/types/faq";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Check, CheckCheck, Ellipsis, Eye,  FileClock,  FileClockIcon,  MessageCircleMore,  PenBox, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import changelogService from "@/services/changelogService";
import { Changelog } from "@/types/changelog";

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { CircleFadingArrowUp, Rocket } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Changelogs',
        href: '/admin/changelogs',
    }
];

type EditViewAndDeleteProps = {
    changelog: Changelog;
}

export default function ChangelogsPages() {
    const router = useRouter();
    
    const [changelogs, setChangelogs] = useState<Changelog[]>([]);
    const { setBreadcrumbs } = useBreadcrumbs();

    const fetchChangelogs = async () => {
        try {
            const response = await changelogService.all();
            setChangelogs(response.data);
        } catch (err: ErrorResponse | any) {
            const errorMessage = err.response.data.message || "An error occurred. Please try again.";
            toast.error("Oops, " + errorMessage);
        }
    };

    useEffect(() => {        

        fetchChangelogs();
        setBreadcrumbs(breadcrumbs);
    }, []);

    const EditViewAndDeleteDropdown = ({ changelog } : EditViewAndDeleteProps) => {
        const [processing, setProcessing] = useState(false);

        const onEdit = () => {
            router.push(`/admin/changelogs/edit/${changelog.id}`);
        }

        const onView = () => {
            router.push('/changelog');
        }
        
        async function onDelete() {
            setProcessing(true)
            try {
                const response = await changelogService.delete(changelog.id);
                if(response.success){
                    toast.info("Deleted " + changelog.name + " successfully");
                    fetchChangelogs();
                }
            } catch (err: ErrorResponse | any) {
                const errorMessage = err.response.data.message || "An error occurred. Please try again.";
                toast.error("Oops, " + errorMessage);
            } finally {
                setProcessing(false);
            }
        }

        return (
            <div className="flex">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Eye />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <div className="mx-auto sm:mx-0 mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                            <FileClockIcon className="h-[18px] w-[18px] text-primary" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-bold tracking-tight">
                            {changelog.name}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="!mt-3 text-[15px]">
                            <div
                                className="tiptap text-muted-foreground"
                                dangerouslySetInnerHTML={{ __html: changelog.content }}
                            />
                        </AlertDialogDescription>
                        <div className="!mt-6 flex flex-wrap gap-2">
                            <Badge variant="secondary" className="py-1">
                                v{changelog.version}
                            </Badge>
                            <Badge variant="outline" className="py-1">
                                {format(new Date(changelog.created_at), 'dd MMMM, yyyy')}
                            </Badge>                                    
                        </div>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-4">
                            <AlertDialogCancel>Close</AlertDialogCancel>
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
            </div>
        );
    }

    const columns: ColumnDef<Changelog>[] = [
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
            enableHiding: true,
            filterFn: (row, id, value) => {
                const rowValue = (row.getValue(id) as string)?.toLowerCase() ?? "";
                const searchValue = (value as string).toLowerCase();
                return rowValue.includes(searchValue);
            },
        },
        {
            accessorKey: "version",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Version" />
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
                return( 
                    <EditViewAndDeleteDropdown
                        changelog={row.original} 
                    />                  
                );
            },
            enableSorting: false,
            enableHiding: false,
        },
    ];

    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl px-4 py-6">
            <div className="my-4">
                <HeadingSmall
                    title="Change Logs"
                    description="Manage system change logs"
                />

                <div className="py-6 w-full">
                    <DataTable columns={columns} data={changelogs} />
                </div>
            </div>
        </div>
    );
}