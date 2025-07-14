"use client";

import { Compartment } from "@/components/blocks/compartment";
import { LoaderCircle, Mail, MapPin } from "lucide-react";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import contactService from "@/services/contactService";
import { ErrorResponse } from "@/types/contact";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/rich-text-editor";

const formSchema = z.object({
    name: z.string().min(4).max(20),
    email: z.string().email(),
    subject: z.string().min(8).max(64),
    message: z.string().min(100).max(500),
});

export default function ContactPage() {
    const [processing, setProcessing] = useState(false);
    
    const form = useForm < z.infer < typeof formSchema >> ({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            subject: '',
            message: '',
        },
    })

    async function onSubmit(values: z.infer < typeof formSchema > ) {
        setProcessing(true)
        try {
            const response = await contactService.create(
                values.name, 
                values.email, 
                values.subject,
                values.message, 
            );

            if(response.success) {
                form.reset();
                toast.success("Message sent successfully!");
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
            <Compartment>
                <section className="py-32">
                    <div className="container">
                        <div className="mb-14">
                        <h1 className="mb-3 mt-2 text-balance text-3xl font-semibold md:text-4xl">
                            Contact Us
                        </h1>
                        <p className="text-muted-foreground max-w-xl text-lg">
                            We're here to help! If you have any questions, feedback, or need assistance, please don't hesitate to reach out to us. Our dedicated support team is ready to assist you.
                        </p>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="bg-muted rounded-lg p-6">
                                <span className="bg-accent mb-3 flex size-12 flex-col items-center justify-center rounded-full">
                                    <Mail className="h-6 w-auto" />
                                </span>
                                <p className="mb-2 text-lg font-semibold">Email</p>
                                <p className="text-muted-foreground mb-3">We respond to all emails within 24 hours.</p>
                                <a
                                    href={'mailto:contact@horizen.com'}
                                    className="font-semibold hover:underline"
                                    target="_blank"
                                >
                                    contact@horizen.com
                                </a>
                            </div>
                            <div className="bg-muted rounded-lg p-6">
                                <span className="bg-accent mb-3 flex size-12 flex-col items-center justify-center rounded-full">
                                    <MapPin className="h-6 w-auto" />
                                </span>
                                <p className="mb-2 text-lg font-semibold">Office</p>
                                <p className="text-muted-foreground mb-3">Drop by our office for a chat.</p>
                                <a 
                                    href="https://maps.app.goo.gl/Ke5Hjg9Y33JgeX8N8" 
                                    target="_blank" 
                                    className="font-semibold hover:underline"
                                >
                                    Bristol BS1 6QH, United Kingdom
                                </a>
                            </div>                            
                        </div>

                        <div className="mt-12 flex flex-col">
                            <h1 className="my-2 text-balance text-xl font-semibold">
                                Drop us a line
                            </h1>
                            <p className="text-muted-foreground max-w-xl text-lg">
                                Write us a message and we will get back to you as soon as possible.
                            </p>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full py-10">
                                    <div className="flex gap-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem
                                                    className="w-full"
                                                >
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            placeholder="John Wick"
                                                            type="text"
                                                            {...field} 
                                                        />
                                                    </FormControl>
                                                    
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                            
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem
                                                    className="w-full"
                                                >
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            placeholder="john.wick@gmail.com"
                                                            type="email"
                                                            {...field} 
                                                        />
                                                    </FormControl>                                        
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="subject"
                                        render={({ field }) => (
                                            <FormItem
                                                className="w-full"
                                            >
                                                <FormLabel>Subject</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder="How can I reset my password?"
                                                        type="text"
                                                        {...field} 
                                                    />
                                                </FormControl>
                                                
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="message"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Message</FormLabel>
                                                <FormControl>
                                                    <RichTextEditor
                                                        content={field.value}
                                                        onChange={field.onChange}
                                                        showToolbar={false}
                                                    />
                                                </FormControl>
                                                
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    
                                    <Button type="submit" className="mt-2" tabIndex={5} disabled={processing}>
                                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                        Send message
                                    </Button>                               
                                </form>
                            </Form>
                        </div>
                    </div>
                </section>  
            </Compartment>
        </>
    );
}