import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import apiClient from "@/shared/api/api-client";
import * as api from "@/entities/ai-assistant/api/ai-assistant.api";
import { aiHistoryKeys, useAiConversation } from "@/entities/ai-assistant/model/ai-assistant.queries";
import { canReuseVerifiedAiConversation, getAiConversationVerification, shouldReuseAiConversation } from "@/widgets/ai-chat/model/ai-history-conversations";
import { foundationConversation } from "../unit/ai-foundation.fixtures";
import { conversationId, workspaceId, pageId } from "../unit/ai-ask.fixtures";

afterEach(() => vi.restoreAllMocks());

function setup() {
	const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
	return { client, wrapper };
}

describe("conversation metadata foundation", () => {
	it("GET unwraps metadata and forwards AbortSignal without creating a conversation", async () => {
		const get = vi.spyOn(apiClient, "get").mockResolvedValue({ data: { data: foundationConversation } });
		const post = vi.spyOn(apiClient, "post");
		const signal = new AbortController().signal;
		expect(await api.getAiConversation(conversationId, signal)).toBe(foundationConversation);
		expect(get).toHaveBeenCalledExactlyOnceWith(`/ai-assistant/conversations/${conversationId}`, { signal });
		expect(post).not.toHaveBeenCalled();
	});

	it.each([[undefined, conversationId], ["user-1", null]] as const)("does not fetch without identity: %s/%s", async (userId, id) => {
		const get = vi.spyOn(api, "getAiConversation");
		const { client, wrapper } = setup();
		const { result, unmount } = renderHook(() => useAiConversation(userId, id), { wrapper });
		expect(result.current.fetchStatus).toBe("idle");
		expect(get).not.toHaveBeenCalled();
		unmount(); client.clear();
	});

	it("verifies an id absent from the loaded list without pagination or create", async () => {
		const get = vi.spyOn(api, "getAiConversation").mockResolvedValue(foundationConversation);
		const create = vi.spyOn(api, "createAiConversation");
		const { client, wrapper } = setup();
		client.setQueryData(aiHistoryKeys.conversations("user-1", { workspaceId, scope: "GLOBAL" }),
			{ pages: [{ items: [], nextCursor: "more" }], pageParams: [null] });
		const { result, unmount } = renderHook(() => useAiConversation("user-1", conversationId), { wrapper });
		expect(result.current.isPending).toBe(true);
		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		const verification = getAiConversationVerification("user-1", conversationId, result.current);
		expect(canReuseVerifiedAiConversation(verification, { userId: "user-1", workspaceId }, "WRITING")).toBe(true);
		expect(canReuseVerifiedAiConversation(verification, { userId: "user-1", workspaceId }, "CREATE_PAGE")).toBe(true);
		expect(canReuseVerifiedAiConversation(verification, { userId: "user-1", workspaceId }, "MODIFY_PAGE", pageId)).toBe(false);
		expect(get).toHaveBeenCalledTimes(1);
		expect(create).not.toHaveBeenCalled();
		expect(aiHistoryKeys.conversation("user-1", conversationId)).not.toEqual(aiHistoryKeys.conversation("user-2", conversationId));
		unmount(); client.clear();
	});

	it.each([401, 403, 404])("propagates detail HTTP %s without create fallback", async (status) => {
		const error = Object.assign(new Error("detail rejected"), { response: { status } });
		vi.spyOn(api, "getAiConversation").mockRejectedValue(error);
		const create = vi.spyOn(api, "createAiConversation");
		const { client, wrapper } = setup();
		const { result, unmount } = renderHook(() => useAiConversation("user-1", conversationId), { wrapper });
		await waitFor(() => expect(result.current.isError).toBe(true));
		expect(result.current.error).toBe(error);
		expect(getAiConversationVerification("user-1", conversationId, result.current)).toEqual({ status: "error", error });
		expect(create).not.toHaveBeenCalled();
		unmount(); client.clear();
	});

	it.each([
		[foundationConversation, "GLOBAL", undefined, true],
		[{ ...foundationConversation, scope: "PAGE", page_id: pageId }, "PAGE", pageId, true],
		[{ ...foundationConversation, status: "ARCHIVED" }, "GLOBAL", undefined, false],
		[{ ...foundationConversation, scope: "LEGACY" }, "GLOBAL", undefined, false],
		[{ ...foundationConversation, workspace_id: "other" }, "GLOBAL", undefined, false],
		[{ ...foundationConversation, scope: "PAGE", page_id: "other" }, "PAGE", pageId, false],
		[undefined, "GLOBAL", undefined, false],
	] as const)("strict scope policy %#", (conversation, scope, page, expected) => {
		expect(shouldReuseAiConversation(conversation, workspaceId, scope, page)).toBe(expected);
	});

	it("keeps unknown metadata pending and rejects user/current-page/scope mismatches", () => {
		const pending = getAiConversationVerification("user-1", conversationId, { isSuccess: false, isError: false });
		expect(pending).toEqual({ status: "pending" });
		expect(canReuseVerifiedAiConversation(pending, { userId: "user-1", workspaceId }, "WRITING")).toBe(false);
		const verified = getAiConversationVerification("user-1", conversationId,
			{ isSuccess: true, isError: false, data: { ...foundationConversation, scope: "PAGE", page_id: pageId } });
		expect(canReuseVerifiedAiConversation(verified, { userId: "user-1", workspaceId, currentPageId: pageId }, "WRITING")).toBe(true);
		expect(canReuseVerifiedAiConversation(verified, { userId: "user-1", workspaceId }, "WRITING")).toBe(false);
		expect(canReuseVerifiedAiConversation(verified, { userId: "user-2", workspaceId }, "MODIFY_PAGE", pageId)).toBe(false);
		expect(canReuseVerifiedAiConversation(verified, { userId: "user-1", workspaceId, currentPageId: "other" }, "MODIFY_PAGE", pageId)).toBe(false);
		expect(canReuseVerifiedAiConversation(verified, { userId: "user-1", workspaceId }, "MODIFY_PAGE", pageId)).toBe(true);
		expect(canReuseVerifiedAiConversation(verified, { userId: "user-1", workspaceId }, "CREATE_PAGE")).toBe(false);
		expect(getAiConversationVerification("user-1", "other", { isSuccess: true, isError: false, data: foundationConversation }).status).toBe("error");
	});
});
