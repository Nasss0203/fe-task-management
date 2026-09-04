import { useQuery } from "@tanstack/react-query";

import { pageApi } from "../api/page.api";

export const pageKeys = {
	all: ["pages"] as const,

	byWorkspace: (workspaceId: string) =>
		["pages", "workspace", workspaceId] as const,

	favorites: (workspaceId: string) =>
		["pages", "favorites", workspaceId] as const,

	detail: (pageId: string) => ["pages", "detail", pageId] as const,

	trash: (workspaceId: string) => ["pages", "trash", workspaceId] as const,
};

export function usePagesByWorkspace(workspaceId?: string) {
	return useQuery({
		queryKey: pageKeys.byWorkspace(workspaceId ?? ""),

		queryFn: ({ signal }) => pageApi.getByWorkspace(workspaceId!, signal),

		enabled: Boolean(workspaceId),
	});
}

export function usePageFavorites(workspaceId?: string) {
	return useQuery({
		queryKey: pageKeys.favorites(workspaceId ?? ""),

		queryFn: ({ signal }) => pageApi.getFavorites(workspaceId!, signal),

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

export function useTrashPages(workspaceId?: string) {
	return useQuery({
		queryKey: pageKeys.trash(workspaceId ?? ""),

		queryFn: ({ signal }) => pageApi.getTrash(workspaceId!, signal),

		enabled: Boolean(workspaceId),
	});
}
