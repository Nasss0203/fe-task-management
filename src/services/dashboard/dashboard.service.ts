import instance from "@/services/axios";
import type {
	GetMyDashboardResponse,
	MyDashboardQuery,
} from "@/services/dashboard/type";

export const getMyDashboardApi = async (
	query?: MyDashboardQuery,
): Promise<GetMyDashboardResponse> => {
	const response = await instance.get<GetMyDashboardResponse>(
		"/dashboard/me",
		{
			params: query,
		},
	);

	return response.data;
};
