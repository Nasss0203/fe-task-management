import instance from "@/services/axios";
import type {
	AdminFindAllWorkspaceQuery,
	ApiResponse,
	DashboardSummaryResponseDto,
	WorkspaceItem,
} from "./type";

export const getAdminDashboardSummaryApi = async (): Promise<
	ApiResponse<DashboardSummaryResponseDto>
> => {
	const response = await instance.get<
		ApiResponse<DashboardSummaryResponseDto>
	>("/admin/dashboard/summary");

	return response.data;
};

export const findAllWorkspaceAdminApi = async (
	query?: AdminFindAllWorkspaceQuery,
): Promise<ApiResponse<WorkspaceItem[]>> => {
	const response = await instance.get<ApiResponse<WorkspaceItem[]>>(
		"/admin/findAll-workspaces",
		{
			params: query,
		},
	);

	return response.data;
};
