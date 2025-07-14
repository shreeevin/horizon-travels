"use client";

import authService from "@/services/authService";
import { useEffect, useState } from "react";
import { BreadcrumbItem } from "@/types";
import { useBreadcrumbs } from "@/contexts/BreadcrumbsContext";
import HeadingSmall from "@/components/blocks/heading-small";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { ErrorRespose } from "@/types/auth";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Setting',
        href: '/setting',
    },
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

const formSchema = z
    .object({
        current_password: passwordSchema,
        new_password: passwordSchema,
    })
    .refine(
        (data) => data.current_password !== data.new_password,
        {
            message: "New password must be different from current password.",
            path: ["new_password"],
        }
    );

export default function Setting() {
    const [updating, setUpdating] = useState(false);
    const { setBreadcrumbs } = useBreadcrumbs();

    useEffect(() => {
        setBreadcrumbs(breadcrumbs);
    }, []);

    const form = useForm < z.infer < typeof formSchema >> ({
        resolver: zodResolver(formSchema),
        defaultValues: {
            current_password: '',
            new_password: '',
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setUpdating(true);
        try {
            const response = await authService.updatePassword(values.current_password, values.new_password);

            toast.success(response.message);

            form.reset({
                current_password: '',
                new_password: '',
            });

        } catch (err: any) {
            const error = err.response.data as ErrorRespose;
            toast.error(error.message);
        } finally {
            setUpdating(false);
        }
    }

    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl px-4 py-6">
            <div className="my-4">
                <HeadingSmall
                    title="Password settings"
                    description="Manage your account password and keep your account secure."
                />
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md py-10">
                        
                        <FormField
                            control={form.control}
                            name="current_password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current Password</FormLabel>
                                    <FormControl>
                                        <PasswordInput placeholder="" {...field} />
                                    </FormControl>
                                    
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        
                        <FormField
                            control={form.control}
                            name="new_password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <PasswordInput placeholder="" {...field} />
                                    </FormControl>
                                    
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <Button 
                            type="submit"
                            disabled={updating}
                        >
                            Save
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}