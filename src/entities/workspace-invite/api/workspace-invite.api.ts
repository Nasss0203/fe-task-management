import type { ApiResponse } from "@/shared/api";
import instance from "@/shared/api/api-client";

import type {
	CreateWorkspaceInvitePayload,
	InviteSuggestion,
	PendingWorkspaceInvite,
} from "../model/workspace-invite.types";

const WORKSPACE_INVITE_API = "/workspace-invites";

export const workspaceInviteApi = {
	searchUsers: async (
		workspaceId: string,
		query: string,
	): Promise<InviteSuggestion[]> => {
		const response = await instance.get<ApiResponse<InviteSuggestion[]>>(
			`${WORKSPACE_INVITE_API}/${workspaceId}/users/search`,
			{
				params: {
					q: query,
				},
			},
		);

		return response.data.data;
	},
	invite: async (
		workspaceId: string,
		payload: CreateWorkspaceInvitePayload,
	) => {
		const response = await instance.post<ApiResponse<unknown[]>>(
			`${WORKSPACE_INVITE_API}/${workspaceId}/members`,
			payload,
		);

		return response.data.data;
	},

	accept: async (token: string): Promise<void> => {
		await instance.post(
			`${WORKSPACE_INVITE_API}/${encodeURIComponent(token)}/accept`,
		);
	},

	decline: async (token: string): Promise<void> => {
		await instance.post(
			`${WORKSPACE_INVITE_API}/${encodeURIComponent(token)}/decline`,
		);
	},

	getPendingInvites: async (
		workspaceId: string,
	): Promise<PendingWorkspaceInvite[]> => {
		const response = await instance.get<
			ApiResponse<PendingWorkspaceInvite[]>
		>(`${WORKSPACE_INVITE_API}/${workspaceId}/invites/pending`);

		return response.data.data;
	},

	resend: async (workspaceId: string, inviteId: string): Promise<void> => {
		await instance.post(
			`${WORKSPACE_INVITE_API}/${workspaceId}/invites/${inviteId}/resend`,
		);
	},

	revoke: async (workspaceId: string, inviteId: string): Promise<void> => {
		await instance.post(
			`${WORKSPACE_INVITE_API}/${workspaceId}/invites/${inviteId}/revoke`,
		);
	},
};
