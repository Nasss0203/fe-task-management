import instance from "@/shared/api/api-client";
import type { SharedPage } from "../model/page-share.types";

interface ApiResponse<T> {
	statusCode: number;
	message: string;
	data: T;
}

export async function getSharedWithMePages(): Promise<SharedPage[]> {
	const response = await instance.get<ApiResponse<SharedPage[]>>(
		"/page-shares/shared-with-me",
	);

	return response.data.data;
}
