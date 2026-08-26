import { useQuery } from "@tanstack/react-query";

import { pageBlockApi } from "../api/page-block.api";

export const pageBlockKeys = {
	all: ["page-blocks"] as const,

	byPage: (pageId: string) => ["page-blocks", "page", pageId] as const,

	detail: (blockId: string) => ["page-blocks", "detail", blockId] as const,
};

export function usePageBlocks(pageId?: string) {
	return useQuery({
		queryKey: pageBlockKeys.byPage(pageId ?? ""),
		queryFn: ({ signal }) => pageBlockApi.getByPage(pageId!, signal),
		enabled: Boolean(pageId),
	});
}

export function usePageBlock(blockId?: string) {
	return useQuery({
		queryKey: pageBlockKeys.detail(blockId ?? ""),
		queryFn: ({ signal }) => pageBlockApi.getById(blockId!, signal),
		enabled: Boolean(blockId),
	});
}
