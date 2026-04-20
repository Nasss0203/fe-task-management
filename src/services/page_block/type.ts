import { BoardViewType } from "../board/type";

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
	view_type: BoardViewType;
	board_id: string | null;
	workspace_id: string;
	project_id: string;
}

export type PageBlockJson =
	| Record<string, unknown>
	| unknown[]
	| PageBlockDataConfig
	| PageBlockDataConfig[]
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
	data_config: PageBlockDataConfig[] | null;
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
	content?: PageBlockJson;
	style_config?: Record<string, unknown> | null;
	data_config?: PageBlockDataConfig[] | null;
	created_by: string;
}

export interface CreatePageBlockResponse {
	data: PageBlockItem;
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
	data_config?: PageBlockDataConfig[] | null;
}
