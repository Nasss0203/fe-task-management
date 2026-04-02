export enum PAGE_KEY {
	PAGE = "page",
}

export enum PageBlockType {
	PROJECT = "PROJECT",
}

export enum PageBlockEntityType {
	PROJECT = "PROJECT",
}

export enum PageBlockViewType {
	BOARD = "BOARD",
}

export interface PageBlockDataConfig {
	view?: PageBlockViewType | string;
	is_open?: boolean;
	board_id?: string;
	project_id?: string;
	entity_type?: PageBlockEntityType | string;
	workspace_id?: string;
}

export interface PageBlockItems {
	id?: string;
	page_id?: string;
	type?: PageBlockType | string;
	title?: string;
	position_x?: number;
	position_y?: number;
	width?: number;
	height?: number;
	order_index?: number;
	style_config?: Record<string, unknown> | null;
	data_config?: PageBlockDataConfig | null;
	created_by?: string;
	created_at?: string;
	updated_at?: string;
}

export interface PageItems {
	id?: string;
	blocks?: PageBlockItems[];
	title?: string;
	slug?: string;
	is_template?: boolean;
	workspace_id?: string;
	created_by?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface FindPageByWorkspaceResponse {
	statusCode?: number;
	message?: string;
	data?: PageItems;
}
