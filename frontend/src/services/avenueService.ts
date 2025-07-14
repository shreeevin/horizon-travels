import axiosInstance from "@/lib/axios";
import { CreateResponse, DeleteResponse, AvenueResponse, GetResponse, UpdateResponse, AvailableResponse } from "@/types/avenue";

class AvenueService {
    async create(
        leave_destination_id: number, 
        arrive_destination_id: number, 
        leave_time: string,
        arrive_time: string,
        status: string,
        price: number, 
    ): Promise<CreateResponse> {
        const response = await axiosInstance.post<CreateResponse>("/api/admin/avenues/create", {
            leave_destination_id,
            arrive_destination_id,
            leave_time,
            arrive_time,
            status,
            price,
        });

        return response.data;
    }

    async update(
        id: number,
        leave_destination_id: number, 
        arrive_destination_id: number, 
        leave_time: string,
        arrive_time: string,
        status: string,
        price: number, 
    ): Promise<UpdateResponse> {
        const response = await axiosInstance.put<UpdateResponse>(`/api/admin/avenues/update/${id}`, {
            leave_destination_id,
            arrive_destination_id,
            leave_time,
            arrive_time,
            status,
            price,
        });
        
        return response.data;
    }

    async delete(
        id: number
    ): Promise<DeleteResponse> {
        const response = await axiosInstance.delete<DeleteResponse>(`/api/admin/avenues/delete/${id}`);
        return response.data;
    }

    async get(
        id: number
    ): Promise<GetResponse> {
        const response = await axiosInstance.get<GetResponse>(`/api/admin/avenues/detail/${id}`);
        return response.data;
    }

    async all(): Promise<AvenueResponse> {
        const response = await axiosInstance.get<AvenueResponse>('/api/admin/avenues/all');
        return response.data;
    }

    async available(
        from: number,
        to: number,
        date: string,
        passenger: number,
        mode: string,
    ): Promise<AvailableResponse> {
        const payload: any = {
            from,
            to,
            date,
            passenger,
        };

        if (mode !== "all") {
            payload.mode = mode;
        }

        const response = await axiosInstance.post<AvailableResponse>("/api/admin/avenues/available", payload);
        return response.data;
    }

}

export default new AvenueService();