import type { ApiResponse } from "@/services/admin/dashboard/type";
import instance from "@/services/axios";
import type {
	AdminFindAllWorkspaceQuery,
	PlanTypeWorkspace,
	WorkspaceItem,
} from "./type";

export const findAllWorkspaceManagementApi = async (
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

export const updateWorkspacePlanManagementApi = async ({
	workspaceId,
	planType,
}: {
	workspaceId: string;
	planType: PlanTypeWorkspace;
}): Promise<ApiResponse<null>> => {
	const response = await instance.patch<ApiResponse<null>>(
		`/admin/workspaces/${workspaceId}/plan`,
		{
			planType,
		},
	);

	return response.data;
};
