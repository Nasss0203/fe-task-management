import { useQuery } from "@tanstack/react-query";

import { pageBlockApi } from "../api/page-block.api";

export const pageBlockKeys = {
	all: ["page-blocks"] as const,

	byPage: (pageId: string) => [...pageBlockKeys.all, "page", pageId] as const,

	sharedByPage: (pageId: string, shareToken: string) =>
		[...pageBlockKeys.all, "shared-page", pageId, shareToken] as const,

	byRow: (rowId: string) => [...pageBlockKeys.all, "row", rowId] as const,

	sharedByRow: (rowId: string, shareToken: string) =>
		[...pageBlockKeys.all, "shared-row", rowId, shareToken] as const,

	detail: (blockId: string) =>
		[...pageBlockKeys.all, "detail", blockId] as const,

	sharedDetail: (blockId: string, shareToken: string) =>
		[...pageBlockKeys.all, "shared-detail", blockId, shareToken] as const,

	answerKeys: (sectionBlockId: string) =>
		[...pageBlockKeys.all, "answer-keys", sectionBlockId] as const,
};

export function useFormAnswerKeys(sectionBlockId: string, enabled: boolean) {
	return useQuery({
		queryKey: pageBlockKeys.answerKeys(sectionBlockId),

		queryFn: ({ signal }) => pageBlockApi.getAnswerKeys(sectionBlockId, signal),

		enabled,

		retry: false,
	});
}

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

/** A task's content; through the share link when `shareToken` is set. */
export function useRowPageBlocks(rowId?: string, shareToken?: string) {
	return useQuery({
		queryKey: shareToken
			? pageBlockKeys.sharedByRow(rowId ?? "", shareToken)
			: pageBlockKeys.byRow(rowId ?? ""),

		queryFn: ({ signal }) => pageBlockApi.getByRow(rowId!, signal, shareToken),

		enabled: Boolean(rowId),
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
