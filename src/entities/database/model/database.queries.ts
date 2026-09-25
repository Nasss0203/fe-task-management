import { useQuery } from "@tanstack/react-query";

import { databaseApi } from "../api/database.api";

export const databaseKeys = {
	all: ["databases"] as const,

	detail: (databaseId: string) =>
		["databases", "detail", databaseId] as const,

	sharedDetail: (databaseId: string, shareToken: string) =>
		["databases", "shared-detail", databaseId, shareToken] as const,

	views: (databaseId: string) => ["databases", databaseId, "views"] as const,

	sharedViews: (databaseId: string, shareToken: string) =>
		["databases", databaseId, "shared-views", shareToken] as const,

	viewDetail: (databaseId: string, viewId: string) =>
		["databases", databaseId, "views", viewId] as const,

	sharedViewDetail: (
		databaseId: string,
		viewId: string,
		shareToken: string,
	) => ["databases", databaseId, "shared-views", viewId, shareToken] as const,

	rows: (databaseId: string) => ["databases", databaseId, "rows"] as const,

	sharedRows: (databaseId: string, shareToken: string) =>
		["databases", databaseId, "shared-rows", shareToken] as const,
};

export function useDatabase(databaseId?: string, enabled = true) {
	return useQuery({
		queryKey: databaseKeys.detail(databaseId ?? ""),

		queryFn: ({ signal }) => databaseApi.getById(databaseId!, signal),

		enabled: Boolean(databaseId) && enabled,
	});
}

export function useSharedDatabase(
	databaseId?: string,
	shareToken?: string,
	enabled = true,
) {
	return useQuery({
		queryKey: databaseKeys.sharedDetail(databaseId ?? "", shareToken ?? ""),

		queryFn: ({ signal }) =>
			databaseApi.getById(databaseId!, signal, shareToken!),

		enabled: Boolean(databaseId) && Boolean(shareToken) && enabled,
	});
}

export function useDatabaseViews(databaseId?: string, enabled = true) {
	return useQuery({
		queryKey: databaseKeys.views(databaseId ?? ""),

		queryFn: ({ signal }) => databaseApi.getViews(databaseId!, signal),

		enabled: Boolean(databaseId) && enabled,
	});
}

export function useSharedDatabaseViews(
	databaseId?: string,
	shareToken?: string,
	enabled = true,
) {
	return useQuery({
		queryKey: databaseKeys.sharedViews(databaseId ?? "", shareToken ?? ""),

		queryFn: ({ signal }) =>
			databaseApi.getViews(databaseId!, signal, shareToken!),

		enabled: Boolean(databaseId) && Boolean(shareToken) && enabled,
	});
}

export function useDatabaseView(
	databaseId?: string,
	viewId?: string,
	enabled = true,
) {
	return useQuery({
		queryKey: databaseKeys.viewDetail(databaseId ?? "", viewId ?? ""),

		queryFn: ({ signal }) =>
			databaseApi.getViewById(databaseId!, viewId!, signal),

		enabled: Boolean(databaseId) && Boolean(viewId) && enabled,
	});
}

export function useSharedDatabaseView(
	databaseId?: string,
	viewId?: string,
	shareToken?: string,
	enabled = true,
) {
	return useQuery({
		queryKey: databaseKeys.sharedViewDetail(
			databaseId ?? "",
			viewId ?? "",
			shareToken ?? "",
		),

		queryFn: ({ signal }) =>
			databaseApi.getViewById(databaseId!, viewId!, signal, shareToken!),

		enabled:
			Boolean(databaseId) &&
			Boolean(viewId) &&
			Boolean(shareToken) &&
			enabled,
	});
}

export function useDatabaseRows(databaseId?: string, enabled = true) {
	return useQuery({
		queryKey: databaseKeys.rows(databaseId ?? ""),

		queryFn: ({ signal }) => databaseApi.getRows(databaseId!, signal),

		enabled: Boolean(databaseId) && enabled,
	});
}

export function useSharedDatabaseRows(
	databaseId?: string,
	shareToken?: string,
	enabled = true,
) {
	return useQuery({
		queryKey: databaseKeys.sharedRows(databaseId ?? "", shareToken ?? ""),

		queryFn: ({ signal }) =>
			databaseApi.getRows(databaseId!, signal, shareToken!),

		enabled: Boolean(databaseId) && Boolean(shareToken) && enabled,
	});
}
