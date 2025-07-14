"use client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import TextLink from '@/components/blocks/text-link';
import { useEffect, useState } from "react";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { LoaderCircle } from 'lucide-react';

import { useRouter } from "next/navigation";
import authService from "@/services/authService";

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

const usernameSchema = z.string()
    .min(4)
    .max(12)
    .regex(/^[a-z]+$/, {
        message: "Username can only contain letters a-z.",
    });

const emailSchema = z.string().email();

const formSchema = z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema
});

export default function Register() {
    const [processing, setProcessing] = useState(false);
    const form = useForm < z.infer < typeof formSchema >> ({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            email: '',
            password: 'S4ndB@xD3V',
        },
    })

    const router = useRouter();
    useEffect(() => {    
        const isAuthenticated = authService.isAuthenticated();
                
        if (isAuthenticated) {
            router.push("/");
        }
    }, []);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setProcessing(true);
        try {
            const response = await authService.register(values.username, values.email, values.password);

            toast.success("Welcome to Horizen Travel, " + response.user.username);
            router.push("/");
        } catch (err: any) {
            const errorMessage = err.response.data.error ?? "An error occurred. Please try again.";
            toast.error("Oops, " + errorMessage);
        } finally {
            setProcessing(false);
        }
    }

    return (
        <>
            <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                <h1 className="text-xl font-medium">Create an Account</h1>
                <p className="text-muted-foreground text-sm text-balance">Join Horizen Travel and start your journey today</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-8">
                    
                    <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                            <Input 
                            placeholder="horizon"
                            
                            type="text"
                            {...field} />
                        </FormControl>
                        
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    
                    <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input 
                            placeholder="hello@horizon.com"
                            
                            type="email"
                            {...field} />
                        </FormControl>
                        
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    
                    <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <PasswordInput placeholder="**********" {...field} />
                        </FormControl>
                        
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    
                    <Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Create account
                    </Button>

                </form>
            </Form>

            <div className="text-muted-foreground text-center text-sm">
                Already have an account?{' '}
                <TextLink href="/login" tabIndex={6}>
                    Log in
                </TextLink>
            </div>
        </>
    );
}
