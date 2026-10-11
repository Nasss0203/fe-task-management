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

export interface TemplateEntitlementDto {
	id: string;
	template_id: string;
	user_id: string;
	source: "FREE_CLAIM";
	created_at: string;
}

/** Step 5A library projection; intentionally excludes workspace/source content. */
export interface ClaimedTemplateDto {
	entitlement_id: string;
	template_id: string;
	source: TemplateEntitlementDto["source"];
	claimed_at: string;
	name: string | null;
	description: string | null;
	icon: string | null;
	cover_url: string | null;
	visibility: TemplateVisibility;
	status: TemplateStatus;
	listing_status: TemplateListingStatus | null;
	published_version: Pick<
		TemplateVersion,
		"id" | "template_id" | "version_number" | "status" | "published_at"
	> | null;
}

export interface MyClaimedTemplatesResponse {
	items: ClaimedTemplateDto[];
	nextCursor: string | null;
}

export interface ListMyClaimedTemplatesParams {
	limit?: number;
	cursor?: string | null;
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

export interface ListPublicTemplatesParams {
	search?: string;
	cursor?: string | null;
	limit?: number;
}

export type PublicTemplateListItem = Omit<PageTemplate, "version"> & {
	version: TemplateVersion;
};

export interface PublicTemplateListResponse {
	items: PublicTemplateListItem[];
	nextCursor: string | null;
}

export type TemplateAccess = {
	canPreview: boolean;
	canUse: boolean;
	canPurchase: boolean;
	isOwned: boolean;
};

export function getPublicTemplateAccess(): TemplateAccess {
	return {
		canPreview: true,
		canUse: true,
		canPurchase: false,
		isOwned: false,
	};
}

export type TemplateOfferType = "FREE";

export type TemplateListingStatus = "DRAFT" | "PUBLISHED";

export interface TemplateListingDto {
	published_version_id?: string | null;
	id: string;
	template_id: string;
	offer_type: TemplateOfferType;
	status: TemplateListingStatus;
	created_by: string;
	published_at: string | null;
	created_at: string;
	updated_at: string;
}

export interface PublishTemplateToMarketplacePayload {
	version_id: string;
	offer_type: "FREE";
}

export interface PublishTemplateToMarketplaceResponse {
	template: PageTemplate;
	version: TemplateVersion;
	listing: TemplateListingDto;
}
