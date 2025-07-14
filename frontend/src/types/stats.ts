export type StatsRange = 'week' | 'month' | 'year';

export interface Stats {
    label: string;
    value: string;
    type: string;
}

export interface StatsResponse {
    data: Stats[];
    success: boolean;
}

export interface ErrorResponse {
    success: boolean;
    message: string;    
    error: string | [] | any;
}

export interface BookingsStatsResponse {
    success: boolean;
    time_range: string;
    data: BookingsStats[];
}

export interface TicketsStatsResponse {
    success: boolean;
    time_range: string;
    data: TicketsStats[];
}

export interface TransactionStatsResponse {
    success: boolean;
    time_range: string;
    data: TransactionStats[];
}

export interface BookingsStats {
    period: string;
    completed: number;
    cancelled: number;
}

export interface TicketsStats {
    period: string;
    scanned: number;
    unscanned: number;
}

export interface TransactionStats {
    period: string;
    payment: number;
    refund: number;
}

export interface TopCustomersResponse {
    success: boolean;
    data: Stats[];
}

export interface MonthlySalesResponse {
    success: boolean;
    data: Stats[];
}