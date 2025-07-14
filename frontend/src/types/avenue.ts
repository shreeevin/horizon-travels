import { Destination } from "@/types/destination";        

export interface Avenue {
    id: number;
    leave_destination: Destination;
    arrive_destination: Destination;
    leave_time: string;
    arrive_time: string;
    price: Price;
    status: string;
    created_at: string;
}

export interface AvailableAvenue {
    id: number;
    leave_destination: Destination;
    arrive_destination: Destination;
    leave_time: string;
    arrive_time: string;
    travel_mode: string;
    prices: SeatType;
    seat_availability: SeatType;
    discount: number;
    max_seats: number;
    booked_seats: number;
}

export interface Price {
    air: number;
    coach: number;
    train: number;
}

export interface SeatType {
    economy: number;
    business: number;
    first: number;
}

export interface AvenueResponse {
    data: Avenue[];
    success: boolean;
}

export interface ErrorResponse {
    success: boolean;
    message: string;    
    error: string | [] | any;
}

export interface CreateResponse {
    success: boolean;
    message: string;
    data: Avenue;
}

export interface UpdateResponse {
    success: boolean;
    message: string;
    data: Avenue;
}

export interface DeleteResponse {
    success: boolean;
    message: string;
    date: Avenue;
}

export interface GetResponse {
    success: boolean;
    data: Avenue;
}


export interface AvailableResponse {
    success: boolean;
    data: AvailableAvenue[];
}