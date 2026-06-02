import instance from "../axios";
import {
	CreatePageBlockPayload,
	DeletePageBlockPayload,
	FindPageBlocksByPageResponse,
	PageBlockItem,
	ReorderPageBlockPayload,
} from "./type";

type ApiEnvelope<T> = {
	statusCode?: number;
	message?: string;
	data: T;
};

type PageBlockMutationResponse =
	| PageBlockItem
	| ApiEnvelope<PageBlockItem>
	| ApiEnvelope<ApiEnvelope<PageBlockItem>>;

type PageBlockListMutationResponse =
	| PageBlockItem[]
	| ApiEnvelope<PageBlockItem[]>
	| ApiEnvelope<ApiEnvelope<PageBlockItem[]>>;

const isPageBlockItem = (value: unknown): value is PageBlockItem => {
	return (
		typeof value === "object" &&
		value !== null &&
		"id" in value &&
		"page_id" in value
	);
};

const unwrapPageBlock = (
	response: PageBlockMutationResponse,
): PageBlockItem => {
	if (isPageBlockItem(response)) {
		return response;
	}

	if ("data" in response && isPageBlockItem(response.data)) {
		return response.data;
	}

	if (
		"data" in response &&
		typeof response.data === "object" &&
		response.data !== null &&
		"data" in response.data &&
		isPageBlockItem(response.data.data)
	) {
		return response.data.data;
	}

	throw new Error("Invalid page block response");
};

const unwrapPageBlocks = (
	response: PageBlockListMutationResponse,
): PageBlockItem[] => {
	if (Array.isArray(response)) {
		return response;
	}

	if ("data" in response && Array.isArray(response.data)) {
		return response.data;
	}

	if (
		"data" in response &&
		typeof response.data === "object" &&
		response.data !== null &&
		"data" in response.data &&
		Array.isArray(response.data.data)
	) {
		return response.data.data;
	}

	throw new Error("Invalid page block list response");
};

export const findPageBlocksByPageApi = async (
	pageId: string,
): Promise<FindPageBlocksByPageResponse> => {
	const response = await instance.get<FindPageBlocksByPageResponse>(
		`/pageBlock/page/${pageId}`,
	);
	return response.data;
};

export const createPageBlockApi = async (
	data: CreatePageBlockPayload,
): Promise<PageBlockItem> => {
	const response = await instance.post<PageBlockMutationResponse>(
		"/pageBlock",
		data,
	);

	return unwrapPageBlock(response.data);
};

export const updatePageBlockApi = async (
	data: PageBlockItem,
): Promise<PageBlockItem> => {
	const response = await instance.patch<PageBlockMutationResponse>(
		`/pageBlock/${data.id}`,
		data,
	);

	return unwrapPageBlock(response.data);
};

export const deletePageBlockApi = async ({
	blockId,
	workspaceId,
}: DeletePageBlockPayload) => {
	await instance.delete(`/pageBlock/${blockId}`, {
		params: {
			workspaceId,
		},
	});
};

export const reorderPageBlocksApi = async (
	data: ReorderPageBlockPayload,
): Promise<PageBlockItem[]> => {
	const response = await instance.patch<PageBlockListMutationResponse>(
		"/pageBlock/reorder",
		data,
	);

	return unwrapPageBlocks(response.data);
};
