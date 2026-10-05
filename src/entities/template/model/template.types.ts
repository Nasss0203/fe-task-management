export type TemplateStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type TemplateVisibility = "PRIVATE" | "WORKSPACE" | "PUBLIC";

export interface PageTemplate {
	id: string;
	source_page_id: string | null;
	workspace_id: string;
	name: string;
	description: string | null;
	icon: string | null;
	cover_url: string | null;
	created_by: string;
	status: TemplateStatus;
	visibility: TemplateVisibility;
	created_at: string;
	updated_at: string;
}

export interface TemplateListResponse {
	items: PageTemplate[];
	nextCursor: string | null;
}

export interface ListTemplatesParams {
	scope: "mine" | "workspace";
	workspaceId?: string;
	search?: string;
	cursor?: string | null;
	limit?: number;
}

export interface CreateTemplateFromPagePayload {
	name: string;
	description?: string | null;
	visibility: TemplateVisibility;
}

export type TemplateVersionStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface TemplateVersion {
	id: string;
	template_id: string;
	version_number: number;
	status: TemplateVersionStatus;
	created_by: string;
	published_at: string | null;
	created_at: string;
	updated_at: string;
}

export interface TemplateBlock {
	id: string;
	version_id: string;
	parent_block_id: string | null;
	type: string;
	title: string | null;
	position_x: number | null;
	position_y: number | null;
	width: number | null;
	height: number | null;
	order_index: number;
	content: Record<string, unknown> | null;
	style_config: Record<string, unknown> | null;
	data_config: Record<string, unknown> | null;
	created_by: string;
	is_open: boolean;
	created_at: string;
	updated_at: string;
}

export interface TemplatePreview {
	template: PageTemplate;
	version: TemplateVersion;
	blocks: TemplateBlock[];
}

export interface UseTemplatePayload {
	workspace_id: string;
}

export interface UseTemplateResponse {
	pageId: string;
}

export interface UpdateTemplatePayload {
	name?: string;
	description?: string | null;
	icon?: string | null;
	cover_url?: string | null;
	visibility?: TemplateVisibility;
}
