import { useQuery } from "@tanstack/react-query";

import { pagePublicationApi } from "../api/page-publication.api";

export const pagePublicationKeys = {
	all: ["page-publications"] as const,

	detail: (pageId: string) =>
		[...pagePublicationKeys.all, "detail", pageId] as const,
	workspaceSites: (workspaceId: string) =>
		[...pagePublicationKeys.all, "workspace-sites", workspaceId] as const,
	sitePublications: (siteId: string) =>
		[...pagePublicationKeys.all, "site-publications", siteId] as const,
};

export function useWorkspacePublishedSites(workspaceId?: string) {
	return useQuery({
		queryKey: pagePublicationKeys.workspaceSites(workspaceId ?? ""),
		queryFn: ({ signal }) =>
			pagePublicationApi.listWorkspacePublishedSites(workspaceId!, signal),
		enabled: Boolean(workspaceId),
	});
}

export function usePagePublication(pageId?: string) {
	return useQuery({
		queryKey: pagePublicationKeys.detail(pageId ?? ""),

		queryFn: ({ signal }) =>
			pagePublicationApi.getPagePublication(pageId!, signal),

		enabled: Boolean(pageId),
	});
}
