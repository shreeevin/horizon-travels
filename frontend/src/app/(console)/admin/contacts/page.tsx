"use client";

import { useEffect, useState } from "react";
import { BreadcrumbItem } from "@/types";
import { useBreadcrumbs } from "@/contexts/BreadcrumbsContext";
import HeadingSmall from "@/components/blocks/heading-small";
import { DataTable } from '@/components/data-table-contact';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from "@/components/datatable/column-header";

import { format } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorResponse } from "@/types/faq";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Check, CheckCheck, Ellipsis, Eye,  MessageCircleMore,  PenBox, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import contactService from "@/services/contactService";
import { Contact } from "@/types/contact";

import {
    AlertDialog,
    AlertDialogAction,
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
        title: 'Contacts',
        href: '/admin/contacts',
    }
];

type EditViewAndDeleteProps = {
    contact: Contact;
}

export default function ContactsPages() {
    const router = useRouter();
    
    const [contacts, setContacts] = useState<Contact[]>([]);
    const { setBreadcrumbs } = useBreadcrumbs();

    const fetchContacts = async () => {
        try {
            const response = await contactService.all();
            setContacts(response.data);
        } catch (err: ErrorResponse | any) {
            const errorMessage = err.response.data.message || "An error occurred. Please try again.";
            toast.error("Oops, " + errorMessage);
        }
    };

    useEffect(() => {        

        fetchContacts();
        setBreadcrumbs(breadcrumbs);
    }, []);

    const EditViewAndDeleteDropdown = ({ contact } : EditViewAndDeleteProps) => {
        const [processing, setProcessing] = useState(false);

        const onEdit = () => {
            router.push(`/admin/contacts/edit/${contact.id}`);
        }

        const onMark = async () => {
            setProcessing(true)
            try {
                const toggle = contact.status  === 'unread' ? 'read' : 'unread';
                const response = await contactService.update(contact.id, toggle);
                if(response.success){
                    toast.success("Marked " + contact.name + "'s contact message" + " as read successfully");
                    fetchContacts();
                }
            } catch (err: ErrorResponse | any) {
                const errorMessage = err.response.data.message || "An error occurred. Please try again.";
                toast.error("Oops, " + errorMessage);
            } finally {
                setProcessing(false);
            }
        }
        
        async function onDelete() {
            setProcessing(true)
            try {
                const response = await contactService.delete(contact.id);
                if(response.success){
                    toast.info("Deleted " + contact.name + "'s contact message" + " successfully");
                    fetchContacts();
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
                    <DropdownMenuItem onClick={onMark} disabled={processing}>
                        { contact.status  === 'unread' ? <CheckCheck className="mr-1" /> : <Check className="mr-1" /> }
                        Mark as {contact.status  === 'unread' ? 'read' : 'unread'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator/> 
                    <DropdownMenuItem onClick={onDelete} disabled={processing}>
                        <TrashIcon className="mr-1" /> Delete
                    </DropdownMenuItem>         
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }
    const columns: ColumnDef<Contact>[] = [
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
            accessorKey: "email",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Email" />
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
            accessorKey: "subject",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Subject" />
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
            accessorKey: "combined_user_info",
            header: () => null,
            cell: () => null,
            enableHiding: false,
            enableSorting: false,
            filterFn: (row, id, value) => {
                const searchValue = value.toLowerCase();
                const name = row.original.name?.toLowerCase() || "";
                const email = row.original.email?.toLowerCase() || "";
                const subject = row.original.subject?.toLowerCase() || "";
                return name.includes(searchValue) || email.includes(searchValue) || subject.includes(searchValue);
            },
        },   
        {
            id: "actions",
            cell: ({ row }) => { 
                return( 
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
                                    <MessageCircleMore className="h-[18px] w-[18px] text-primary" />
                                </div>
                                <AlertDialogTitle className="text-2xl font-bold tracking-tight">
                                    {row.original.subject}
                                </AlertDialogTitle>
                                <AlertDialogDescription className="!mt-3 text-[15px]">
                                    <div
                                        className="text-muted-foreground"
                                        dangerouslySetInnerHTML={{ __html: row.original.message }}
                                    />
                                </AlertDialogDescription>
                                <div className="!mt-6 flex flex-wrap gap-2">
                                    <Badge variant="secondary" className="py-1">
                                        {row.original.name}
                                    </Badge>
                                    <Badge variant="secondary" className="py-1">
                                        {row.original.email}
                                    </Badge>
                                    <Badge variant="outline" className="py-1">
                                        {format(new Date(row.getValue("created_at")), 'dd MMMM, yyyy')}
                                    </Badge>                                    
                                </div>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-4">
                                    <AlertDialogCancel>Close</AlertDialogCancel>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <EditViewAndDeleteDropdown
                            contact={row.original} 
                        />                    
                    </div>
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
                    title="Contacts"
                    description="Manage system contacts"
                />

                <div className="py-6 w-full">
                    <DataTable columns={columns} data={contacts} />
                </div>
            </div>
        </div>
    );
}