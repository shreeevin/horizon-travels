import axiosInstance from "@/lib/axios";
import { StatsResponse,BookingsStatsResponse, TicketsStatsResponse, TransactionStatsResponse, TopCustomersResponse, MonthlySalesResponse } from "@/types/stats";

class StatsService {
    async userStats(): Promise<StatsResponse> {
        const response = await axiosInstance.get<StatsResponse>("/api/stats/user");
        return response.data;
    }

    async adminStats(): Promise<StatsResponse> {
        const response = await axiosInstance.get<StatsResponse>("/api/stats/admin");
        return response.data;
    }

    async bookingsStats(range: string): Promise<BookingsStatsResponse> {
        const response = await axiosInstance.get<BookingsStatsResponse>(`/api/stats/admin/bookings?time_range=${range}`);
        return response.data;
    }

    async ticketsStats(range: string): Promise<TicketsStatsResponse> {
        const response = await axiosInstance.get<TicketsStatsResponse>(`/api/stats/admin/tickets?time_range=${range}`);
        return response.data;
    }

    async transactionsStats(range: string): Promise<TransactionStatsResponse> {
        const response = await axiosInstance.get<TransactionStatsResponse>(`/api/stats/admin/transactions?time_range=${range}`);
        return response.data;
    }
    
    async topCustomersStats(range: string): Promise<TopCustomersResponse> {
        const response = await axiosInstance.get<TopCustomersResponse>(`/api/stats/admin/top-customers?time_range=${range}`);
        return response.data;
    }

    async monthlySalesStats(range: string): Promise<MonthlySalesResponse> {
        const response = await axiosInstance.get<MonthlySalesResponse>(`/api/stats/admin/monthly-sales?time_range=${range}`);
        return response.data;
    }
}

export default new StatsService();