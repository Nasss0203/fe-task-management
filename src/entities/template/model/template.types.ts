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
	/** Represented version, included by the template list endpoint. */
	version?: TemplateVersion | null;
}

export interface TemplateListResponse {
	items: (PageTemplate & { version: TemplateVersion | null })[];
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

export interface TemplateDatabasePropertyOption {
	id: string;
	template_property_id: string;
	name: string;
	color: string | null;
	position: string;
}

export interface TemplateDatabaseProperty {
	id: string;
	template_database_id: string;
	name: string;
	type: string;
	is_default: boolean;
	is_hideable: boolean;
	position: string;
	options: TemplateDatabasePropertyOption[];
}

export interface TemplateDatabaseRowValue {
	id: string;
	template_row_id: string;
	template_property_id: string;
	value: unknown;
}

export interface TemplateDatabaseRow {
	id: string;
	template_database_id: string;
	values: TemplateDatabaseRowValue[];
}

export interface TemplateDatabaseViewProperty {
	id: string;
	template_view_id: string;
	template_property_id: string;
	position: string;
	visible: boolean;
	width: number | null;
}

export interface TemplateDatabaseView {
	id: string;
	template_database_id: string;
	name: string;
	type: string;
	position: string;
	properties: TemplateDatabaseViewProperty[];
}

export interface TemplateDatabaseSnapshot {
	id: string;
	version_id: string;
	name: string;
	properties: TemplateDatabaseProperty[];
	rows: TemplateDatabaseRow[];
	views: TemplateDatabaseView[];
}

export interface TemplatePreview {
	template: PageTemplate;
	version: TemplateVersion;
	blocks: TemplateBlock[];
	databases: TemplateDatabaseSnapshot[];
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

export type TemplateVersionThumbnail = {
	url: string;
	mimeType: string;
	width: number;
	height: number;
};
