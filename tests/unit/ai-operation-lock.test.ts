import { beforeEach, describe, expect, it } from "vitest";
import { getAiChatScope, useAiChatStore } from "@/widgets/ai-chat/model/use-ai-chat-store";
import type { AiOperationInput } from "@/widgets/ai-chat/model/types";
import { workspaceId, pageId, conversationId } from "./ai-ask.fixtures";
import { foundationGeneration, localMessage, serverMessage } from "./ai-foundation.fixtures";

const store = () => useAiChatStore.getState();
const scope = getAiChatScope(undefined, workspaceId, "user-1");
function input(type: "ask" | "confirm" | "discard" = "ask", context: Partial<AiOperationInput> = {}): AiOperationInput {
	const binding = { userId: "user-1", workspaceId, pageId: null, chatScope: scope, epoch: store().threads[scope]?.epoch ?? 0 };
	return { ...binding, ...(type === "ask" ? { type, requestId: "request-1" } : { type, generationId: "generation-1" }), ...context } as AiOperationInput;
}

beforeEach(() => useAiChatStore.setState({ threads: {} }));

describe("shared operation lock foundation", () => {
	it.each([["ask", "ask"], ["ask", "confirm"], ["confirm", "ask"], ["confirm", "discard"], ["discard", "confirm"]] as const)("rejects overlapping %s/%s acquisitions", (first, second) => {
		expect(store().acquireOperation(input(first))).not.toBeNull();
		expect(store().acquireOperation(input(second))).toBeNull();
	});

	it("rejects mismatched scope identities and stale epochs", () => {
		expect(store().acquireOperation(input("ask", { userId: "other" }))).toBeNull();
		expect(store().acquireOperation(input("ask", { workspaceId: "other" }))).toBeNull();
		expect(store().acquireOperation(input("ask", { pageId }))).toBeNull();
		expect(store().acquireOperation(input("ask", { epoch: 99 }))).toBeNull();
	});

	it("wrong token cannot release or unlock another operation", () => {
		const token = store().acquireOperation(input())!;
		store().releaseOperation({ ...token, operationId: "wrong" });
		store().releaseOperation({ ...token, userId: "wrong" });
		if (token.type === "ask") store().releaseOperation({ ...token, requestId: "wrong" });
		expect(store().isOperationActive(token)).toBe(true);
		store().releaseOperation(token);
		expect(store().threads[scope].activeRequestId).toBeNull();
		const newer = store().acquireOperation(input())!;
		store().releaseOperation(token);
		expect(store().isOperationActive(newer)).toBe(true);
	});

	it("does not silently reset a running operation through New Chat/switch/clear", () => {
		store().setConversation(scope, conversationId, workspaceId);
		const token = store().acquireOperation(input())!;
		store().newChat(scope); store().clearConversation(scope); store().setConversation(scope, "other", workspaceId);
		expect(store().isOperationActive(token)).toBe(true);
		expect(store().threads[scope].conversationId).toBe(conversationId);
		store().releaseOperation(token);
		store().newChat(scope);
		expect(store().threads[scope]).toMatchObject({ messages: [], epoch: 1, operation: null, conversationId: null });
		expect(store().acquireOperation({ ...input(), epoch: 0 })).toBeNull();
	});

	it("coordinates with legacy begin/finish guards without a second conflicting lock", () => {
		store().beginRequest(scope, "legacy-request", "writing");
		expect(store().acquireOperation(input())).toBeNull();
		store().finishRequest(scope, "legacy-request");
		const token = store().acquireOperation(input())!;
		expect(store().beginRequest(scope, "legacy-request", "writing")).toBe(false);
		store().finishRequest(scope, "request-1");
		expect(store().isOperationActive(token)).toBe(true);
	});

	it("isolates user/workspace/Page scopes and permits independent operations", () => {
		const contexts = [{ userId: "user-2", workspaceId, pageId: null }, { userId: "user-1", workspaceId: "other", pageId: null },
			{ userId: "user-1", workspaceId, pageId }];
		const first = store().acquireOperation(input())!;
		for (const context of contexts) {
			const chatScope = getAiChatScope(context.pageId ?? undefined, context.workspaceId, context.userId);
			expect(store().acquireOperation({ ...input(), ...context, chatScope })).not.toBeNull();
		}
		expect(store().isOperationActive(first)).toBe(true);
		expect(getAiChatScope(pageId, workspaceId, "user-1")).not.toBe(getAiChatScope(pageId, "other", "user-1"));
	});

	it("releases after failure in finally without leaking a lock", async () => {
		const token = store().acquireOperation(input())!;
		await expect((async () => {
			try { throw new Error("synthetic failure"); } finally { store().releaseOperation(token); }
		})()).rejects.toThrow("synthetic failure");
		expect(store().acquireOperation(input())).not.toBeNull();
	});

	it("auth cleanup invalidates old tokens and local feedback without touching another user", () => {
		const token = store().acquireOperation(input())!;
		store().addMessage(scope, localMessage("user-1-message", "user"), "request-1");
		const otherScope = getAiChatScope(undefined, workspaceId, "user-2");
		store().addMessage(otherScope, localMessage("user-2-message", "user"));
		store().purgeUserThreads("user-1");
		expect(store().threads[scope].messages).toEqual([]);
		expect(store().threads[otherScope].messages).toHaveLength(1);
		const newer = store().acquireOperation(input())!;
		store().releaseOperation(token);
		expect(store().isOperationActive(newer)).toBe(true);
		expect(store().addOperationMessage(token, localMessage("stale", "assistant"))).toBe(false);
		expect(store().addOperationMessage(newer, localMessage("current", "assistant"))).toBe(true);
		expect(store().threads[scope].messages.map((message) => message.id)).toEqual(["current"]);
		expect(store().threads[scope].messages[0].origin?.binding?.epoch).toBe(newer.epoch);
		expect(Object.isFrozen(newer)).toBe(true);
	});

	it("New Chat clears local state and stale hydration cannot resurrect the old thread", () => {
		store().setConversation(scope, conversationId, workspaceId);
		store().addMessage(scope, localMessage("feedback", "assistant"));
		const epoch = store().threads[scope].epoch;
		store().newChat(scope);
		store().hydrateHistory(scope, conversationId, workspaceId, [serverMessage("saved", "USER")], [], epoch);
		expect(store().threads[scope].messages).toEqual([]);
	});

	it("does not accept foreign Generation data or a foreign binding through a valid token", () => {
		const token = store().acquireOperation(input())!;
		expect(store().addOperationMessage(token, localMessage("foreign-generation", "assistant", "request-1", {
			generation: { ...foundationGeneration, workspace_id: "foreign" },
		}))).toBe(false);
		expect(store().addOperationMessage(token, localMessage("foreign-binding", "user", "request-1", {
			origin: { source: "optimistic", localId: "foreign-binding", conversationId, binding: { ...token, userId: "foreign" } },
		}))).toBe(false);
		expect(store().threads[scope].messages).toEqual([]);
	});

	it("conversation switch clears prior feedback and rejects old history", () => {
		store().setConversation(scope, conversationId, workspaceId);
		store().addMessage(scope, localMessage("feedback", "assistant"));
		store().setConversation(scope, "other", workspaceId);
		store().hydrateHistory(scope, conversationId, workspaceId, [serverMessage("saved", "USER")], [foundationGeneration], 0);
		expect(store().threads[scope]).toMatchObject({ messages: [], conversationId: "other", epoch: 1 });
	});
});

