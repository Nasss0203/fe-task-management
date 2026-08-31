import { ApiResponse } from "@/shared/api";

import instance from "@/shared/api/api-client";

import type {
	AddTeamspaceMemberInput,
	CreateTeamspaceInput,
	Teamspace,
	TeamspaceMember,
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
};
