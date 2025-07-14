import axiosInstance from "@/lib/axios";
import { CreateResponse, DeleteResponse, GetResponse, UpdateResponse, FaqResponse } from "@/types/faq";

class FaqService {
    async create(
        question: string, 
        answer: string, 
        status: string, 
    ): Promise<CreateResponse> {
        const response = await axiosInstance.post<CreateResponse>("/api/admin/faq/create", {
            question,
            answer,
            status, 
        });

        return response.data;
    }

    async update(
        id: number,
        question: string, 
        answer: string, 
        status: string, 
    ): Promise<UpdateResponse> {
        const response = await axiosInstance.put<UpdateResponse>(`/api/admin/faq/update/${id}`, {
            question: question,
            status: status, 
            answer: answer,
        });
        
        return response.data;
    }

    async delete(
        id: number
    ): Promise<DeleteResponse> {
        const response = await axiosInstance.delete<DeleteResponse>(`/api/admin/faq/delete/${id}`);
        return response.data;
    }

    async get(
        id: number
    ): Promise<GetResponse> {
        const response = await axiosInstance.get<GetResponse>(`/api/admin/faq/detail/${id}`);
        return response.data;
    }

    async all(): Promise<FaqResponse> {
        const response = await axiosInstance.get<FaqResponse>('/api/admin/faq/all');
        return response.data;
    }
}

export default new FaqService();