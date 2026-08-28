import instance from "@/shared/api/api-client";

import { ApiResponse } from "@/shared/api";
import type { CreatePageInput, Page } from "../model/page.types";

const PAGE_API = "/page";

export const pageApi = {
	create: async (input: CreatePageInput): Promise<Page> => {
		const response = await instance.post<ApiResponse<Page>>("/page", input);

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
};
