import { useQuery } from "@tanstack/react-query";

import { pageShareApi } from "../api/page-share.api";

export const pageShareKeys = {
	all: ["page-shares"] as const,

	sharedWithMe: () => [...pageShareKeys.all, "shared-with-me"] as const,

	byPage: (pageId: string) => [...pageShareKeys.all, "page", pageId] as const,
	candidates: (pageId: string) =>
		[...pageShareKeys.all, "candidates", pageId] as const,
	candidate: (pageId: string, query: string) =>
		[...pageShareKeys.candidates(pageId), query] as const,

	setting: (pageId: string) =>
		[...pageShareKeys.all, "setting", pageId] as const,

	access: (pageId: string) =>
		[...pageShareKeys.all, "access", pageId] as const,
};

export function useSharedWithMePages() {
	return useQuery({
		queryKey: pageShareKeys.sharedWithMe(),
		queryFn: pageShareApi.getSharedWithMePages,
	});
}

export function usePageAccess(pageId: string) {
	return useQuery({
		queryKey: pageShareKeys.access(pageId),
		queryFn: () => pageShareApi.getPageAccess(pageId),
		enabled: Boolean(pageId),
	});
}

export function usePageShares(pageId: string, enabled = true) {
	return useQuery({
		queryKey: pageShareKeys.byPage(pageId),
		queryFn: () => pageShareApi.getPageShares(pageId),

		enabled: Boolean(pageId) && enabled,
	});
}

export function usePageShareCandidates(
	pageId: string,
	query: string,
	enabled = true,
) {
	const keyword = query.trim();

	return useQuery({
		queryKey: pageShareKeys.candidate(pageId, keyword),
		queryFn: () => pageShareApi.getPageShareCandidates(pageId, keyword),
		enabled: Boolean(pageId) && enabled && keyword.length >= 2,
	});
}

export function usePageShareSetting(pageId: string, enabled = true) {
	return useQuery({
		queryKey: pageShareKeys.setting(pageId),

		queryFn: () => pageShareApi.getPageShareSetting(pageId),

		enabled: Boolean(pageId) && enabled,
	});
}
