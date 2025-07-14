export interface Changelog {
    id: number;
    name: string;
    content: string;
    version: string;
    status: string;
    created_at: string;
}

export interface ChangelogResponse {
    data: Changelog[];
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
    data: Changelog;
}

export interface UpdateResponse {
    success: boolean;
    message: string;
    data: Changelog;
}

export interface DeleteResponse {
    success: boolean;
    message: string;
    date: Changelog;
}

export interface GetResponse {
    success: boolean;
    data: Changelog;
}
