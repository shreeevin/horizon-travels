import axiosInstance from "@/lib/axios";
import { BookingResponse, CancelResponse, CreateResponse } from "@/types/booking";

class BookingService {
    async create(
        avenue_id: number,
        date: string,
        mode: string,
        seat: string,
        passenger: number,
        price: number,
        payment: string,
    ): Promise<CreateResponse> {
        const response = await axiosInstance.post<CreateResponse>("/api/bookings/create", {
            avenue_id: avenue_id,
            date: date,
            mode: mode,
            type: seat,
            seat: passenger,
            price: price,
            payment: payment,
        });

        return response.data;
    }  

    async all(): Promise<BookingResponse> {
        const response = await axiosInstance.get<BookingResponse>("/api/bookings/all");
        return response.data;
    }

    async userBookings(): Promise<BookingResponse> {
        const response = await axiosInstance.get<BookingResponse>("/api/bookings/user");
        return response.data;
    }

    async userCancel(id: number): Promise<CancelResponse> {
        const response = await axiosInstance.post<CancelResponse>(`/api/bookings/user/cancel/${id}`);
        return response.data;
    }

    async cancel(id: number): Promise<CancelResponse> {
        const response = await axiosInstance.post<CancelResponse>(`/api/bookings/cancel/${id}`);
        return response.data;
    }
}

export default new BookingService();