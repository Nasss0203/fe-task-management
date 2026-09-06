import { useQuery } from "@tanstack/react-query";

import { getSharedWithMePages } from "../api/page-share.api";

export const pageShareKeys = {
	all: ["page-shares"] as const,

	sharedWithMe: () => [...pageShareKeys.all, "shared-with-me"] as const,
};

export function useSharedWithMePages() {
	return useQuery({
		queryKey: pageShareKeys.sharedWithMe(),

		queryFn: getSharedWithMePages,
	});
}
