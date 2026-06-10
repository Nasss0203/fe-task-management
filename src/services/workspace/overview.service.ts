import instance from "@/services/axios";
import type { ApiResponse } from "@/services/types";
import type { WorkspaceOverviewApiData } from "@/features/workspace/components/workspaces/workspace-overview/workspace-overview.types";

export type GetWorkspaceOverviewResponse =
	ApiResponse<WorkspaceOverviewApiData>;

export const getWorkspaceOverviewApi = async (
	workspaceId: string,
): Promise<WorkspaceOverviewApiData> => {
	const response = await instance.get<GetWorkspaceOverviewResponse>(
		`/dashboard/workspaces/${workspaceId}/overview`,
	);
	return response.data.data;
};
