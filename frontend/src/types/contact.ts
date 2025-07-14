export interface Contact {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: string;
    created_at: string;
}

export interface ContactResponse {
    data: Contact[];
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
    data: Contact;
}

export interface UpdateResponse {
    success: boolean;
    message: string;
    data: Contact;
}

export interface DeleteResponse {
    success: boolean;
    message: string;
    date: Contact;
}

export interface GetResponse {
    success: boolean;
    data: Contact;
}
