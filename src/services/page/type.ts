import { PageBlockItem } from "../page_block/type";

export enum PAGE_KEY {
	PAGE = "page",
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
