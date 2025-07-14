import { User } from "./auth";
import { Avenue } from "./avenue";
import { Transaction } from "./transaction";

export interface Booking{
    id: number;
    identifier: string;
    user: User;
    avenue: Avenue;
    date: string;
    mode: string;
    type: string;
    seat: number;
    price: number;
    status: string;
    ticket: string;
    created_at: string;
    updated_at: string;
    transactions: Transaction[];
}

export interface ErrorResponse {
    success: boolean;
    message: string;    
    error: string | [] | any;
}

export interface CreateResponse {
    success: boolean;
    message: string;
    data: Booking;
}


export interface UpdateResponse {
    success: boolean;
    message: string;
    data: Booking;
}

export interface CancelResponse {
    success: boolean;
    message: string;
}

export interface DeleteResponse {
    success: boolean;
    message: string;
    date: Booking;
}

export interface GetResponse {
    success: boolean;
    data: Booking;
}

export interface BookingResponse {
    data: Booking[];
    success: boolean;
}