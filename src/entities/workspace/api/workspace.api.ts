import { ApiResponse } from "@/shared/api";
import instance from "@/shared/api/api-client";
import type {
	CreateWorkspaceInput,
	Workspace,
	WorkspaceAccess,
	WorkspaceStarterDefinition,
} from "../model/workspace.types";

const WORKSPACE_API = "/workspaces";

export const workspaceApi = {
	getAll: async (signal?: AbortSignal): Promise<Workspace[]> => {
		const response = await instance.get<ApiResponse<Workspace[]>>(
			WORKSPACE_API,
			{
				signal,
			},
		);

		return response.data.data;
	},

	getById: async (
		workspaceId: string,
		signal?: AbortSignal,
	): Promise<Workspace> => {
		const response = await instance.get<ApiResponse<Workspace>>(
			`${WORKSPACE_API}/${workspaceId}`,
			{
				signal,
			},
		);

		return response.data.data;
	},

	getAccess: async (
		workspaceId: string,
		signal?: AbortSignal,
	): Promise<WorkspaceAccess> => {
		const response = await instance.get<ApiResponse<WorkspaceAccess>>(
			`${WORKSPACE_API}/${workspaceId}/access`,
			{
				signal,
			},
		);

		return response.data.data;
	},

	getStarters: async (
		signal?: AbortSignal,
	): Promise<WorkspaceStarterDefinition[]> => {
		const response = await instance.get<
			ApiResponse<WorkspaceStarterDefinition[]>
		>(`${WORKSPACE_API}/starters`, { signal });

		return response.data.data;
	},

	create: async (input: CreateWorkspaceInput): Promise<Workspace> => {
		const response = await instance.post<ApiResponse<Workspace>>(
			WORKSPACE_API,
			input,
		);

		return response.data.data;
	},

	select: async (workspaceId: string): Promise<{ workspaceId: string }> => {
		const response = await instance.patch<
			ApiResponse<{ workspaceId: string }>
		>(`${WORKSPACE_API}/${workspaceId}/select`);

		return response.data.data;
	},
};
