import { ApiResponse } from "@/shared/api";
import instance from "@/shared/api/api-client";

import { PageShareAccessLevel } from "@/entities/page-share/model/page-share.types";
import {
	CreatePageAccessRequestPayload,
	MyPageAccessRequest,
	PageAccessRequest,
} from "../model/page-access-request.types";

const PAGE_ACCESS_REQUEST_API = "/page";

export const pageAccessRequestApi = {
	create: async (
		pageId: string,
		payload: CreatePageAccessRequestPayload,
	): Promise<PageAccessRequest> => {
		const response = await instance.post<ApiResponse<PageAccessRequest>>(
			`${PAGE_ACCESS_REQUEST_API}/${pageId}/access-requests`,
			payload,
		);

		return response.data.data;
	},

	getMine: async (pageId: string): Promise<MyPageAccessRequest | null> => {
		const response = await instance.get<
			ApiResponse<MyPageAccessRequest | null>
		>(`/page/${pageId}/access-requests/me`);

		return response.data.data;
	},

	approve: async (
		requestId: string,
		accessLevel: PageShareAccessLevel,
	): Promise<PageAccessRequest> => {
		const response = await instance.patch<ApiResponse<PageAccessRequest>>(
			`/page-access-requests/${requestId}/approve`,
			{
				access_level: accessLevel,
			},
		);

		return response.data.data;
	},

	reject: async (requestId: string): Promise<PageAccessRequest> => {
		const response = await instance.patch<ApiResponse<PageAccessRequest>>(
			`/page-access-requests/${requestId}/reject`,
		);

		return response.data.data;
	},
};
