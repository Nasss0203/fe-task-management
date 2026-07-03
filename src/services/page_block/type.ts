import { BoardViewType } from "../board/type";

export enum PAGE_BLOCK_KEY {
	PAGE_BLOCKS = "page-blocks",
}

export enum PageBlockType {
	TEXT = "TEXT",
	HEADER = "HEADER",
	QUOTE = "QUOTE",
	DIVIDER = "DIVIDER",
	CODE = "CODE",
	TODO = "TODO",

	IMAGE = "IMAGE",
	VIDEO = "VIDEO",
	FILE = "FILE",
	BOOKMARK = "BOOKMARK",

	EMBED = "EMBED",
	FIGMA = "FIGMA",
	GITHUB_GIST = "GITHUB_GIST",
	GOOGLE_MAPS = "GOOGLE_MAPS",
	TWEET = "TWEET",

	DATABASE_VIEW = "DATABASE_VIEW",
	TABLE_SIMPLE = "TABLE_SIMPLE",
	MERMAID = "MERMAID",
	BUTTON = "BUTTON",
}

export interface PageBlockDataConfig {
	workspace_id: string;
	project_id: string;
	default_board_id: string | null;
	default_view_type: BoardViewType;
}

export interface LegacyPageBlockDataConfig {
	view_type: BoardViewType;
	board_id: string | null;
	workspace_id: string;
	project_id: string;
}

export type PageBlockJson =
	| Record<string, unknown>
	| unknown[]
	| PageBlockDataConfig
	| LegacyPageBlockDataConfig
	| LegacyPageBlockDataConfig[]
	| null;

export interface PageBlockItem {
	id: string;
	page_id: string;
	type: PageBlockType;
	title: string | null;
	position_x: number | null;
	position_y: number | null;
	width: number | null;
	height: number | null;
	order_index: number;
	content: PageBlockJson;
	style_config: Record<string, unknown> | null;
	data_config: PageBlockDataConfig | LegacyPageBlockDataConfig[] | null;
	created_by: string;
	is_open: boolean;
	created_at: string;
	updated_at: string;
}

export interface CreatePageBlockPayload {
	page_id: string;
	type: PageBlockType;
	title?: string | null;
	position_x?: number | null;
	position_y?: number | null;
	width?: number | null;
	height?: number | null;
	order_index?: number;
	insert_after_block_id?: string;
	content?: PageBlockJson;
	style_config?: Record<string, unknown> | null;
	data_config?: PageBlockDataConfig | null;
	is_open?: boolean;
}

export interface DeletePageBlockPayload {
	blockId: string;
	pageId: string;
	workspaceId: string;
}

export interface ReorderPageBlockPayload {
	page_id: string;
	items: {
		id: string;
		order_index: number;
	}[];
}

export interface CreatePageBlockResponse {
	data: PageBlockItem;
}

export interface FindPageBlocksByPageResponse {
	data: PageBlockItem[];
}

export interface UpdatePageBlockPayload {
	id: string;
	title?: string | null;
	position_x?: number | null;
	position_y?: number | null;
	width?: number | null;
	height?: number | null;
	order_index?: number;
	content?: PageBlockJson;
	style_config?: Record<string, unknown> | null;
	data_config?: PageBlockDataConfig | null;
}

export const normalizeDatabaseViewConfig = (
	dataConfig: PageBlockItem["data_config"],
): PageBlockDataConfig | null => {
	const raw = Array.isArray(dataConfig) ? dataConfig[0] : dataConfig;

	if (!raw?.workspace_id || !raw.project_id) return null;

	return {
		workspace_id: raw.workspace_id,
		project_id: raw.project_id,
		default_board_id:
			"default_board_id" in raw ? raw.default_board_id : raw.board_id,
		default_view_type:
			"default_view_type" in raw
				? raw.default_view_type
				: raw.view_type,
	};
};
