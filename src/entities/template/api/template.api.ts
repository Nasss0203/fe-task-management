import type { ApiResponse } from "@/shared/api";
import instance from "@/shared/api/api-client";
import publicApiClient from "@/shared/api/public-api-client";
import type {
	ListMyClaimedTemplatesParams,
	MyClaimedTemplatesResponse,
	CreateTemplateFromPagePayload,
	ListPublicTemplatesParams,
	ListTemplatesParams,
	PageTemplate,
	PublicTemplateListItem,
	PublicTemplateListResponse,
	TemplateListResponse,
	TemplatePreview,
	TemplateVersion,
	TemplateVersionThumbnail,
	UpdateTemplatePayload,
	UseTemplatePayload,
	UseTemplateResponse,
	TemplateEntitlementDto,
	TemplateListingDto,
	PublishTemplateToMarketplacePayload,
	PublishTemplateToMarketplaceResponse,
	CreateTemplateListingPayload,
	UpdateTemplateListingPayload,
	TemplateCategory,
	PreviewTemplateDemoPayload,
	UsableTemplateVersionsResponse,
	TemplatePurchase,
	TemplatePurchaseCheckout,
	TemplatePurchaseHistoryResponse,
	TemplateAnalyticsRange,
	CreatorTemplatesAnalyticsResponse,
	CreatorTemplateAnalyticsResponse,
	TemplateLikeResponse,
	TemplateReviewsResponse,
	UpsertTemplateReviewInput,
} from "../model/template.types";

const TEMPLATE_API = "/templates";
const PUBLIC_TEMPLATE_API = "/public/templates";

function unwrapResponse<T>(responseData: unknown): T {
	if (
		responseData &&
		typeof responseData === "object" &&
		"data" in responseData &&
		responseData.data !== undefined
	) {
		return responseData.data as T;
	}
	return responseData as T;
}

