import instance from "@/services/axios";
import type { ApiResponse } from "@/services/admin/dashboard/type";
import type { WorkspaceGrowthItem, WorkspaceGrowthPeriod } from "./type";

export const getWorkspaceGrowthApi = async (
	period: WorkspaceGrowthPeriod = "7d",
): Promise<ApiResponse<WorkspaceGrowthItem[]>> => {
	const response = await instance.get<ApiResponse<WorkspaceGrowthItem[]>>(
		"/admin/dashboard/workspace-growth",
		{
			params: {
				period,
			},
		},
	);

	return response.data;
};
