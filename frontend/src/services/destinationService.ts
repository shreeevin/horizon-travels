import axiosInstance from "@/lib/axios";
import { CreateResponse, DeleteResponse, DestinationResponse, GetResponse, UpdateResponse } from "@/types/destination";

class DestinationService {
    async create(
        name: string, 
        air: boolean, 
        coach: boolean,
        train: boolean,
        status: string, 
    ): Promise<CreateResponse> {
        const response = await axiosInstance.post<CreateResponse>("/api/admin/destinations/create", {
            name,
            air,
            coach,
            train,
            status,
        });

        return response.data;
    }

    async update(
        id: number,
        name: string, 
        air: boolean, 
        coach: boolean,
        train: boolean,
        status: string, 
    ): Promise<UpdateResponse> {
        const response = await axiosInstance.put<UpdateResponse>(`/api/admin/destinations/update/${id}`, {
            name,
            air,
            coach,
            train,
            status,
        });
        
        return response.data;
    }

    async delete(
        id: number
    ): Promise<DeleteResponse> {
        const response = await axiosInstance.delete<DeleteResponse>(`/api/admin/destinations/delete/${id}`);
        return response.data;
    }

    async get(
        id: number
    ): Promise<GetResponse> {
        const response = await axiosInstance.get<GetResponse>(`/api/admin/destinations/detail/${id}`);
        return response.data;
    }

    async all(): Promise<DestinationResponse> {
        const response = await axiosInstance.get<DestinationResponse>('/api/admin/destinations/all');
        return response.data;
    }
}

export default new DestinationService();