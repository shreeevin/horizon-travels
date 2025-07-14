import axiosInstance from "@/lib/axios";
import { CreateResponse, DeleteResponse, GetResponse, Legal, UpdateResponse } from "@/types/legal";

class LegalService {
    async create(
        name: string, 
        slug: string, 
        status: string, 
        content: string
    ): Promise<CreateResponse> {
        const response = await axiosInstance.post<CreateResponse>("/api/admin/legal/create", {
            name,
            slug,
            status, 
            content,
        });

        return response.data;
    }

    async update(
        id: number,
        name: string,
        slug: string,
        status: string,
        content: string
    ): Promise<UpdateResponse> {
        const response = await axiosInstance.put<UpdateResponse>(`/api/admin/legal/update/${id}`, {
            name,
            slug,
            status,
            content,
        });
        
        return response.data;
    }

    async delete(
        id: number
    ): Promise<DeleteResponse> {
        const response = await axiosInstance.delete<DeleteResponse>(`/api/admin/legal/delete/${id}`);
        return response.data;
    }

    async get(
        id: number
    ): Promise<GetResponse> {
        const response = await axiosInstance.get<GetResponse>(`/api/admin/legal/detail/${id}`);
        return response.data;
    }

    async getBySlug(
        slug: string
    ): Promise<GetResponse> {
        const response = await axiosInstance.get<GetResponse>(`/api/admin/legal/page/${slug}`);
        return response.data;
    }
}

export default new LegalService();