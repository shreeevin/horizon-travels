"use client";

import { useEffect, useState } from "react";
import { BreadcrumbItem } from "@/types";
import { useBreadcrumbs } from "@/contexts/BreadcrumbsContext";
import HeadingSmall from "@/components/blocks/heading-small";
import { BookingsStats, ErrorResponse, Stats, StatsRange, TicketsStats, TransactionStats } from "@/types/stats";
import { toast } from "sonner";
import statsService from "@/services/statsService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, Pie, PieChart } from "recharts";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Admin() {
    const { setBreadcrumbs } = useBreadcrumbs();
    const [stats, setStats] = useState<Stats[]>([]);
    const [range, setRange] = useState<StatsRange>("month");
    const [bookingsStats, setBookingsStats] = useState<BookingsStats[]>([]);
    const [ticketsStats, setTicketsStats] = useState<TicketsStats[]>([]);
    const [transactionStats, setTransactionStats] = useState<TransactionStats[]>([]);
    const [topCustomers, setTopCustomers] = useState<Stats[]>([]);
    const [sales, setSales] = useState<Stats[]>([]);

    const filters = [
        {
            label: 'Week',
            value: 'week',
        },
        {
            label: 'Month',
            value: 'month',
        },
        {
            label: 'Year',
            value: 'year',
        }
    ] as const;
    
    const fetchUserBookings = async () => {
        try {
            const response = await statsService.adminStats();
            setStats(response.data);
        } catch (err: ErrorResponse | any) {
            const errorMessage = err.response.data.message || "An error occurred. Please try again.";
            toast.error("Oops, " + errorMessage);
        }
    };

    const chartBookingConfig = {
        completed: {
            label: "Completed",
            color: "var(--chart-1)",
        },
        cancelled: {
            label: "Cancelled",
            color: "var(--chart-2)",
        },
    } satisfies ChartConfig

    const chartTicketConfig = {
        scanned: {
            label: "Scanned",
            color: "var(--chart-1)",
        },
        unscanned: {
            label: "Unscanned",
            color: "var(--chart-2)",
        },
    } satisfies ChartConfig

    const chartSalesConfig = {
        value: {
            label: "Amount",
            color: "var(--chart-1)",
        },
    } satisfies ChartConfig

    const chartTopCustomerConfig = {
        value: {
            label: "Amount",
            color: "var(--chart-2)",
        },
    } satisfies ChartConfig

    const chartTransactionConfig = {
        payment: {
            label: "Payment",
            color: "var(--chart-1)",
        },
        refund: {
            label: "Refund",
            color: "var(--chart-2)",
        },
    } satisfies ChartConfig


    const fetchBookingStats = async () => {
        try {
            const response = await statsService.bookingsStats(range);
            setBookingsStats(response.data);
        } catch (err: ErrorResponse | any) {
            const errorMessage = err.response.data.message || "An error occurred. Please try again.";
            toast.error("Oops, " + errorMessage);
        }
    };

    const fetchTicketsStats = async () => {
        try {
            const response = await statsService.ticketsStats(range);
            setTicketsStats(response.data);
        } catch (err: ErrorResponse | any) {
            const errorMessage = err.response.data.message || "An error occurred. Please try again.";
            toast.error("Oops, " + errorMessage);
        }
    };

    const fetchTransactionStats = async () => {
        try {
            const response = await statsService.transactionsStats(range);
            setTransactionStats(response.data);
        } catch (err: ErrorResponse | any) {
            const errorMessage = err.response.data.message || "An error occurred. Please try again.";
            toast.error("Oops, " + errorMessage);
        }
    };

    const fetchTopCustomers = async () => {
        try {
            const response = await statsService.topCustomersStats(range);
            setTopCustomers(response.data);
        } catch (err: ErrorResponse | any) {
            const errorMessage = err.response.data.message || "An error occurred. Please try again.";
            toast.error("Oops, " + errorMessage);
        }
    };
    const fetchSales = async () => {
        try {
            const response = await statsService.monthlySalesStats(range);
            setSales(response.data);
        } catch (err: ErrorResponse | any) {
            const errorMessage = err.response.data.message || "An error occurred. Please try again.";
            toast.error("Oops, " + errorMessage);
        }
    };

    const fetchCharts = async () => {
        fetchBookingStats();
        fetchTicketsStats();
        fetchTransactionStats();
        fetchTopCustomers();
        fetchSales();
    };

    useEffect(() => {        
        fetchUserBookings();
        fetchCharts();
        setBreadcrumbs(breadcrumbs);
    }, []);
    
    useEffect(() => {
        fetchCharts();
    }, [range]);

    return (
        <div className="flex h-full flex-1 flex-col gap-4 rounded-xl px-4 py-6">
            <div className="my-4">
                <HeadingSmall
                    title="Admin overview"
                    description="Observe platform activity and manage users."
                />

                <div className="my-6 mb-12">
                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                        {stats.map((stat, index) => (
                            <Card key={index} className="pt-0">
                                <CardContent className="pt-6">
                                    <div className="flex flex-col">
                                        <p className="text-muted-foreground text-xs tracking-wide uppercase">
                                            {stat.label}
                                        </p>
                                        <div className="mt-1 flex items-center gap-x-2">
                                            <h3 className="text-xl font-medium sm:text-2xl">{stat.value}</h3>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between">
                    <HeadingSmall
                        title="Stats overview"
                        description="Observe platform activity with charts."
                    />
                    <div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "w-full justify-between",
                                        !range && "text-muted-foreground"
                                    )}                            
                                >
                                    {range
                                        ? filters.find(
                                            (filter) => filter.value === range
                                        )?.label
                                        : "Select range"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                            <Command>
                                <CommandInput placeholder="Search range..." />
                                <CommandList>
                                <CommandEmpty>No range found.</CommandEmpty>
                                <CommandGroup>
                                    {filters.map((filter) => (
                                    <CommandItem
                                        value={filter.label}
                                        key={filter.value}
                                        onSelect={() => {
                                            setRange(filter.value);
                                        }}
                                    >
                                        <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            filter.value === range
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                        />
                                        {filter.label}
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                                </CommandList>
                            </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 my-4">             
                    {bookingsStats && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Booking</CardTitle>
                                <CardDescription><span className="capitalize">{range}ly</span> bookings overview </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={chartBookingConfig}>
                                    <LineChart
                                        accessibilityLayer
                                        data={bookingsStats}
                                        margin={{
                                            left: 12,
                                            right: 12,
                                        }}
                                    >
                                        <CartesianGrid vertical={false} />
                                            <XAxis
                                                dataKey="period"
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={8}
                                                tickFormatter={(value) => value.slice(0, range === 'month' ? 7 : 3)}
                                            />
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent hideLabel />}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="completed"
                                            stroke="var(--chart-1)"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="cancelled"
                                            stroke="var(--chart-2)"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ChartContainer>
                            </CardContent>                    
                        </Card>
                    )}

                    {ticketsStats && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Tickets</CardTitle>
                                <CardDescription><span className="capitalize">{range}ly</span> tickets overview </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={chartTicketConfig}>
                                <BarChart accessibilityLayer data={ticketsStats}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="period"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        tickFormatter={(value) => value.slice(0, range === 'month' ? 7 : 3)}

                                    />
                                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                    <ChartLegend content={<ChartLegendContent />} />
                                        <Bar
                                            type="monotone"
                                            dataKey="scanned"
                                            stackId="scanned"
                                            fill="var(--chart-1)"
                                            radius={[0, 0, 4, 4]}
                                        />
                                        <Bar
                                            type="monotone"
                                            dataKey="unscanned"
                                            stackId="unscanned"
                                            fill="var(--chart-2)"
                                            radius={[4, 4, 0, 0]}
                                        />
                                </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    )}

                    {transactionStats && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Transactions</CardTitle>
                                <CardDescription><span className="capitalize">{range}ly</span> transactions overview </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={chartTransactionConfig}>
                                    <LineChart
                                        accessibilityLayer
                                        data={transactionStats}
                                        margin={{
                                            left: 12,
                                            right: 12,
                                        }}
                                    >
                                        <CartesianGrid vertical={false} />
                                            <XAxis
                                                dataKey="period"
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={8}
                                                tickFormatter={(value) => value.slice(0, range === 'month' ? 7 : 3)}
                                            />
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent hideLabel />}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="payment"
                                            stroke="var(--chart-1)"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="refund"
                                            stroke="var(--chart-2)"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ChartContainer>
                            </CardContent>                    
                        </Card>
                    )}

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 my-4">             
                    {sales && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Sales</CardTitle>
                                <CardDescription>Monthly ticket sales overview </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={chartSalesConfig}>
                                <BarChart accessibilityLayer data={sales}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="label"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        tickFormatter={(value) => value.slice(0, 3)}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                    <ChartLegend content={<ChartLegendContent />} />
                                        <Bar
                                            type="monotone"
                                            dataKey="value"
                                            stackId="value"
                                            fill="var(--chart-1)"
                                            radius={[4, 4, 4, 4]}
                                        />                                        
                                </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    )}

                    {topCustomers && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Customers</CardTitle>
                                <CardDescription>Customers who have purchased the most tickets</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={chartTopCustomerConfig}>
                                <BarChart accessibilityLayer data={topCustomers}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="label"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        tickFormatter={(value) => value.slice(0, 5)}

                                    />
                                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                    <ChartLegend content={<ChartLegendContent />} />
                                        <Bar
                                            type="monotone"
                                            dataKey="value"
                                            stackId="value"
                                            fill="var(--chart-1)"
                                            radius={[4, 4, 4, 4]}
                                        />                                        
                                </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}