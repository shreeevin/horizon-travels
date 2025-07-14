export interface Legal {
    id: number;
    name: string;
    slug: string;
    status: string;
    content: string;
    created_at: string;
}

export interface LegalResponse {
    data: Legal[];
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
    data: Legal;
}

export interface UpdateResponse {
    success: boolean;
    message: string;
    data: Legal;
}

export interface DeleteResponse {
    success: boolean;
    message: string;
    date: Legal;
}

export interface GetResponse {
    success: boolean;
    data: Legal;
}
