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
	isDemo?: boolean;
	/** FULL_VERSION: a separate demo version; LIMITED: allowlisted content only. */
	demoScope?: TemplateDemoScope;
	/** Set for LIMITED demos: how much the backend filtered out. */
	hiddenContent?: { blocks: number; rows: number };
}

export interface UseTemplatePayload {
	workspace_id: string;
}

export interface UseTemplateResponse {
	pageId: string;
}

export type TemplateEntitlementSource = "FREE_CLAIM" | "PAID_PURCHASE";

export interface TemplateEntitlementDto {
	id: string;
	template_id: string;
	user_id: string;
	source: TemplateEntitlementSource;
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
	source?: TemplateEntitlementSource;
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

export type PublicTemplateSort = "newest" | "top_rated" | "most_liked";

export interface ListPublicTemplatesParams {
	search?: string;
	/** Category slug, filtered by the backend. */
	category?: string;
	/** Listing tag (lowercase slug), filtered by the backend. */
	tag?: string;
	offer_type?: TemplateOfferType;
	sort?: PublicTemplateSort;
	cursor?: string | null;
	limit?: number;
}

export type PublicTemplateListItem = Omit<PageTemplate, "version"> & {
	version: TemplateVersion;
	// Marketplace fields returned by the public endpoints.
	offer_type?: TemplateOfferType;
	price_amount?: number;
	currency?: TemplateCurrency;
	preview_mode?: TemplatePreviewMode;
	categories?: PublicTemplateCategory[];
	tags?: string[];
	creator?: PublicTemplateCreator | null;
	rating_average?: number | null;
	rating_count?: number;
	like_count?: number;
};

export interface TemplateReview {
	id: string;
	rating: number;
	body: string | null;
	version_number: number | null;
	is_owner: boolean;
	author: PublicTemplateCreator | null;
	created_at: string;
	updated_at: string;
}

export interface TemplateReviewViewer {
	liked: boolean;
	review: { rating: number; body: string | null } | null;
	is_creator: boolean;
	can_comment: boolean;
}

/** GET /public/templates/:id/reviews */
export interface TemplateReviewsResponse {
	rating_average: number | null;
	rating_count: number;
	like_count: number;
	/** Counts for 1★ … 5★. */
	distribution: number[];
	items: TemplateReview[];
	total: number;
	page: number;
	limit: number;
	total_pages: number;
	viewer: TemplateReviewViewer | null;
}

export interface UpsertTemplateReviewInput {
	rating: number;
	body?: string | null;
}

export interface TemplateLikeResponse {
	liked: boolean;
	like_count: number;
}

/** Public byline of a template (no id or email). */
export interface PublicTemplateCreator {
	username: string;
	avatar_url: string | null;
}

export interface PublicTemplateCategory {
	id: string;
	name: string;
	slug: string;
}

/** GET /templates/:id/usable-versions — official releases the user may use. */
export interface UsableTemplateVersion {
	id: string;
	version_number: number;
	status: TemplateVersionStatus;
	released_at: string;
	is_current: boolean;
}

export interface UsableTemplateVersionsResponse {
	items: UsableTemplateVersion[];
}

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

export type TemplateOfferType = "FREE" | "PAID";

export type TemplatePreviewMode = "IMAGE" | "INTERACTIVE";

export type TemplateDemoScope = "FULL_VERSION" | "LIMITED";

export interface TemplateDemoDatabaseRules {
	view_ids: string[];
	property_ids: string[];
	/** Exactly one of row_ids / row_limit (max 20 rows). */
	row_ids?: string[];
	row_limit?: number;
}

/** demo_config schema 1, validated and enforced by the backend. */
export interface TemplateDemoConfig {
	schema: 1;
	scope: TemplateDemoScope;
	block_ids?: string[];
	databases?: Record<string, TemplateDemoDatabaseRules>;
}

/** Backend accepts VND only (TemplatePrice value object). */
export type TemplateCurrency = "VND";

export type TemplateListingStatus = "DRAFT" | "PUBLISHED";

export interface TemplateListingCategory {
	id: string;
	name: string;
	slug: string;
	is_active: boolean;
}

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
	// Always returned by the backend; optional so older fixtures stay valid.
	price_amount?: number;
	currency?: TemplateCurrency;
	preview_mode?: TemplatePreviewMode;
	demo_version_id?: string | null;
	demo_config?: Record<string, unknown> | null;
	category_ids?: string[];
	categories?: TemplateListingCategory[];
	tags?: string[];
}

/** PATCH /templates/:id/listing. Categories are not accepted here. */
export interface UpdateTemplateListingPayload {
	offer_type?: TemplateOfferType;
	price_amount?: number;
	currency?: TemplateCurrency;
	preview_mode?: TemplatePreviewMode;
	/** null clears the demo version. */
	demo_version_id?: string | null;
	/** null clears the config. */
	demo_config?: TemplateDemoConfig | null;
}

