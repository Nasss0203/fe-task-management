import instance from "@/shared/api/api-client";
import type { ApiResponse } from "@/shared/api";
import type {
	CreateTemplateFromPagePayload,
	ListTemplatesParams,
	PageTemplate,
	TemplateListResponse,
	TemplatePreview,
	TemplateVersion,
	UpdateTemplatePayload,
	UseTemplatePayload,
	UseTemplateResponse,
} from "../model/template.types";

const TEMPLATE_API = "/templates";

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
			ApiResponse<TemplateVersion[]> | TemplateVersion[] | { items: TemplateVersion[] }
		>(`${TEMPLATE_API}/${templateId}/versions`, { signal });

		const unwrapped = unwrapResponse<
			TemplateVersion[] | { items: TemplateVersion[] }
		>(response.data);

		if (unwrapped && typeof unwrapped === "object" && "items" in unwrapped && Array.isArray(unwrapped.items)) {
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
};
