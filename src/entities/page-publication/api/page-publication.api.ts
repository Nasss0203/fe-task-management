import type { ApiResponse } from "@/shared/api";
import instance from "@/shared/api/api-client";

import type {
	PagePublicationStatus,
	PagePublication,
	PublicationSettingsPayload,
	PublishSitePayload,
	PublishSiteResponse,
	UnpublishSiteResponse,
} from "../model/page-publication.types";

const PAGE_API = "/page";

export const pagePublicationApi = {
	listPagePublications: async (pageId: string, signal?: AbortSignal): Promise<PagePublication[]> => {
		const response = await instance.get<ApiResponse<PagePublication[]>>(`${PAGE_API}/${pageId}/publications`, { signal });
		return response.data.data;
	},
	updatePublicationSettings: async (pageId: string, siteId: string, payload: PublicationSettingsPayload): Promise<PagePublication> => {
		const response = await instance.patch<ApiResponse<PagePublication>>(`${PAGE_API}/${pageId}/publication/settings`, payload, { params: { site_id: siteId } });
		return response.data.data;
	},
	updatePageVisibility: async (pageId: string, published: boolean): Promise<PagePublication> => {
		const response = await instance.patch<ApiResponse<PagePublication>>(
			`${PAGE_API}/${pageId}/publication/visibility`,
			{ published },
		);
		return response.data.data;
	},

	getPagePublication: async (
		pageId: string,
		signal?: AbortSignal,
	): Promise<PagePublicationStatus> => {
		const response = await instance.get<ApiResponse<PagePublicationStatus>>(
			`${PAGE_API}/${pageId}/publication`,
			{
				signal,
			},
		);

		return response.data.data;
	},

	publishPage: async (
		pageId: string,
		payload: PublishSitePayload,
	): Promise<PublishSiteResponse> => {
		const response = await instance.post<ApiResponse<PublishSiteResponse>>(
			`${PAGE_API}/${pageId}/publication`,
			payload,
		);

		return response.data.data;
	},

	unpublishPage: async (pageId: string, siteId: string): Promise<UnpublishSiteResponse> => {
		const response = await instance.delete<ApiResponse<UnpublishSiteResponse>>(
			`${PAGE_API}/${pageId}/publication`,
			{ params: { site_id: siteId } },
		);

		return response.data.data;
	},

	republishPage: async (pageId: string, siteId: string): Promise<PublishSiteResponse> => {
		const response = await instance.post<ApiResponse<PublishSiteResponse>>(
			`${PAGE_API}/${pageId}/publication/republish`,
			undefined,
			{ params: { site_id: siteId } },
		);

		return response.data.data;
	},
};
