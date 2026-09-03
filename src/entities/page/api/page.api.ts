import instance from "@/shared/api/api-client";

import { ApiResponse } from "@/shared/api";

import type {
	CreatePageInput,
	MovePageInput,
	Page,
	UpdatePageInput,
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

	getById: async (pageId: string, signal?: AbortSignal): Promise<Page> => {
		const response = await instance.get<ApiResponse<Page>>(
			`${PAGE_API}/${pageId}`,
			{
				signal,
			},
		);

		return response.data.data;
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
