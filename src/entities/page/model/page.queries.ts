import { useQuery } from "@tanstack/react-query";

import { pageApi } from "../api/page.api";

export const pageKeys = {
	all: ["pages"] as const,

	byWorkspace: (workspaceId: string) =>
		["pages", "workspace", workspaceId] as const,

	detail: (pageId: string) => ["pages", "detail", pageId] as const,
};

export function usePagesByWorkspace(workspaceId?: string) {
	return useQuery({
		queryKey: pageKeys.byWorkspace(workspaceId ?? ""),
		queryFn: ({ signal }) => pageApi.getByWorkspace(workspaceId!, signal),
		enabled: Boolean(workspaceId),
	});
}

export function usePage(pageId?: string) {
	return useQuery({
		queryKey: pageKeys.detail(pageId ?? ""),
		queryFn: ({ signal }) => pageApi.getById(pageId!, signal),
		enabled: Boolean(pageId),
	});
}
