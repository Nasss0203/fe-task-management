import instance from "@/shared/api/api-client";

import { ApiResponse } from "@/shared/api";
import type { PageBlock } from "../model/page-block.types";

const PAGE_BLOCK_API = "/pageBlock";

export const pageBlockApi = {
	getByPage: async (
		pageId: string,
		signal?: AbortSignal,
	): Promise<PageBlock[]> => {
		const response = await instance.get<ApiResponse<PageBlock[]>>(
			`${PAGE_BLOCK_API}/page/${pageId}`,
			{
				signal,
			},
		);

		return response.data.data;
	},

	getById: async (
		blockId: string,
		signal?: AbortSignal,
	): Promise<PageBlock> => {
		const response = await instance.get<ApiResponse<PageBlock>>(
			`${PAGE_BLOCK_API}/${blockId}`,
			{
				signal,
			},
		);

		return response.data.data;
	},
};
