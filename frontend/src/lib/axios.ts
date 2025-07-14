import authService from "@/services/authService";
import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

axiosInstance.interceptors.request.use((config) => {
    const token = Cookies.get("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        const status = error?.response?.status;

        if (
            status === 401 || // Unauthorized
            status === 403 || // Forbidden
            status === 419 || // Authentication timeout / CSRF token mismatch
            status === 500 || // Internal Server Error
            !status // Network error or server unreachable
        ) {
            authService.logout();

            if (typeof window !== "undefined") {
                window.location.href = "/login?error=SomethingWentWrong";
            }
        }

        return Promise.reject(error);
    }
);



export default axiosInstance;
