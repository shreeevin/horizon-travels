"use client";

import authService from "@/services/authService";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OctagonAlert, X, LoaderCircle, ShieldPlusIcon } from "lucide-react";
import { BreadcrumbItem } from "@/types";
import { useBreadcrumbs } from "@/contexts/BreadcrumbsContext";
import HeadingSmall from "@/components/blocks/heading-small";
import axiosInstance from "@/lib/axios";
import { ErrorRespose, User } from "@/types/auth";

import { DataTable } from '@/components/data-table-user';
import { Button, buttonVariants } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from "@/components/datatable/column-header";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { format } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PasswordInput } from "@/components/ui/password-input";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Users',
        href: '/admin/users',
    }
];

const passwordSchema = z.string()
    .min(8, "Password must be at least 8 characters long.")
    .max(15, "Password must be at most 15 characters long.")
    .refine(val => /[a-z]/.test(val), {
        message: "Password must include at least one lowercase letter (a-z)."
    })
    .refine(val => /[A-Z]/.test(val), {
        message: "Password must include at least one uppercase letter (A-Z)."
    })
    .refine(val => /[0-9]/.test(val), {
        message: "Password must include at least one digit (0-9)."
    })
    .refine(val => /[^a-zA-Z0-9]/.test(val), {
        message: "Password must include at least one symbol (e.g. !@#$%)."
    });

type UpdateCredentialsDialogProps = {
    userId: number;
    username: string
};

const formSchema = z
    .object({
        user_id: z.number().min(1, { message: "User ID is required" }),
        new_password: passwordSchema,
    });

const UpdateCredentialsDialog = ({ userId, username }: UpdateCredentialsDialogProps) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            user_id: userId,
            new_password: '',
        },
    });
    
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        form.setValue("user_id", userId);
        form.setValue("new_password", "");
    }, [userId]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setUpdating(true);
        try {
            const response = await authService.updateUserPassword(values.user_id, values.new_password);
            toast.success(response.message);
        } catch (err: any) {
            const error = err.response.data as ErrorRespose;
            toast.error(error.message);
        } finally {
            form.setValue("user_id", userId);
            form.setValue("new_password", "");
            setUpdating(false);
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <ShieldPlusIcon className="size-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <div className="-mt-3 -mx-6 border-b pb-3 px-6 flex justify-between items-center">
                    <AlertDialogTitle>Update Credentials</AlertDialogTitle>
                    <AlertDialogPrimitive.Cancel
                        className={buttonVariants({
                            variant: "ghost",
                            size: "icon",
                            className: "!h-7 !w-7",
                        })}
                    >
                        <X />
                    </AlertDialogPrimitive.Cancel>
                </div>
                <AlertDialogHeader className="pt-2">
                    <AlertDialogTitle>
                        <div className="mx-auto sm:mx-0 mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10">
                            <OctagonAlert className="h-5 w-5 text-destructive" />
                        </div>
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-[15px]">
                        This action cannot be undone. This will permanently change the credentials for <strong>{username}</strong>.
                    </AlertDialogDescription>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md py-10">
                            <FormField
                                control={form.control}
                                name="user_id"
                                render={({ field }) => (
                                    <input type="hidden" {...field} />
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="new_password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <PasswordInput {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end">
                                <Button type="submit" disabled={updating}>Update Password</Button>
                            </div>
                        </form>
                    </Form>
                </AlertDialogHeader>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default function Users() {
    const router = useRouter();
    const [processing, setProcessing] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const { setBreadcrumbs } = useBreadcrumbs();

    useEffect(() => {
        setBreadcrumbs(breadcrumbs);
    }, []);

    useEffect(() => {
        const checkAuth = () => {
            const isAuthenticated = authService.isAuthenticated();
            if (!isAuthenticated) {
                router.push("/login");
            } else {
                fetchUsers();
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await axiosInstance.get("/api/admin/users");
                setUsers(response.data.users);
            } catch (error) {
                toast.error("Failed to fetch users.");
            } finally {
                setProcessing(false);
            }
        };

        checkAuth();
    }, [router]);

    const columns: ColumnDef<User>[] = [
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
            accessorKey: "username",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Username" />
            ),
            cell: ({ row }) => (
                <div>
                    {row.getValue("username")}
                </div>                
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
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "role",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Role" />
            ),            
            enableSorting: true,
            enableHiding: true,
            cell: ({ row }) => (
                <div className="capitalize">
                    {row.getValue("role")}
                </div>                
            ),
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "avatar",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Avatar" />
            ),            
            enableHiding: true,
            cell: ({ row }) => (
                <Image
                    src={row.getValue("avatar")}
                    width={48}
                    height={48}
                    alt={row.getValue("username")}
                />             
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
                const userId = row.getValue("id") as number;
                const username = row.getValue("username") as string;
                return <UpdateCredentialsDialog userId={userId} username={username} />;
            },
            enableSorting: false,
            enableHiding: false,
        },
    ];

    if (processing) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-screen">
                <LoaderCircle className="animate-spin size-8 text-muted-foreground"/>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl px-4 py-6">
            <div className="my-4">
                <HeadingSmall
                    title="System users"
                    description="Manage system users."
                />

                <div className="py-6 w-full">
                    <DataTable columns={columns} data={users} />
                </div>
            </div>
        </div>
    );
}