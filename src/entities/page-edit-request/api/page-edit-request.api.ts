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

export async function reviewPageEditRequest(
	requestId: string,
	decision: "approve" | "reject",
): Promise<PageEditRequest> {
	const response = await instance.patch<ApiResponse<PageEditRequest>>(
		`/page-edit-requests/${requestId}/${decision}`,
	);

	return response.data.data;
}
