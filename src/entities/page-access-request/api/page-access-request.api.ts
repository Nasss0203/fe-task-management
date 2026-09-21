import { ApiResponse } from "@/shared/api";
import instance from "@/shared/api/api-client";
import {
	CreatePageAccessRequestPayload,
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
};
