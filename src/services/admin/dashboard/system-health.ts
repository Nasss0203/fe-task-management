import instance from "@/services/axios";
import type { ApiResponse } from "@/services/admin/dashboard/type";
import type { SystemHealthItem } from "./type";

export const getSystemHealthApi = async (): Promise<
	ApiResponse<SystemHealthItem[]>
> => {
	const response = await instance.get<ApiResponse<SystemHealthItem[]>>(
		"/admin/dashboard/system-health",
	);

	return response.data;
};
