import instance from "@/shared/api/api-client";

import { ApiResponse } from "@/shared/api";

import type {
	CreatePageInput,
	MovePageInput,
	Page,
	PagePreset,
	PagePresetOption,
	UpdatePageInput,
	WorkspaceDatabase,
} from "../model/page.types";

const PAGE_API = "/page";

export const pageApi = {
	create: async (input: CreatePageInput): Promise<Page> => {
		const response = await instance.post<ApiResponse<Page>>(
			PAGE_API,
			input,
		);

		return response.data.data;
	},

	getPresets: async (signal?: AbortSignal): Promise<PagePresetOption[]> => {
		const response = await instance.get<ApiResponse<PagePresetOption[]>>(
			`${PAGE_API}/presets`,
			{ signal },
		);

		return response.data.data;
	},

	applyPreset: async (pageId: string, preset: PagePreset): Promise<void> => {
		await instance.put(`${PAGE_API}/${pageId}/preset`, { preset });
	},

	update: async (pageId: string, input: UpdatePageInput): Promise<Page> => {
		const response = await instance.patch<ApiResponse<Page>>(
			`${PAGE_API}/${pageId}`,
			input,
		);

		return response.data.data;
	},

	getByWorkspace: async (
		workspaceId: string,
		signal?: AbortSignal,
	): Promise<Page[]> => {
		const response = await instance.get<ApiResponse<Page[]>>(
			`${PAGE_API}/workspace/${workspaceId}`,
			{
				signal,
			},
		);

		return response.data.data;
	},

	getDatabasesByWorkspace: async (
		workspaceId: string,
		signal?: AbortSignal,
	): Promise<WorkspaceDatabase[]> => {
		const response = await instance.get<ApiResponse<WorkspaceDatabase[]>>(
			`${PAGE_API}/workspace/${workspaceId}/databases`,
			{
				signal,
			},
		);

		return response.data.data;
	},

	getDeletedDatabasesByWorkspace: async (
		workspaceId: string,
		signal?: AbortSignal,
	): Promise<WorkspaceDatabase[]> => {
		const response = await instance.get<ApiResponse<WorkspaceDatabase[]>>(
			`${PAGE_API}/workspace/${workspaceId}/databases/trash`,
			{
				signal,
			},
		);

		return response.data.data;
	},

	restoreDatabase: async (pageId: string, databaseId: string) => {
		await instance.patch(
			`${PAGE_API}/${pageId}/databases/${databaseId}/restore`,
		);
	},

	deleteDatabasePermanently: async (pageId: string, databaseId: string) => {
		await instance.delete(`${PAGE_API}/${pageId}/databases/${databaseId}`);
	},

	getById: async (
		pageId: string,
		signal?: AbortSignal,
		shareToken?: string,
	): Promise<Page> => {
		const response = await instance.get<ApiResponse<Page>>(
			`${PAGE_API}/${pageId}`,
			{
				signal,
				headers: shareToken
					? {
							"X-Page-Share-Token": shareToken,
						}
					: undefined,
			},
		);

		return response.data.data;
	},

	getFavorites: async (
		workspaceId: string,
		signal?: AbortSignal,
	): Promise<Page[]> => {
		const response = await instance.get<ApiResponse<Page[]>>(
			`${PAGE_API}/favorites`,
			{
				params: {
					workspaceId,
				},
				signal,
			},
		);

		return response.data.data;
	},

	addFavorite: async (pageId: string): Promise<void> => {
		await instance.post(`${PAGE_API}/${pageId}/favorite`);
	},

	removeFavorite: async (pageId: string): Promise<void> => {
		await instance.delete(`${PAGE_API}/${pageId}/favorite`);
	},

	moveToTrash: async (pageId: string, workspaceId: string): Promise<void> => {
		await instance.delete(`${PAGE_API}/${pageId}`, {
			params: {
				workspaceId,
			},
		});
	},

	getTrash: async (
		workspaceId: string,
		signal?: AbortSignal,
	): Promise<Page[]> => {
		const response = await instance.get<ApiResponse<Page[]>>(
			`${PAGE_API}/trash`,
			{
				params: {
					workspaceId,
				},
				signal,
			},
		);

		return response.data.data;
	},

	restore: async (pageId: string, workspaceId: string): Promise<void> => {
		await instance.patch(`${PAGE_API}/${pageId}/restore`, undefined, {
			params: {
				workspaceId,
			},
		});
	},

	deletePermanently: async (
		pageId: string,
		workspaceId: string,
	): Promise<void> => {
		await instance.delete(`${PAGE_API}/trash/${pageId}`, {
			params: {
				workspaceId,
			},
		});
	},

	move: async (pageId: string, workspaceId: string, input: MovePageInput) => {
		const response = await instance.patch(
			`${PAGE_API}/${pageId}/move`,
			input,
			{
				params: {
					workspaceId,
				},
			},
		);

		return response.data;
	},

	duplicate: async (pageId: string, workspaceId: string) => {
		const response = await instance.post(
			`${PAGE_API}/${pageId}/duplicate`,
			undefined,
			{
				params: {
					workspaceId,
				},
			},
		);

		return response.data;
	},
};