export interface PreviewTemplateDemoPayload {
	demo_version_id: string;
	demo_config?: TemplateDemoConfig | null;
}

export type CreateTemplateListingPayload = UpdateTemplateListingPayload;

export interface PublishTemplateToMarketplacePayload extends UpdateTemplateListingPayload {
	version_id: string;
	offer_type: TemplateOfferType;
	/** Replaces the listing categories when provided. */
	category_ids?: string[];
	/** Replaces the listing tags when provided (normalized by the backend). */
	tags?: string[];
}

export interface TemplateCategory {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	is_active: boolean;
	sort_order: number;
	created_at: string;
	updated_at: string;
}

export interface PublishTemplateToMarketplaceResponse {
	template: PageTemplate;
	version: TemplateVersion;
	listing: TemplateListingDto;
}

/** Mirrors the backend TemplatePurchaseStatus. */
export type TemplatePurchaseStatus =
	| "PENDING"
	| "PAID"
	| "FAILED"
	| "EXPIRED"
	| "RECONCILIATION_REQUIRED"
	| "REFUNDED";

/** POST /templates/:id/purchases and GET /templates/purchases/:id. The price is a server snapshot. */
export interface TemplatePurchase {
	id: string;
	orderCode: string;
	templateId: string;
	listingId: string;
	publishedVersionId: string;
	amount: number;
	currency: string;
	status: TemplatePurchaseStatus;
	expiresAt: string;
	paidAt: string | null;
	createdAt: string;
}

/** GET /templates/me/purchases — the buyer's own orders, newest first. */
export interface TemplatePurchaseHistoryItem {
	id: string;
	orderCode: string;
	templateId: string;
	/** Null when the template is no longer public. */
	templateName: string | null;
	templateIcon: string | null;
	versionNumber: number | null;
	amount: number;
	currency: string;
	status: TemplatePurchaseStatus;
	createdAt: string;
	paidAt: string | null;
}

export interface TemplatePurchaseHistoryResponse {
	items: TemplatePurchaseHistoryItem[];
	nextCursor: string | null;
}

/** POST /templates/purchases/:id/checkout */
export interface TemplatePurchaseCheckout {
	checkoutUrl: string;
	checkoutMethod: string;
}

/** Creator analytics range: inclusive Vietnam-time calendar dates; `from: null` is all-time. */
export interface TemplateAnalyticsRange {
	from: string | null;
	to: string;
}

export interface TemplateAnalyticsTotals {
	views: number;
	/** Distinct signed-in viewers; guests cannot be told apart. */
	uniqueViewers: number;
	guestViews: number;
	uses: number;
	paidPurchases: number;
	/** Gross VND from PAID purchases, before any platform fee. */
	grossRevenue: number;
	earnings: number;
}

/** All-time rating and likes; not filtered by the analytics period. */
export interface TemplateFeedbackSummary {
	ratingAverage: number | null;
	ratingCount: number;
	likeCount: number;
}

export interface TemplateAnalyticsTemplateTotals {
	templateId: string;
	name: string;
	totals: TemplateAnalyticsTotals;
	feedback?: TemplateFeedbackSummary;
}

interface TemplateAnalyticsRangeResponse extends TemplateAnalyticsRange {
	timeZone: string;
	currency: "VND";
}

/** GET /templates/me/analytics */
export interface CreatorTemplatesAnalyticsResponse extends TemplateAnalyticsRangeResponse {
	items: TemplateAnalyticsTemplateTotals[];
	/** Summed over all templates; empty when the creator has none. */
	daily: TemplateAnalyticsDailyPoint[];
}

export interface TemplateAnalyticsDailyPoint {
	date: string;
	views: number;
	uses: number;
	paidPurchases: number;
	grossRevenue: number;
	earnings: number;
}

export interface TemplateAnalyticsVersionPoint {
	versionId: string;
	versionNumber: number;
	uses: number;
	paidPurchases: number;
	grossRevenue: number;
	earnings: number;
}

export interface TemplateAnalyticsSale {
	purchaseId: string;
	orderCode: string;
	paidAt: string;
	versionNumber: number | null;
	amount: number;
	commissionRateBps: number;
	platformFeeAmount: number;
	earnings: number;
}

/** GET /templates/:templateId/analytics */
export interface CreatorTemplateAnalyticsResponse extends TemplateAnalyticsRangeResponse {
	templateId: string;
	totals: TemplateAnalyticsTotals;
	daily: TemplateAnalyticsDailyPoint[];
	versions: TemplateAnalyticsVersionPoint[];
	sales: TemplateAnalyticsSale[];
}
