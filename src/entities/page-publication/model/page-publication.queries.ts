import { useQuery } from "@tanstack/react-query";

import { pagePublicationApi } from "../api/page-publication.api";

export const pagePublicationKeys = {
	all: ["page-publications"] as const,

	detail: (pageId: string) =>
		[...pagePublicationKeys.all, "detail", pageId] as const,
	list: (pageId: string) =>
		[...pagePublicationKeys.all, "list", pageId] as const,
};

export function usePagePublication(pageId?: string) {
	return useQuery({
		queryKey: pagePublicationKeys.detail(pageId ?? ""),

		queryFn: ({ signal }) =>
			pagePublicationApi.getPagePublication(pageId!, signal),

		enabled: Boolean(pageId),
	});
}

export function usePagePublications(pageId?: string) {
	return useQuery({
		queryKey: pagePublicationKeys.list(pageId ?? ""),
		queryFn: ({ signal }) => pagePublicationApi.listPagePublications(pageId!, signal),
		enabled: Boolean(pageId),
	});
}
