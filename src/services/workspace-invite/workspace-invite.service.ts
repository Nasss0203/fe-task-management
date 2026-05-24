import instance from "../axios";
import { ApiResponse } from "./../types";
import {
	CreateWorkspaceInviteDto,
	SearchInviteUserResponse,
	WorkspaceInviteResponse,
} from "./type";

export const inviteWorkspaceMembersApi = async (
	workspaceId: string,
	data: CreateWorkspaceInviteDto,
): Promise<WorkspaceInviteResponse[]> => {
	const response = await instance.post<WorkspaceInviteResponse[]>(
		`/workspace-invites/${workspaceId}/members`,
		data,
	);

	return response.data;
};

export const searchInviteUsersApi = async ({
	workspaceId,
	q,
}: {
	workspaceId: string;
	q: string;
}): Promise<SearchInviteUserResponse[]> => {
	const response = await instance.get<
		ApiResponse<SearchInviteUserResponse[]>
	>(`/workspace-invites/${workspaceId}/users/search`, {
		params: {
			q,
		},
	});
	console.log("🚀 ~ response~searchInviteUsersApi", response);

	return response.data.data;
};
