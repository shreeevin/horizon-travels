export interface Faq {
    id: number;
    question: string;
    answer: string;
    status: string;
    created_at: string;
}

export interface FaqResponse {
    data: Faq[];
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
    data: Faq;
}

export interface UpdateResponse {
    success: boolean;
    message: string;
    data: Faq;
}

export interface DeleteResponse {
    success: boolean;
    message: string;
    date: Faq;
}

export interface GetResponse {
    success: boolean;
    data: Faq;
}