export const templateApi = {
	listMyClaimedTemplates: async (
		params: ListMyClaimedTemplatesParams = {},
		signal?: AbortSignal,
	): Promise<MyClaimedTemplatesResponse> => {
		const response = await instance.get<
			ApiResponse<MyClaimedTemplatesResponse> | MyClaimedTemplatesResponse
		>(`${TEMPLATE_API}/me/claimed`, {
			params: {
				limit: params.limit ?? 20,
				cursor: params.cursor || undefined,
				source: params.source,
			},
			signal,
		});
		return unwrapResponse<MyClaimedTemplatesResponse>(response.data);
	},

	listMyPurchases: async (
		params: { limit?: number; cursor?: string | null } = {},
		signal?: AbortSignal,
	): Promise<TemplatePurchaseHistoryResponse> => {
		const response = await instance.get<
			ApiResponse<TemplatePurchaseHistoryResponse> | TemplatePurchaseHistoryResponse
		>(`${TEMPLATE_API}/me/purchases`, {
			params: { limit: params.limit ?? 20, cursor: params.cursor || undefined },
			signal,
		});
		return unwrapResponse<TemplatePurchaseHistoryResponse>(response.data);
	},

	getMyAnalytics: async (
		range: TemplateAnalyticsRange,
		signal?: AbortSignal,
	): Promise<CreatorTemplatesAnalyticsResponse> => {
		const response = await instance.get<
			| ApiResponse<CreatorTemplatesAnalyticsResponse>
			| CreatorTemplatesAnalyticsResponse
		>(`${TEMPLATE_API}/me/analytics`, {
			params: { from: range.from ?? undefined, to: range.from ? range.to : undefined },
			signal,
		});
		return unwrapResponse<CreatorTemplatesAnalyticsResponse>(response.data);
	},

	getAnalytics: async (
		templateId: string,
		range: TemplateAnalyticsRange,
		signal?: AbortSignal,
	): Promise<CreatorTemplateAnalyticsResponse> => {
		const response = await instance.get<
			| ApiResponse<CreatorTemplateAnalyticsResponse>
			| CreatorTemplateAnalyticsResponse
		>(`${TEMPLATE_API}/${templateId}/analytics`, {
			params: { from: range.from ?? undefined, to: range.from ? range.to : undefined },
			signal,
		});
		return unwrapResponse<CreatorTemplateAnalyticsResponse>(response.data);
	},

	list: async (
		params: ListTemplatesParams,
		signal?: AbortSignal,
	): Promise<TemplateListResponse> => {
		const response = await instance.get<
			ApiResponse<TemplateListResponse> | TemplateListResponse
		>(TEMPLATE_API, {
			params: {
				scope: params.scope,
				workspaceId: params.workspaceId || undefined,
				search: params.search || undefined,
				cursor: params.cursor || undefined,
				limit: params.limit ?? 20,
			},
			signal,
		});

		return unwrapResponse<TemplateListResponse>(response.data);
	},

	getById: async (
		templateId: string,
		signal?: AbortSignal,
	): Promise<PageTemplate> => {
		const response = await instance.get<
			ApiResponse<PageTemplate> | PageTemplate
		>(`${TEMPLATE_API}/${templateId}`, { signal });

		return unwrapResponse<PageTemplate>(response.data);
	},

	getPreview: async (
		templateId: string,
		versionId: string,
		signal?: AbortSignal,
	): Promise<TemplatePreview> => {
		const response = await instance.get<
			ApiResponse<TemplatePreview> | TemplatePreview
		>(`${TEMPLATE_API}/${templateId}/versions/${versionId}/preview`, {
			signal,
		});

		return unwrapResponse<TemplatePreview>(response.data);
	},

	listVersions: async (
		templateId: string,
		signal?: AbortSignal,
	): Promise<TemplateVersion[]> => {
		const response = await instance.get<
			| ApiResponse<TemplateVersion[]>
			| TemplateVersion[]
			| { items: TemplateVersion[] }
		>(`${TEMPLATE_API}/${templateId}/versions`, { signal });

		const unwrapped = unwrapResponse<
			TemplateVersion[] | { items: TemplateVersion[] }
		>(response.data);

		if (
			unwrapped &&
			typeof unwrapped === "object" &&
			"items" in unwrapped &&
			Array.isArray(unwrapped.items)
		) {
			return unwrapped.items;
		}

		return Array.isArray(unwrapped) ? unwrapped : [];
	},

	publishVersion: async (
		templateId: string,
		versionId: string,
	): Promise<TemplateVersion> => {
		const response = await instance.post<
			ApiResponse<TemplateVersion> | TemplateVersion
		>(`${TEMPLATE_API}/${templateId}/versions/${versionId}/publish`);

		return unwrapResponse<TemplateVersion>(response.data);
	},

	useTemplate: async (
		templateId: string,
		versionId: string,
		payload: UseTemplatePayload,
	): Promise<UseTemplateResponse> => {
		const response = await instance.post<
			ApiResponse<UseTemplateResponse> | UseTemplateResponse
		>(`${TEMPLATE_API}/${templateId}/versions/${versionId}/use`, {
			workspace_id: payload.workspace_id,
		});

		return unwrapResponse<UseTemplateResponse>(response.data);
	},

	claimFreeTemplate: async (
		templateId: string,
	): Promise<TemplateEntitlementDto> => {
		const response = await instance.post<
			ApiResponse<TemplateEntitlementDto> | TemplateEntitlementDto
		>(`${TEMPLATE_API}/${templateId}/claim`);

		return unwrapResponse<TemplateEntitlementDto>(response.data);
	},

	update: async (
		templateId: string,
		payload: UpdateTemplatePayload,
	): Promise<PageTemplate> => {
		const response = await instance.patch<
			ApiResponse<PageTemplate> | PageTemplate
		>(`${TEMPLATE_API}/${templateId}`, payload);

		return unwrapResponse<PageTemplate>(response.data);
	},

	archive: async (templateId: string): Promise<PageTemplate> => {
		const response = await instance.post<
			ApiResponse<PageTemplate> | PageTemplate
		>(`${TEMPLATE_API}/${templateId}/archive`);

		return unwrapResponse<PageTemplate>(response.data);
	},

	restore: async (templateId: string): Promise<PageTemplate> => {
		const response = await instance.post<
			ApiResponse<PageTemplate> | PageTemplate
		>(`${TEMPLATE_API}/${templateId}/restore`);

		return unwrapResponse<PageTemplate>(response.data);
	},

	createFromPage: async (
		pageId: string,
		payload: CreateTemplateFromPagePayload,
	): Promise<PageTemplate> => {
		const response = await instance.post<
			ApiResponse<PageTemplate> | PageTemplate
		>(`${TEMPLATE_API}/from-page/${pageId}`, payload);

		return unwrapResponse<PageTemplate>(response.data);
	},

	createVersion: async (templateId: string): Promise<TemplateVersion> => {
		const response = await instance.post<
			ApiResponse<TemplateVersion> | TemplateVersion
		>(`${TEMPLATE_API}/${templateId}/versions`);

		return unwrapResponse<TemplateVersion>(response.data);
	},

	getVersionThumbnail: async (
		templateId: string,
		versionId: string,
		signal?: AbortSignal,
	): Promise<TemplateVersionThumbnail> => {
		const response = await instance.get<
			ApiResponse<TemplateVersionThumbnail> | TemplateVersionThumbnail
		>(`${TEMPLATE_API}/${templateId}/versions/${versionId}/thumbnail`, {
			signal,
		});

		return unwrapResponse<TemplateVersionThumbnail>(response.data);
	},

	getListing: async (
		templateId: string,
		signal?: AbortSignal,
	): Promise<TemplateListingDto> => {
		const response = await instance.get<
			ApiResponse<TemplateListingDto> | TemplateListingDto
		>(`${TEMPLATE_API}/${templateId}/listing`, { signal });

		return unwrapResponse<TemplateListingDto>(response.data);
	},

	createListing: async (
		templateId: string,
		payload?: CreateTemplateListingPayload,
	): Promise<TemplateListingDto> => {
		const url = `${TEMPLATE_API}/${templateId}/listing`;
		const response = await (payload
			? instance.post<ApiResponse<TemplateListingDto> | TemplateListingDto>(url, payload)
			: instance.post<ApiResponse<TemplateListingDto> | TemplateListingDto>(url));

		return unwrapResponse<TemplateListingDto>(response.data);
	},

	updateListing: async (
		templateId: string,
		payload: UpdateTemplateListingPayload,
	): Promise<TemplateListingDto> => {
		const response = await instance.patch<
			ApiResponse<TemplateListingDto> | TemplateListingDto
		>(`${TEMPLATE_API}/${templateId}/listing`, payload);

		return unwrapResponse<TemplateListingDto>(response.data);
	},

	/**
	 * Creates a PENDING purchase, or returns the buyer's existing purchase for
	 * the same idempotency key (any status) without creating a new one.
	 */
	createPurchase: async (
		templateId: string,
		idempotencyKey: string,
	): Promise<TemplatePurchase> => {
		const response = await instance.post<
			ApiResponse<TemplatePurchase> | TemplatePurchase
		>(`${TEMPLATE_API}/${templateId}/purchases`, undefined, {
			headers: { "Idempotency-Key": idempotencyKey },
		});

		return unwrapResponse<TemplatePurchase>(response.data);
	},

	/** The buyer's own purchase (404 for anyone else). Read-only. */
	getPurchase: async (
		purchaseId: string,
		signal?: AbortSignal,
	): Promise<TemplatePurchase> => {
		const response = await instance.get<
			ApiResponse<TemplatePurchase> | TemplatePurchase
		>(`${TEMPLATE_API}/purchases/${purchaseId}`, { signal });

		return unwrapResponse<TemplatePurchase>(response.data);
	},

	createPurchaseCheckout: async (
		purchaseId: string,
	): Promise<TemplatePurchaseCheckout> => {
		const response = await instance.post<
			ApiResponse<TemplatePurchaseCheckout> | TemplatePurchaseCheckout
		>(`${TEMPLATE_API}/purchases/${purchaseId}/checkout`, {
			provider: "STRIPE",
		});

		return unwrapResponse<TemplatePurchaseCheckout>(response.data);
	},

	/** 403 when the user has no entitlement (not claimed / not purchased). */
	listUsableVersions: async (
		templateId: string,
		signal?: AbortSignal,
	): Promise<UsableTemplateVersionsResponse> => {
		const response = await instance.get<
			ApiResponse<UsableTemplateVersionsResponse> | UsableTemplateVersionsResponse
		>(`${TEMPLATE_API}/${templateId}/usable-versions`, { signal });

		return unwrapResponse<UsableTemplateVersionsResponse>(response.data);
	},

	/** Creator-only dry run of the public demo; nothing is saved. */
	previewDemo: async (
		templateId: string,
		payload: PreviewTemplateDemoPayload,
		signal?: AbortSignal,
	): Promise<TemplatePreview> => {
		const response = await instance.post<
			ApiResponse<TemplatePreview> | TemplatePreview
		>(`${TEMPLATE_API}/${templateId}/listing/demo-preview`, payload, {
			signal,
		});

		return unwrapResponse<TemplatePreview>(response.data);
	},

	listPublicCategories: async (
		signal?: AbortSignal,
	): Promise<TemplateCategory[]> => {
		const response = await publicApiClient.get<
			ApiResponse<TemplateCategory[]> | TemplateCategory[]
		>("/public/template-categories", { signal });

		return unwrapResponse<TemplateCategory[]>(response.data);
	},

	publishListing: async (templateId: string): Promise<TemplateListingDto> => {
		const response = await instance.post<
			ApiResponse<TemplateListingDto> | TemplateListingDto
		>(`${TEMPLATE_API}/${templateId}/listing/publish`);

		return unwrapResponse<TemplateListingDto>(response.data);
	},

	publishToMarketplace: async (
		templateId: string,
		payload: PublishTemplateToMarketplacePayload,
	): Promise<PublishTemplateToMarketplaceResponse> => {
		const response = await instance.post(
			`${TEMPLATE_API}/${templateId}/marketplace/publish`,
			payload,
		);
		return unwrapResponse<PublishTemplateToMarketplaceResponse>(response.data);
	},

	unpublishListing: async (templateId: string): Promise<TemplateListingDto> => {
		const response = await instance.post<
			ApiResponse<TemplateListingDto> | TemplateListingDto
		>(`${TEMPLATE_API}/${templateId}/listing/unPublish`);

		return unwrapResponse<TemplateListingDto>(response.data);
	},

	listPublic: async (
		params: ListPublicTemplatesParams,
		signal?: AbortSignal,
	): Promise<PublicTemplateListResponse> => {
		const response = await publicApiClient.get<
			ApiResponse<PublicTemplateListResponse> | PublicTemplateListResponse
		>(PUBLIC_TEMPLATE_API, {
			params: {
				search: params.search || undefined,
				category: params.category || undefined,
				tag: params.tag || undefined,
				offer_type: params.offer_type || undefined,
				sort: params.sort || undefined,
				creator: params.creator || undefined,
				cursor: params.cursor || undefined,
				limit: params.limit ?? 20,
			},
			signal,
		});

		return unwrapResponse<PublicTemplateListResponse>(response.data);
	},

	getPublicById: async (
		templateId: string,
		signal?: AbortSignal,
	): Promise<PublicTemplateListItem> => {
		const response = await publicApiClient.get<
			ApiResponse<PublicTemplateListItem> | PublicTemplateListItem
		>(`${PUBLIC_TEMPLATE_API}/${templateId}`, { signal });

		return unwrapResponse<PublicTemplateListItem>(response.data);
	},

	getPublicPreview: async (
		templateId: string,
		versionId: string,
		signal?: AbortSignal,
	): Promise<TemplatePreview> => {
		const response = await publicApiClient.get<
			ApiResponse<TemplatePreview> | TemplatePreview
		>(`${PUBLIC_TEMPLATE_API}/${templateId}/versions/${versionId}/preview`, {
			signal,
		});

		return unwrapResponse<TemplatePreview>(response.data);
	},

	recordPublicView: async (templateId: string): Promise<void> => {
		await publicApiClient.post(`${PUBLIC_TEMPLATE_API}/${templateId}/views`);
	},

	getPublicReviews: async (
		templateId: string,
		page: number,
		signal?: AbortSignal,
	): Promise<TemplateReviewsResponse> => {
		const response = await publicApiClient.get<
			ApiResponse<TemplateReviewsResponse> | TemplateReviewsResponse
		>(`${PUBLIC_TEMPLATE_API}/${templateId}/reviews`, {
			params: { page, limit: 10 },
			signal,
		});

		return unwrapResponse<TemplateReviewsResponse>(response.data);
	},

	upsertReview: async (
		templateId: string,
		input: UpsertTemplateReviewInput,
	): Promise<void> => {
		await instance.put(`${TEMPLATE_API}/${templateId}/review`, input);
	},

	deleteReview: async (templateId: string): Promise<void> => {
		await instance.delete(`${TEMPLATE_API}/${templateId}/review`);
	},

	setLike: async (
		templateId: string,
		liked: boolean,
	): Promise<TemplateLikeResponse> => {
		const url = `${TEMPLATE_API}/${templateId}/like`;
		const response = liked
			? await instance.put<ApiResponse<TemplateLikeResponse> | TemplateLikeResponse>(url)
			: await instance.delete<ApiResponse<TemplateLikeResponse> | TemplateLikeResponse>(url);

		return unwrapResponse<TemplateLikeResponse>(response.data);
	},
};
