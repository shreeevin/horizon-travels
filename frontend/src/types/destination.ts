export interface Destination {
    id: number;
    name: string;
    modes: Modes;
    status: string;
    created_at: string;
}

export interface Modes {
    air: boolean;
    coach: boolean;
    train: boolean;
}

export interface DestinationResponse {
    data: Destination[];
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
    data: Destination;
}

export interface UpdateResponse {
    success: boolean;
    message: string;
    data: Destination;
}

export interface DeleteResponse {
    success: boolean;
    message: string;
    date: Destination;
}

export interface GetResponse {
    success: boolean;
    data: Destination;
}
