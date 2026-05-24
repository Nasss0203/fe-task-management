import instance from "@/services/axios";
import type { ApiResponse } from "@/services/admin/dashboard/type";
import type { ActivityItem } from "./type";

export const getRecentActivitiesApi = async (): Promise<
	ApiResponse<ActivityItem[]>
> => {
	const response = await instance.get<ApiResponse<ActivityItem[]>>(
		"/admin/dashboard/recent-activities",
	);

	return response.data;
};
