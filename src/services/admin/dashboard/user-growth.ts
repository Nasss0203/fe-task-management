import instance from "@/services/axios";
import type { ApiResponse } from "@/services/admin/dashboard/type";
import type {
	UserGrowthGroupBy,
	UserGrowthItem,
	UserGrowthPeriod,
} from "./type";

export const getUserGrowthApi = async (
	period: UserGrowthPeriod = "7d",
): Promise<ApiResponse<UserGrowthItem[]>> => {
	const groupBy: UserGrowthGroupBy = period === "1y" ? "month" : "day";

	const response = await instance.get<ApiResponse<UserGrowthItem[]>>(
		"/admin/dashboard/user-growth",
		{
			params: {
				period,
				groupBy,
			},
		},
	);

	return response.data;
};