describe("chat nhiều lượt: moving the current turn to the conversation the server opened", () => {
	function seed() {
		store().setConversation(scope, conversationId, workspaceId);
		const token = store().acquireOperation(input())!;
		store().setMessages(scope, [
			// An earlier turn and a persisted message stay in the previous conversation.
			localMessage("old-user", "user", "request-0", { origin: { source: "optimistic", localId: "old-user", conversationId, turnId: "turn-0" } }),
			localMessage("saved", "assistant", "request-0", { origin: { source: "persisted", serverMessageId: "saved", conversationId } }),
			localMessage("user", "user"),
			localMessage("selection", "assistant"),
		]);
		return token;
	}

	it("keeps only the current turn, moved to the new conversation", () => {
		const token = seed();
		expect(store().switchOperationConversation(token, "new-conversation", "turn-1")).toBe(true);
		const thread = store().threads[scope];
		expect(thread.conversationId).toBe("new-conversation");
		expect(thread.messages.map((message) => message.id)).toEqual(["user", "selection"]);
		expect(thread.messages.every((message) => message.origin?.conversationId === "new-conversation")).toBe(true);
	});

	it("refuses a stale token, the same conversation or a denied conversation", () => {
		const token = seed();
		expect(store().switchOperationConversation({ ...token, operationId: "other" }, "new-conversation", "turn-1")).toBe(false);
		expect(store().switchOperationConversation(token, conversationId, "turn-1")).toBe(false);
		store().denyAccess({ userId: "user-1", workspaceId, conversationId: "new-conversation", pageId: null });
		expect(store().switchOperationConversation(token, "new-conversation", "turn-1")).toBe(false);
		expect(store().threads[scope].conversationId).toBe(conversationId);
	});
});
