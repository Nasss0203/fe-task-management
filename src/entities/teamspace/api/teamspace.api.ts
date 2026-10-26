import { ApiResponse } from "@/shared/api";

import instance from "@/shared/api/api-client";

import type {
	AddTeamspaceMemberInput,
	CreatedTeamspaceInviteLink,
	CreateTeamspaceInput,
	CreateTeamspaceInviteLinkInput,
	DiscoverTeamspacesResponse,
	ListTeamspaceInvitationsResponse,
	MyTeamspaceInvitation,
	Teamspace,
	TeamspaceInvitation,
	TeamspaceInviteLink,
	TeamspaceMember,
	TeamspaceRole,
	TeamspaceVisibility,
	UpdateTeamspacePayload,
} from "../model/teamspace.types";

const TEAMSPACE_API = "/teamspaces";

export const teamspaceApi = {
	getByWorkspace: async (
		workspaceId: string,
		signal?: AbortSignal,
	): Promise<Teamspace[]> => {
		const response = await instance.get<ApiResponse<Teamspace[]>>(
			TEAMSPACE_API,
			{
				params: {
					workspaceId,
				},
				signal,
			},
		);

		return response.data.data;
	},

	create: async (input: CreateTeamspaceInput): Promise<Teamspace> => {
		const response = await instance.post<ApiResponse<Teamspace>>(
			TEAMSPACE_API,
			input,
		);

		return response.data.data;
	},

	getMembers: async (
		teamspaceId: string,
		signal?: AbortSignal,
	): Promise<TeamspaceMember[]> => {
		const response = await instance.get<ApiResponse<TeamspaceMember[]>>(
			`${TEAMSPACE_API}/${teamspaceId}/members`,
			{
				signal,
			},
		);

		return response.data.data;
	},

	addMember: async (
		teamspaceId: string,
		input: AddTeamspaceMemberInput,
	): Promise<TeamspaceMember> => {
		const response = await instance.post<ApiResponse<TeamspaceMember>>(
			`${TEAMSPACE_API}/${teamspaceId}/members`,
			input,
		);

		return response.data.data;
	},

	getMyInvitations: async (
		signal?: AbortSignal,
	): Promise<MyTeamspaceInvitation[]> => {
		const response = await instance.get<
			ApiResponse<MyTeamspaceInvitation[]>
		>(`${TEAMSPACE_API}/invitations/me`, {
			signal,
		});

		return response.data.data;
	},

	acceptInvitation: async (
		invitationId: string,
	): Promise<TeamspaceInvitation> => {
		const response = await instance.post<ApiResponse<TeamspaceInvitation>>(
			`${TEAMSPACE_API}/invitations/${invitationId}/accept`,
		);

		return response.data.data;
	},

	declineInvitation: async (
		invitationId: string,
	): Promise<TeamspaceInvitation> => {
		const response = await instance.post<ApiResponse<TeamspaceInvitation>>(
			`${TEAMSPACE_API}/invitations/${invitationId}/decline`,
		);

		return response.data.data;
	},

	updateMemberRole: async (
		teamspaceId: string,
		memberId: string,
		roleName: TeamspaceRole,
	): Promise<TeamspaceMember> => {
		const response = await instance.patch<ApiResponse<TeamspaceMember>>(
			`${TEAMSPACE_API}/${teamspaceId}/members/${memberId}/role`,
			{ role_name: roleName },
		);

		return response.data.data;
	},

	removeMember: async (
		teamspaceId: string,
		memberId: string,
	): Promise<void> => {
		await instance.delete(
			`${TEAMSPACE_API}/${teamspaceId}/members/${memberId}`,
		);
	},

	leave: async (teamspaceId: string): Promise<void> => {
		await instance.post(`${TEAMSPACE_API}/${teamspaceId}/leave`);
	},

	inviteMember: async (
		teamspaceId: string,
		workspaceMemberId: string,
	): Promise<TeamspaceInvitation> => {
		const response = await instance.post<ApiResponse<TeamspaceInvitation>>(
			`${TEAMSPACE_API}/${teamspaceId}/invitations`,
			{ workspace_member_id: workspaceMemberId },
		);

		return response.data.data;
	},

	getPendingInvitations: async (
		teamspaceId: string,
		signal?: AbortSignal,
	): Promise<ListTeamspaceInvitationsResponse> => {
		const response = await instance.get<
			ApiResponse<ListTeamspaceInvitationsResponse>
		>(`${TEAMSPACE_API}/${teamspaceId}/invitations`, {
			params: { status: "PENDING", limit: 100 },
			signal,
		});

		return response.data.data;
	},

	revokeInvitation: async (invitationId: string): Promise<void> => {
		await instance.post(
			`${TEAMSPACE_API}/invitations/${invitationId}/revoke`,
		);
	},

	resendInvitation: async (
		invitationId: string,
	): Promise<TeamspaceInvitation> => {
		const response = await instance.post<ApiResponse<TeamspaceInvitation>>(
			`${TEAMSPACE_API}/invitations/${invitationId}/resend`,
		);

		return response.data.data;
	},

	createInviteLink: async (
		teamspaceId: string,
		input: CreateTeamspaceInviteLinkInput,
	): Promise<CreatedTeamspaceInviteLink> => {
		const response = await instance.post<
			ApiResponse<CreatedTeamspaceInviteLink>
		>(`${TEAMSPACE_API}/${teamspaceId}/invite-links`, input);

		return response.data.data;
	},

	getInviteLinks: async (
		teamspaceId: string,
		signal?: AbortSignal,
	): Promise<TeamspaceInviteLink[]> => {
		const response = await instance.get<ApiResponse<TeamspaceInviteLink[]>>(
			`${TEAMSPACE_API}/${teamspaceId}/invite-links`,
			{ signal },
		);

		return response.data.data;
	},

	revokeInviteLink: async (
		teamspaceId: string,
		linkId: string,
	): Promise<void> => {
		await instance.delete(
			`${TEAMSPACE_API}/${teamspaceId}/invite-links/${linkId}`,
		);
	},

	joinByLink: async (token: string): Promise<TeamspaceMember> => {
		const response = await instance.post<ApiResponse<TeamspaceMember>>(
			`${TEAMSPACE_API}/join-by-link`,
			{ token },
		);

		return response.data.data;
	},

	discover: async (
		workspaceId: string,
		signal?: AbortSignal,
	): Promise<DiscoverTeamspacesResponse> => {
		const response = await instance.get<
			ApiResponse<DiscoverTeamspacesResponse>
		>(`${TEAMSPACE_API}/discover`, {
			params: { workspaceId, limit: 100 },
			signal,
		});

		return response.data.data;
	},

	join: async (teamspaceId: string): Promise<TeamspaceMember> => {
		const response = await instance.post<ApiResponse<TeamspaceMember>>(
			`${TEAMSPACE_API}/${teamspaceId}/join`,
		);

		return response.data.data;
	},

	updateJoinSettings: async (
		teamspaceId: string,
		visibility: TeamspaceVisibility,
	): Promise<Teamspace> => {
		const response = await instance.patch<ApiResponse<Teamspace>>(
			`${TEAMSPACE_API}/${teamspaceId}/join-settings`,
			{ visibility },
		);

		return response.data.data;
	},

	update: async (
		teamspaceId: string,
		body: UpdateTeamspacePayload,
	): Promise<Teamspace> => {
		const response = await instance.patch<ApiResponse<Teamspace>>(
			`${TEAMSPACE_API}/${teamspaceId}`,
			body,
		);
		return response.data.data;
	},

	archive: async (teamspaceId: string): Promise<void> => {
		await instance.post(`${TEAMSPACE_API}/${teamspaceId}/archive`);
	},

	restore: async (teamspaceId: string): Promise<Teamspace> => {
		const response = await instance.post<ApiResponse<Teamspace>>(
			`${TEAMSPACE_API}/${teamspaceId}/restore`,
		);
		return response.data.data;
	},

	getArchived: async (
		workspaceId: string,
		signal?: AbortSignal,
	): Promise<Teamspace[]> => {
		const response = await instance.get<ApiResponse<Teamspace[]>>(
			`${TEAMSPACE_API}/archived`,
			{ params: { workspaceId }, signal },
		);
		return response.data.data;
	},
};
