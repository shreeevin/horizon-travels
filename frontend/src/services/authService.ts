import axiosInstance from "@/lib/axios";
import Cookies from "js-cookie";
import { LoginResponse, RegisterResponse, UpdatePasswordResponse } from "@/types/auth";

const TOKEN_KEY = "access_token";
const USER_KEY = "user";

class AuthService {
    async login(username: string, password: string): Promise<LoginResponse> {
        const response = await axiosInstance.post<LoginResponse>("/api/auth/login", {
            username,
            password,
        });

        const { access_token, user } = response.data;

        Cookies.set(TOKEN_KEY, access_token, { expires: 3 });
        Cookies.set(USER_KEY, JSON.stringify(user), { expires: 3 });
        
        return response.data;
    }

    async register(username: string, email: string, password: string): Promise<RegisterResponse> {
        const response = await axiosInstance.post<RegisterResponse>("/api/auth/register", {
            username,
            email,
            password,
        });

        const { access_token, user } = response.data;

        this.setAuthCookies(access_token, user);
        return response.data;
    }

    async updatePassword(current_password: string, new_password: string): Promise<UpdatePasswordResponse> {
        const response = await axiosInstance.post<UpdatePasswordResponse>("/api/auth/update-password", {
            current_password,
            new_password,
        });

        const { access_token, user } = response.data;

        this.setAuthCookies(access_token, user);
        return response.data;
    }

    async updateUserPassword(user_id: number, new_password: string): Promise<UpdatePasswordResponse> {

        const response = await axiosInstance.post<UpdatePasswordResponse>("/api/admin/update-password", {
            user_id,
            new_password,
        });

        const { access_token, user } = response.data;
        const username = this.getUsername();
        
        if (username === user.username) {
            this.setAuthCookies(access_token, user);
        }

        return response.data;
    }

    logout() {
        Cookies.remove(TOKEN_KEY);
        Cookies.remove(USER_KEY);
    }

    getToken(): string | undefined {
        return Cookies.get(TOKEN_KEY);
    }

    getUser() {
        try {
            const user = Cookies.get(USER_KEY);
            return user ? JSON.parse(user) : null;
        } catch {
            return null;
        }
    }

    getUsername(): string | undefined {
        try {
            const user = this.getUser();
            return user?.username;
        } catch {
            return undefined;
        }
    }

    isAdmin(): boolean {
        try {

            const user = this.getUser();
            return user?.role === "admin";

        } catch {
            return false;
        }
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        const user = this.getUser();
        return !!(token && user);
    }

    private setAuthCookies(token: string, user: any) {
        const isProduction = process.env.NODE_ENV === "production";
        const cookieOptions = {
            expires: 3,
            secure: isProduction,
            sameSite: "strict" as const,
            path: "/",
        };

        Cookies.set(TOKEN_KEY, token, cookieOptions);
        Cookies.set(USER_KEY, JSON.stringify(user), cookieOptions);
    }
}

export default new AuthService();
