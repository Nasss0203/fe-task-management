import instance from "@/services/axios";
import type { ApiResponse } from "@/services/admin/dashboard/type";
import type { WorkspacePlanItem } from "./type";

export const getWorkspacePlanApi = async (): Promise<
	ApiResponse<WorkspacePlanItem[]>
> => {
	const response = await instance.get<ApiResponse<WorkspacePlanItem[]>>(
		"/admin/dashboard/workspace-plan",
	);

	return response.data;
};
