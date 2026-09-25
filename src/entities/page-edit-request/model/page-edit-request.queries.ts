import { useQuery } from "@tanstack/react-query";

import instance from "@/shared/api/api-client";
import type { PageEditRequest } from "./page-edit-request.types";

interface ApiResponse<T> {
	statusCode: number;
	message: string;
	data: T;
}

async function getMyPageEditRequests(): Promise<PageEditRequest[]> {
	const response = await instance.get<ApiResponse<PageEditRequest[]>>(
		"/page-edit-requests/mine",
	);

	return response.data.data;
}

export const pageEditRequestKeys = {
	all: ["page-edit-requests"] as const,

	mine: () => [...pageEditRequestKeys.all, "mine"] as const,
};

export function useMyPageEditRequests(enabled = true) {
	return useQuery({
		queryKey: pageEditRequestKeys.mine(),
		queryFn: getMyPageEditRequests,
		enabled,
		staleTime: 60_000,
	});
}
