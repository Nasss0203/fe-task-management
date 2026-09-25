import { useQuery } from "@tanstack/react-query";

import { pageBlockApi } from "../api/page-block.api";

export const pageBlockKeys = {
	all: ["page-blocks"] as const,

	byPage: (pageId: string) => [...pageBlockKeys.all, "page", pageId] as const,

	sharedByPage: (pageId: string, shareToken: string) =>
		[...pageBlockKeys.all, "shared-page", pageId, shareToken] as const,

	detail: (blockId: string) =>
		[...pageBlockKeys.all, "detail", blockId] as const,

	sharedDetail: (blockId: string, shareToken: string) =>
		[...pageBlockKeys.all, "shared-detail", blockId, shareToken] as const,
};

export function usePageBlocks(pageId?: string, enabled = true) {
	return useQuery({
		queryKey: pageBlockKeys.byPage(pageId ?? ""),

		queryFn: ({ signal }) => pageBlockApi.getByPage(pageId!, signal),

		enabled: Boolean(pageId) && enabled,
	});
}

export function useSharedPageBlocks(
	pageId?: string,
	shareToken?: string,
	enabled = true,
) {
	return useQuery({
		queryKey: pageBlockKeys.sharedByPage(pageId ?? "", shareToken ?? ""),

		queryFn: ({ signal }) =>
			pageBlockApi.getByPage(pageId!, signal, shareToken!),

		enabled: Boolean(pageId) && Boolean(shareToken) && enabled,
	});
}

export function usePageBlock(blockId?: string, enabled = true) {
	return useQuery({
		queryKey: pageBlockKeys.detail(blockId ?? ""),

		queryFn: ({ signal }) => pageBlockApi.getById(blockId!, signal),

		enabled: Boolean(blockId) && enabled,
	});
}

export function useSharedPageBlock(
	blockId?: string,
	shareToken?: string,
	enabled = true,
) {
	return useQuery({
		queryKey: pageBlockKeys.sharedDetail(blockId ?? "", shareToken ?? ""),

		queryFn: ({ signal }) =>
			pageBlockApi.getById(blockId!, signal, shareToken!),

		enabled: Boolean(blockId) && Boolean(shareToken) && enabled,
	});
}
