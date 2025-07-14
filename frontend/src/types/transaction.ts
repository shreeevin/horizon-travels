import { Booking } from "./booking";

export interface TransactionRelationship{
    id: number;
    identifier: string;
    amount: number;
    payment_method: string;
    status: string;
    type: string;
    created_at: string;
}
export interface Transaction {
    id: number;
    identifier: string;
    booking: Booking;
    amount: number;
    payment_method: string;
    status: string;
    type: string;
    created_at: string;
}

export interface ErrorResponse {
    success: boolean;
    message: string;    
    error: string | [] | any;
}

export interface TransactionResponse {
    data: Transaction[];
    success: boolean;
}