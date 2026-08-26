import { ApiResponse } from "@/shared/api";
import instance from "@/shared/api/api-client";
import type { Workspace, WorkspaceAccess } from "../model/workspace.types";

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

	select: async (workspaceId: string): Promise<{ workspaceId: string }> => {
		const response = await instance.patch<
			ApiResponse<{ workspaceId: string }>
		>(`${WORKSPACE_API}/${workspaceId}/select`);

		return response.data.data;
	},
};
