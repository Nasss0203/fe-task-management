import instance from "../axios";
import { ApiResponse } from "./../types";
import {
	CreateWorkspaceInviteDto,
	SearchInviteUserResponse,
	WorkspaceInviteResponse,
} from "./type";

export const WORKSPACE_INVITE_BATCH_SIZE = 3;

const splitInviteRecipients = (
	recipients: CreateWorkspaceInviteDto["recipients"],
) => {
	const batches: CreateWorkspaceInviteDto["recipients"][] = [];

	for (
		let index = 0;
		index < recipients.length;
		index += WORKSPACE_INVITE_BATCH_SIZE
	) {
		batches.push(recipients.slice(index, index + WORKSPACE_INVITE_BATCH_SIZE));
	}

	return batches;
};

export const inviteWorkspaceMembersApi = async (
	workspaceId: string,
	data: CreateWorkspaceInviteDto,
): Promise<WorkspaceInviteResponse[]> => {
	const batches = splitInviteRecipients(data.recipients);
	const invites: WorkspaceInviteResponse[] = [];

	for (const recipients of batches) {
		const response = await instance.post<WorkspaceInviteResponse[]>(
			`/workspace-invites/${workspaceId}/members`,
			{
				...data,
				recipients,
			},
		);

		invites.push(...response.data);
	}

	return invites;
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
