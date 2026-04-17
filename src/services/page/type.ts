import { BoardViewType } from "@/components/board/board.type";

export enum PAGE_KEY {
	PAGE = "page",
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
	view: BoardViewType;
	is_open: boolean;
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

export interface PageItem {
	id: string;
	blocks: PageBlockItem[];
	title: string;
	slug: string | null;
	is_template: boolean;
	workspace_id: string;
	created_by: string;
	createdAt: string;
	updatedAt: string;
}

export interface FindPageByWorkspaceResponse {
	statusCode: number;
	message: string;
	data: PageItem;
}
