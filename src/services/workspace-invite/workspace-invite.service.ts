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

	return response.data.data;
};

export const acceptWorkspaceInviteApi = async (
	token: string,
): Promise<ApiResponse<WorkspaceInviteResponse>> => {
	const response = await instance.post<ApiResponse<WorkspaceInviteResponse>>(
		`/workspace-invites/${encodeURIComponent(token)}/accept`,
	);

	return response.data;
};

export const declineWorkspaceInviteApi = async (
	token: string,
): Promise<ApiResponse<WorkspaceInviteResponse>> => {
	const response = await instance.post<ApiResponse<WorkspaceInviteResponse>>(
		`/workspace-invites/${encodeURIComponent(token)}/decline`,
	);

	return response.data;
};
