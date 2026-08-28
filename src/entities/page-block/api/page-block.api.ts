import instance from "@/shared/api/api-client";

import { ApiResponse } from "@/shared/api";
import type {
	BookmarkMetadata,
	PageBlock,
	PageBlockJson,
	PageBlockStyleConfig,
	PageBlockType,
	ResolveBookmarkMetadataInput,
} from "../model/page-block.types";

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

	create: async (input: {
		page_id: string;
		parent_block_id?: string | null;
		after_block_id?: string | null;
		type: PageBlockType;
		content?: PageBlockJson;
		style_config?: PageBlockStyleConfig;
		data_config?: PageBlockJson;
	}): Promise<PageBlock> => {
		const response = await instance.post<ApiResponse<PageBlock>>(
			"/pageBlock",
			input,
		);

		return response.data.data;
	},

	attachDatabaseView: async (
		blockId: string,
		input: {
			database_id: string;
			view_id: string;
		},
	): Promise<PageBlock> => {
		const response = await instance.post<ApiResponse<PageBlock>>(
			`/pageBlock/${blockId}/database-views`,
			input,
		);

		return response.data.data;
	},
	update: async (
		blockId: string,
		input: {
			type?: PageBlockType;
			title?: string | null;
			content?: PageBlockJson;
			style_config?: PageBlockStyleConfig;
			data_config?: PageBlockJson;
			is_open?: boolean;
		},
	): Promise<PageBlock> => {
		const response = await instance.patch<ApiResponse<PageBlock>>(
			`${PAGE_BLOCK_API}/${blockId}`,
			input,
		);

		return response.data.data;
	},

	delete: async (blockId: string): Promise<void> => {
		await instance.delete(`${PAGE_BLOCK_API}/${blockId}`);
	},

	resolveBookmarkMetadata: async (
		input: ResolveBookmarkMetadataInput,
	): Promise<BookmarkMetadata> => {
		const response = await instance.post<ApiResponse<BookmarkMetadata>>(
			"/pageBlock/bookmark/metadata",
			input,
		);

		return response.data.data;
	},
};
