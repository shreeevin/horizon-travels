import axiosInstance from "@/lib/axios";
import { ContactResponse, CreateResponse, DeleteResponse, GetResponse, UpdateResponse } from "@/types/contact";

class ContactService {
    async create(
        name: string, 
        email: string, 
        subject: string,
        message: string, 
    ): Promise<CreateResponse> {
        const response = await axiosInstance.post<CreateResponse>("/api/admin/contacts/create", {
            name,
            email, 
            subject,
            message,
        });

        return response.data;
    }

    async update(
        id: number,
        status: string,
    ): Promise<UpdateResponse> {
        const response = await axiosInstance.put<UpdateResponse>(`/api/admin/contacts/update/${id}`, {
            status,
        });
        
        return response.data;
    }

    async delete(
        id: number
    ): Promise<DeleteResponse> {
        const response = await axiosInstance.delete<DeleteResponse>(`/api/admin/contacts/delete/${id}`);
        return response.data;
    }

    async get(
        id: number
    ): Promise<GetResponse> {
        const response = await axiosInstance.get<GetResponse>(`/api/admin/contacts/detail/${id}`);
        return response.data;
    }

    async all(): Promise<ContactResponse> {
        const response = await axiosInstance.get<ContactResponse>('/api/admin/contacts/all');
        return response.data;
    }
}

export default new ContactService();