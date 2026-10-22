import { type Query, useQuery } from "@tanstack/react-query";

import { pageApi } from "../api/page.api";

export const pageKeys = {
	all: ["pages"] as const,

	presets: ["page-presets"] as const,

	byWorkspace: (workspaceId: string) =>
		["pages", "workspace", workspaceId] as const,

	// Nested under byWorkspace so every page-list invalidation refreshes it too.
	databases: (workspaceId: string) =>
		["pages", "workspace", workspaceId, "databases"] as const,

	deletedDatabases: (workspaceId: string) =>
		["pages", "workspace", workspaceId, "databases", "trash"] as const,

	favorites: (workspaceId: string) =>
		["pages", "favorites", workspaceId] as const,

	detail: (pageId: string) => ["pages", "detail", pageId] as const,

	sharedDetail: (pageId: string, shareToken: string) =>
		["pages", "shared-detail", pageId, shareToken] as const,

	trash: (workspaceId: string) => ["pages", "trash", workspaceId] as const,
};

export function usePagesByWorkspace(workspaceId?: string, enabled = true) {
	return useQuery({
		queryKey: pageKeys.byWorkspace(workspaceId ?? ""),

		queryFn: ({ signal }) => pageApi.getByWorkspace(workspaceId!, signal),

		enabled: Boolean(workspaceId) && enabled,
	});
}

export function useWorkspaceDatabases(workspaceId?: string, enabled = true) {
	return useQuery({
		queryKey: pageKeys.databases(workspaceId ?? ""),

		queryFn: ({ signal }) =>
			pageApi.getDatabasesByWorkspace(workspaceId!, signal),

		enabled: Boolean(workspaceId) && enabled,
	});
}

export function useDeletedWorkspaceDatabases(workspaceId?: string) {
	return useQuery({
		queryKey: pageKeys.deletedDatabases(workspaceId ?? ""),

		queryFn: ({ signal }) =>
			pageApi.getDeletedDatabasesByWorkspace(workspaceId!, signal),

		enabled: Boolean(workspaceId),
	});
}

/** Sidebar + Trash database lists of any workspace, for callers that only know a page. */
export function isDatabaseListQuery(query: Query) {
	return query.queryKey[0] === "pages" && query.queryKey[3] === "databases";
}

export function usePageFavorites(workspaceId?: string) {
	return useQuery({
		queryKey: pageKeys.favorites(workspaceId ?? ""),

		queryFn: ({ signal }) => pageApi.getFavorites(workspaceId!, signal),

		enabled: Boolean(workspaceId),
	});
}

export function usePage(pageId?: string, enabled = true) {
	return useQuery({
		queryKey: pageKeys.detail(pageId ?? ""),

		queryFn: ({ signal }) => pageApi.getById(pageId!, signal),

		enabled: Boolean(pageId) && enabled,
	});
}

export function useSharedPage(
	pageId?: string,
	shareToken?: string,
	enabled = true,
) {
	return useQuery({
		queryKey: pageKeys.sharedDetail(pageId ?? "", shareToken ?? ""),

		queryFn: ({ signal }) => pageApi.getById(pageId!, signal, shareToken!),

		enabled: Boolean(pageId) && Boolean(shareToken) && enabled,
	});
}

export function useTrashPages(workspaceId?: string) {
	return useQuery({
		queryKey: pageKeys.trash(workspaceId ?? ""),

		queryFn: ({ signal }) => pageApi.getTrash(workspaceId!, signal),

		enabled: Boolean(workspaceId),
	});
}

export function usePagePresets(enabled = true) {
	return useQuery({
		queryKey: pageKeys.presets,
		queryFn: ({ signal }) => pageApi.getPresets(signal),
		staleTime: Infinity,
		enabled,
	});
}
