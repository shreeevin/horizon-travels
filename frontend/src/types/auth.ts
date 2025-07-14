export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    avatar: string;
    created_at: Date;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    message: string;
    user: User;
}

export interface RegisterResponse {
    message: string;
    access_token: string;
    refresh_token: string;
    user: User;
}

export interface UpdatePasswordResponse {
    message: string;
    access_token: string;
    refresh_token: string;
    user: User;
}

export interface ErrorRespose {
    message: string;
    errors?: []
}