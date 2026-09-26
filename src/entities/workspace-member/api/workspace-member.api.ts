import type { ApiResponse } from "@/shared/api";
import instance from "@/shared/api/api-client";

import type {
	WorkspaceMemberRole,
	WorkspacePerson,
} from "../model/workspace-member.types";

const WORKSPACE_MEMBER_API = "/workspace-members";

export const workspaceMemberApi = {
	getPeople: async (workspaceId: string): Promise<WorkspacePerson[]> => {
		const response = await instance.get<ApiResponse<WorkspacePerson[]>>(
			`${WORKSPACE_MEMBER_API}/${workspaceId}/people`,
		);

		return response.data.data;
	},

	updateRole: async (
		workspaceId: string,
		userId: string,
		roleName: WorkspaceMemberRole,
	): Promise<void> => {
		await instance.patch(
			`${WORKSPACE_MEMBER_API}/${workspaceId}/members/${userId}`,
			{
				role_name: roleName,
			},
		);
	},
	leaveWorkspace: async (workspaceId: string): Promise<void> => {
		await instance.delete(
			`${WORKSPACE_MEMBER_API}/${workspaceId}/members/me`,
		);
	},
	removeMember: async (workspaceId: string, userId: string): Promise<void> => {
		await instance.delete(
			`${WORKSPACE_MEMBER_API}/${workspaceId}/members/${userId}`,
		);
	},
};
