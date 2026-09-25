import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { pageBlockApi } from "@/entities/page-block/api/page-block.api";
import {
	useCreatePageBlock,
	useDeletePageBlock,
	useUpdatePageBlock,
} from "@/entities/page-block/model/page-block.mutations";
import { pageBlockKeys } from "@/entities/page-block/model/page-block.queries";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import { makePageBlock } from "../utils/page-block-fixture";
import { createWrapper } from "../utils/test-utils";

const http = vi.hoisted(() => ({ post: vi.fn(), patch: vi.fn(), delete: vi.fn() }));
const toastError = vi.hoisted(() => vi.fn());
vi.mock("@/shared/api/api-client", () => ({ default: http }));
vi.mock("sonner", () => ({ toast: { error: toastError } }));

const block = makePageBlock();
const pageId = block.page_id;
const tokenA = "token-A";
const tokenB = "token-B";
const operations = ["create", "update", "delete"] as const;

function useWrites(token?: string) {
	return {
		create: useCreatePageBlock(token),
		update: useUpdatePageBlock(token),
		delete: useDeletePageBlock(token),
	};
}

function write(writes: ReturnType<typeof useWrites>, operation: typeof operations[number]) {
	if (operation === "create") {
		return writes.create.mutateAsync({ pageId, type: PageBlockType.TEXT, content: { text: "New" } });
	}
	if (operation === "update") {
		return writes.update.mutateAsync({ pageId, blockId: block.id, content: { text: "Edited" } });
	}
	return writes.delete.mutateAsync({ pageId, blockId: block.id });
}

beforeEach(() => {
	vi.resetAllMocks();
	http.post.mockResolvedValue({ data: { data: block } });
	http.patch.mockResolvedValue({ data: { data: block } });
	http.delete.mockResolvedValue(undefined);
});

describe.each([tokenA, undefined])("PageBlock writes (token: %s)", (token) => {
	it.each(operations)("%s sends only its own token and invalidates only its list cache", async (operation) => {
		const { wrapper, queryClient } = createWrapper();
		const keys = [
			pageBlockKeys.byPage(pageId),
			pageBlockKeys.sharedByPage(pageId, tokenA),
			pageBlockKeys.sharedByPage(pageId, tokenB),
			pageBlockKeys.sharedByPage("another-page", tokenA),
		];
		for (const key of keys) queryClient.setQueryData(key, [block]);
		const { result } = renderHook(() => useWrites(token), { wrapper });
		await act(async () => { await write(result.current, operation); });

		const config = { headers: token ? { "X-Page-Share-Token": token } : undefined };
		if (operation === "create") {
			expect(http.post).toHaveBeenCalledWith("/pageBlock", expect.objectContaining({ page_id: pageId }), config);
		} else if (operation === "update") {
			expect(http.patch).toHaveBeenCalledWith("/pageBlock/block-1", expect.objectContaining({ content: { text: "Edited" } }), config);
		} else {
			expect(http.delete).toHaveBeenCalledWith("/pageBlock/block-1", config);
		}
		for (const [index, key] of keys.entries()) {
			expect(queryClient.getQueryState(key)?.isInvalidated).toBe(index === (token ? 1 : 0));
		}
		expect(toastError).not.toHaveBeenCalled();
	});
});

it.each([tokenA, undefined])("attachDatabaseView accepts optional request-scoped token %s", async (token) => {
	await pageBlockApi.attachDatabaseView(block.id, { database_id: "db-1", view_id: "view-1" }, token);
	expect(http.post).toHaveBeenCalledWith(
		"/pageBlock/block-1/database-views",
		{ database_id: "db-1", view_id: "view-1" },
		{ headers: token ? { "X-Page-Share-Token": token } : undefined },
	);
});

it("does not leak headers across shared A, shared B and normal requests", async () => {
	await pageBlockApi.update(block.id, {}, tokenA);
	await pageBlockApi.update(block.id, {}, tokenB);
	await pageBlockApi.update(block.id, {});
	expect(http.patch.mock.calls.map((call) => call[2]?.headers?.["X-Page-Share-Token"])).toEqual([tokenA, tokenB, undefined]);
});

it.each(operations)("keeps an in-flight %s bound to token A after the hook switches to B", async (operation) => {
	let finish!: () => void;
	const pending = new Promise<{ data: { data: typeof block } }>((resolve) => {
		finish = () => resolve({ data: { data: block } });
	});
	const method = operation === "create" ? http.post : operation === "update" ? http.patch : http.delete;
	method.mockReturnValueOnce(pending);
	const { wrapper, queryClient } = createWrapper();
	const keyA = pageBlockKeys.sharedByPage(pageId, tokenA);
	const keyB = pageBlockKeys.sharedByPage(pageId, tokenB);
	queryClient.setQueryData(keyA, [block]);
	queryClient.setQueryData(keyB, [block]);
	const { result, rerender } = renderHook(({ token }) => useWrites(token), {
		wrapper,
		initialProps: { token: tokenA },
	});
	let saved!: Promise<unknown>;
	act(() => { saved = write(result.current, operation); });
	await waitFor(() => expect(method).toHaveBeenCalledOnce());
	rerender({ token: tokenB });
	await act(async () => { finish(); await saved; });
	expect(queryClient.getQueryState(keyA)?.isInvalidated).toBe(true);
	expect(queryClient.getQueryState(keyB)?.isInvalidated).toBe(false);
});

describe.each(operations)("%s failure", (operation) => {
	it.each([
		[401, "UNAUTHORIZED"],
		[403, "FORBIDDEN"],
		[403, "PAGE_SHARE_LINK_INVALID"],
		[403, "PAGE_SHARE_LINK_REVOKED"],
		[403, "PAGE_SHARE_LINK_EXPIRED"],
	])("preserves rejection %s / %s without success invalidation", async (status, code) => {
		const failure = { response: { status, data: { code, message: "Access denied" } } };
		const method = operation === "create" ? http.post : operation === "update" ? http.patch : http.delete;
		method.mockRejectedValueOnce(failure);
		const { wrapper, queryClient } = createWrapper();
		const key = pageBlockKeys.sharedByPage(pageId, tokenA);
		queryClient.setQueryData(key, [block]);
		const { result } = renderHook(() => useWrites(tokenA), { wrapper });
		await act(async () => { await expect(write(result.current, operation)).rejects.toBe(failure); });
		await waitFor(() => expect(result.current[operation].error).toBe(failure));
		expect(queryClient.getQueryState(key)?.isInvalidated).toBe(false);
		expect(toastError).toHaveBeenCalledOnce();
	});
});
