import axiosInstance from "@/lib/axios";
import { CreateResponse, DeleteResponse, ChangelogResponse, GetResponse, UpdateResponse } from "@/types/changelog";

class ChangelogService {
    async create(
        name: string, 
        content: string, 
        version: string,
        status: string, 
    ): Promise<CreateResponse> {
        const response = await axiosInstance.post<CreateResponse>("/api/admin/changelogs/create", {
            name,
            content,
            version,
            status,
        });

        return response.data;
    }

    async update(
        id: number,
        name: string, 
        content: string, 
        version: string,
        status: string, 
    ): Promise<UpdateResponse> {
        const response = await axiosInstance.put<UpdateResponse>(`/api/admin/changelogs/update/${id}`, {
            name,
            content,
            version,
            status,
        });
        
        return response.data;
    }

    async delete(
        id: number
    ): Promise<DeleteResponse> {
        const response = await axiosInstance.delete<DeleteResponse>(`/api/admin/changelogs/delete/${id}`);
        return response.data;
    }

    async get(
        id: number
    ): Promise<GetResponse> {
        const response = await axiosInstance.get<GetResponse>(`/api/admin/changelogs/detail/${id}`);
        return response.data;
    }

    async all(): Promise<ChangelogResponse> {
        const response = await axiosInstance.get<ChangelogResponse>('/api/admin/changelogs/all');
        return response.data;
    }
}

export default new ChangelogService();