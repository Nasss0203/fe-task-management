import type { ApiResponse } from "@/shared/api";
import instance from "@/shared/api/api-client";

import type {
	PagePublicationStatus,
	PublishedSiteSummary,
	PublishPageToSitePayload,
	PublishSitePayload,
	PublishSiteResponse,
	UnpublishSiteResponse,
} from "../model/page-publication.types";

const PAGE_API = "/page";

export const pagePublicationApi = {
	listWorkspacePublishedSites: async (
		workspaceId: string,
		signal?: AbortSignal,
	): Promise<PublishedSiteSummary[]> => {
		const response = await instance.get<ApiResponse<PublishedSiteSummary[]>>(
			`/workspaces/${workspaceId}/published-sites`,
			{ signal },
		);
		return response.data.data;
	},

	publishPageToSite: async (
		siteId: string,
		payload: PublishPageToSitePayload,
	): Promise<PublishSiteResponse> => {
		const response = await instance.post<ApiResponse<PublishSiteResponse>>(
			`/published-sites/${siteId}/publications`, payload,
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

	unpublishPage: async (pageId: string): Promise<UnpublishSiteResponse> => {
		const response = await instance.delete<ApiResponse<UnpublishSiteResponse>>(
			`${PAGE_API}/${pageId}/publication`,
		);

		return response.data.data;
	},

	republishPage: async (pageId: string): Promise<PublishSiteResponse> => {
		const response = await instance.post<ApiResponse<PublishSiteResponse>>(
			`${PAGE_API}/${pageId}/publication/republish`,
		);

		return response.data.data;
	},
};
