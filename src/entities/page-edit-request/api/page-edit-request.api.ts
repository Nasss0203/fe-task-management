import { ApiResponse } from "@/shared/api";
import instance from "@/shared/api/api-client";
import type { PageEditRequest } from "../model/page-edit-request.types";

export async function createPageEditRequest(
	pageId: string,
): Promise<PageEditRequest> {
	const response = await instance.post<ApiResponse<PageEditRequest>>(
		`/page/${pageId}/edit-requests`,
	);

	return response.data.data;
}
