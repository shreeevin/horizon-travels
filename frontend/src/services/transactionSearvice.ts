import axiosInstance from "@/lib/axios";
import { TransactionResponse } from "@/types/transaction";

class TransactionService {
    async all(): Promise<TransactionResponse> {
        const response = await axiosInstance.get<TransactionResponse>("/api/transactions/all");
        return response.data;
    }
}

export default new TransactionService();