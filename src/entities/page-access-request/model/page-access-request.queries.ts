import { useQuery } from "@tanstack/react-query";

import { pageAccessRequestApi } from "../api/page-access-request.api";

export const pageAccessRequestKeys = {
	all: ["page-access-requests"] as const,

	mine: (pageId: string) =>
		[...pageAccessRequestKeys.all, "mine", pageId] as const,
};

export function useMyPageAccessRequest(pageId?: string, enabled = true) {
	return useQuery({
		queryKey: pageAccessRequestKeys.mine(pageId ?? ""),

		queryFn: () => pageAccessRequestApi.getMine(pageId!),

		enabled: Boolean(pageId) && enabled,

		retry: false,
	});
}
