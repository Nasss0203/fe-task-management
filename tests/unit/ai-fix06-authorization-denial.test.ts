import { QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { beforeEach, describe, expect, it } from "vitest";
import { isAiAuthorizationDenial } from "@/widgets/ai-chat/model/ai-chat-error";
import { handleAiAuthorizationDenial } from "@/widgets/ai-chat/model/ai-authorization-denial";
import { getAiChatScope, isAiAccessDenied, useAiChatStore } from "@/widgets/ai-chat/model/use-ai-chat-store";
import { aiHistoryKeys } from "@/entities/ai-assistant/model/ai-assistant.queries";
import { foundationConversation, foundationGeneration, localMessage, serverMessage } from "./ai-foundation.fixtures";
import { askResponses, conversationId, generationId, pageId, workspaceId } from "./ai-ask.fixtures";

const store = () => useAiChatStore.getState();
const context = { userId: "user-1", workspaceId, conversationId, pageId: null };
const scope = getAiChatScope(undefined, workspaceId, "user-1");
const http = (status: number) => new AxiosError("secret", "ERR_BAD_RESPONSE", undefined, undefined, { status } as never);
beforeEach(() => useAiChatStore.setState(useAiChatStore.getInitialState(), true));

describe("FIX06 resource denial classification and atomic transition", () => {
  it.each([403, 404])("classifies HTTP %s by Axios status", (status) => expect(isAiAuthorizationDenial(http(status))).toBe(true));
  it.each([400, 401, 409, 429, 500, 502])("does not classify HTTP %s as resource denial", (status) => expect(isAiAuthorizationDenial(http(status))).toBe(false));
  it.each([null, undefined, "Forbidden", new Error("Not Found"), { response: { status: 403 } }, new AxiosError("timeout", "ECONNABORTED")])(
    "does not infer authorization from text, arbitrary objects or network errors: %#", (error) => expect(isAiAuthorizationDenial(error)).toBe(false),
  );

  it("invalidates an active token atomically, rejecting late writes, release and hydration", () => {
    store().setConversation(scope, conversationId, workspaceId);
    const token = store().acquireOperation({ ...context, pageId: null, chatScope: scope, epoch: 0, type: "ask", requestId: "request-1" })!;
    store().addOperationMessage(token, localMessage("protected", "assistant", "request-1", { generation: foundationGeneration }));
    expect(store().newChat(scope)).toBe(false);
    store().denyAccess(context);
    expect(store().threads[scope]).toMatchObject({ messages: [], epoch: 1, operation: null, activeRequestId: null, pendingSubmission: null });
    expect(store().isOperationActive(token)).toBe(false);
    expect(store().addOperationMessage(token, localMessage("late", "assistant"))).toBe(false);
    store().releaseOperation(token);
    store().hydrateHistory(scope, conversationId, workspaceId, [serverMessage("late", "ASSISTANT", { generationId })], [foundationGeneration], 0);
    // Even a caller supplying the new epoch cannot bypass the resource barrier.
    store().hydrateHistory(scope, conversationId, workspaceId, [serverMessage("late", "ASSISTANT", { generationId })], [foundationGeneration], 1);
    store().setMessages(scope, [localMessage("cached", "assistant", "request-1", { generation: foundationGeneration })]);
    expect(store().threads[scope].messages).toEqual([]);
  });

  it("preserves independent operations across users/workspaces/Pages and another generation", () => {
    const cases = [{ userId: "user-2", workspaceId, pageId: null }, { userId: "user-1", workspaceId: "workspace-b", pageId: null },
      { userId: "user-1", workspaceId, pageId }, { userId: "user-1", workspaceId, pageId: "page-b" }];
    const tokens = cases.map((binding) => {
      const chatScope = getAiChatScope(binding.pageId ?? undefined, binding.workspaceId, binding.userId);
      store().setConversation(chatScope, "other-conversation", binding.workspaceId);
      store().addMessage(chatScope, localMessage("other", "assistant", "other-request", { origin: {
        source: "feedback", feedbackKind: "other", localId: "other", conversationId: "other-conversation",
      } }));
      return store().acquireOperation({ ...binding, chatScope, epoch: 0, type: "ask", requestId: "other-request" })!;
    });
    store().setConversation(scope, conversationId, workspaceId);
    store().addMessage(scope, localMessage("protected", "assistant", "request-1", { generation: foundationGeneration }));
    const sameThread = store().acquireOperation({ ...context, chatScope: scope, epoch: 0, type: "confirm", generationId: "other-generation" })!;
    store().denyAccess({ ...context, generationId });
    expect(store().isOperationActive(sameThread)).toBe(true);
    for (const token of tokens) {
      expect(store().isOperationActive(token)).toBe(true);
      expect(store().threads[token.chatScope].messages).toHaveLength(1);
    }
    expect(store().threads[scope].messages).toEqual([]);
  });

  it("removes recovery/selection objects and raw instruction provenance on conversation denial", () => {
    store().setConversation(scope, conversationId, workspaceId);
    const message = localMessage("raw-instruction", "user");
    message.origin = { source: "optimistic", localId: message.id, conversationId, originalInstruction: "secret instruction" };
    store().addMessage(scope, message);
    const binding = { userId: "user-1", workspaceId, pageId: null, chatScope: scope, epoch: 0 };
    const request = { workspaceId, conversationId, instruction: "secret instruction", requestId: "request-1" };
    store().addMessage(scope, localMessage("recovery", "assistant", "request-1", { previewRecovery: {
      request, binding, generationId, conversationId, plan: askResponses.plan.planning.plan,
      preview: askResponses.plan.preview, turnId: "turn-1",
    } }));
    store().addMessage(scope, localMessage("selection", "assistant", "request-1", { unifiedSelection: {
      request, binding, selectedConversationId: conversationId, selectionRevision: 0,
      candidates: askResponses.ambiguous.planning.candidates, turnId: "turn-1",
    } }));
    store().denyAccess(context);
    expect(JSON.stringify(store().threads[scope])).not.toContain("secret instruction");
    expect(store().threads[scope].messages).toEqual([]);
    expect(isAiAccessDenied(store().accessDenials, context)).toBe(true);
    expect(isAiAccessDenied(store().accessDenials, { ...context, conversationId: "other" })).toBe(false);
    expect(store().accessDenials).toEqual([context]);
  });

  it("Page 404 removes only cached conversations bound to that Page", () => {
    const client = new QueryClient();
    const pageScope = getAiChatScope(pageId, workspaceId, "user-1");
    const otherScope = getAiChatScope("page-b", workspaceId, "user-1");
    for (const [chatScope, id, target] of [[pageScope, conversationId, pageId], [otherScope, "other", "page-b"]]) {
      store().setConversation(chatScope, id, workspaceId);
      store().addMessage(chatScope, localMessage(id, "assistant", id, { origin: { source: "feedback", feedbackKind: "other", localId: id, conversationId: id } }));
      client.setQueryData(aiHistoryKeys.conversation("user-1", id), { ...foundationConversation, id, scope: "PAGE", page_id: target });
      client.setQueryData(aiHistoryKeys.generations("user-1", id), { pages: [{ items: [foundationGeneration] }], pageParams: [null] });
    }
    handleAiAuthorizationDenial(client, http(404), { ...context, conversationId: null, pageId });
    expect(store().threads[pageScope].messages).toEqual([]);
    expect(store().threads[otherScope].messages).toHaveLength(1);
    expect(client.getQueryData(aiHistoryKeys.generations("user-1", conversationId))).toBeUndefined();
    expect(client.getQueryData(aiHistoryKeys.generations("user-1", "other"))).toBeDefined();
    expect(isAiAccessDenied(store().accessDenials, { ...context, conversationId: "new", pageId: "page-b" })).toBe(false);
    client.clear();
  });

  it("removes denied conversation titles from workspace lists while retaining unrelated entries", () => {
    const client = new QueryClient();
    const listKey = aiHistoryKeys.conversations("user-1", { workspaceId, scope: "GLOBAL" });
    const otherUserKey = aiHistoryKeys.conversations("user-2", { workspaceId, scope: "GLOBAL" });
    const data = { pages: [{ items: [foundationConversation, { ...foundationConversation, id: "other" }] }], pageParams: [null] };
    client.setQueryData(listKey, data); client.setQueryData(otherUserKey, data);
    handleAiAuthorizationDenial(client, http(403), context);
    expect(client.getQueryData<typeof data>(listKey)?.pages[0].items.map((item) => item.id)).toEqual(["other"]);
    expect(client.getQueryData(otherUserKey)).toEqual(data);
    client.clear();
  });
});
