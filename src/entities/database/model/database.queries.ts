import { useQuery } from "@tanstack/react-query";
import { databaseApi } from "../api/database.api";

export const databaseKeys = {
	all: ["databases"] as const,

	detail: (databaseId: string) =>
		["databases", "detail", databaseId] as const,

	views: (databaseId: string) => ["databases", databaseId, "views"] as const,

	viewDetail: (databaseId: string, viewId: string) =>
		["databases", databaseId, "views", viewId] as const,

	rows: (databaseId: string) => ["databases", databaseId, "rows"] as const,
};

export function useDatabase(databaseId?: string) {
	return useQuery({
		queryKey: databaseKeys.detail(databaseId ?? ""),
		queryFn: ({ signal }) => databaseApi.getById(databaseId!, signal),
		enabled: Boolean(databaseId),
	});
}

export function useDatabaseViews(databaseId?: string) {
	return useQuery({
		queryKey: databaseKeys.views(databaseId ?? ""),
		queryFn: ({ signal }) => databaseApi.getViews(databaseId!, signal),
		enabled: Boolean(databaseId),
	});
}

export function useDatabaseView(databaseId?: string, viewId?: string) {
	return useQuery({
		queryKey: databaseKeys.viewDetail(databaseId ?? "", viewId ?? ""),
		queryFn: ({ signal }) =>
			databaseApi.getViewById(databaseId!, viewId!, signal),
		enabled: Boolean(databaseId && viewId),
	});
}

export function useDatabaseRows(databaseId?: string) {
	return useQuery({
		queryKey: databaseKeys.rows(databaseId ?? ""),
		queryFn: ({ signal }) => databaseApi.getRows(databaseId!, signal),
		enabled: Boolean(databaseId),
	});
}
