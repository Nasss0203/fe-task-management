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
	TOGGLE = "TOGGLE",
}

export type PageBlockJson = Record<string, unknown> | null;

export type PageBlockStyleConfig = Record<string, unknown> | null;

export interface DatabaseViewBlockDataConfig {
	database_id: string;
	view_id: string;
}

export interface PageBlock {
	id: string;

	page_id: string;
	parent_block_id: string | null;

	type: PageBlockType;

	title: string | null;

	position_x: number | null;
	position_y: number | null;

	width: number | null;
	height: number | null;

	order_index: number;

	content: PageBlockJson;
	style_config: PageBlockStyleConfig;
	data_config: PageBlockJson;

	created_by: string;

	is_open: boolean;

	created_at: string;
	updated_at: string;

	deleted_at: string | null;
	deleted_by: string | null;
}

export interface BookmarkMetadata {
	url: string;
	title: string;
	description: string | null;
	siteName: string | null;
	faviconUrl: string | null;
	imageUrl: string | null;
}

export interface ResolveBookmarkMetadataInput {
	url: string;
}
