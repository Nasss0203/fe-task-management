import type { ApiResponse } from "@/shared/api";
import instance from "@/shared/api/api-client";

import type { WorkspacePerson } from "../model/workspace-member.types";

const WORKSPACE_MEMBER_API = "/workspace-members";

export const workspaceMemberApi = {
	getPeople: async (workspaceId: string): Promise<WorkspacePerson[]> => {
		const response = await instance.get<ApiResponse<WorkspacePerson[]>>(
			`${WORKSPACE_MEMBER_API}/${workspaceId}/people`,
		);

		return response.data.data;
	},
};
