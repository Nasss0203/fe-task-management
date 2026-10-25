import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError } from "axios";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "@/entities/ai-assistant/api/ai-assistant.api";
import { aiHistoryKeys, useAiHistoryConversations, useAiHistoryMessages } from "@/entities/ai-assistant/model/ai-assistant.queries";
import { getAiAccessIdentity } from "@/entities/ai-assistant/model/ai-assistant.access";
import { useAiChat } from "@/widgets/ai-chat/model/use-ai-chat";
import { getAiChatScope, useAiChatStore } from "@/widgets/ai-chat/model/use-ai-chat-store";
import { foundationConversation, foundationGeneration } from "../unit/ai-foundation.fixtures";
import { askResponses, workspaceId, pageId, conversationId, generationId } from "../unit/ai-ask.fixtures";

const view = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: view.push }) }));
vi.mock("sonner", () => ({ toast: { error: view.error, success: view.success } }));
vi.mock("@/features/auth", () => ({ useUser: () => ({ user: { id: "user-1", lastActiveWorkspaceId: "22222222-2222-4222-8222-222222222222" } }) }));
vi.mock("@/entities/workspace/model/workspace.queries", () => ({ useWorkspaces: () => ({ data: [{ id: "22222222-2222-4222-8222-222222222222" }] }) }));
vi.mock("@/entities/page/model/page.queries", () => ({
  usePage: (id?: string) => ({ data: id ? { id, workspace_id: "22222222-2222-4222-8222-222222222222" } : undefined }),
  pageKeys: { detail: (id: string) => ["pages", "detail", id], byWorkspace: (id: string) => ["pages", "workspace", id] },
}));
vi.mock("@/entities/ai-assistant/api/ai-assistant.api");
const A = "private-token-A", B = "private-token-B";
const bound = (shareToken: string) => ({ userId: "user-1", workspaceId, pageId, shareToken });
const conversation = { ...foundationConversation, scope: "PAGE" as const, page_id: pageId };
const generation = { ...foundationGeneration, capability: "GENERATE_PAGE_MODIFICATION_PLAN" as const, output_data: askResponses.plan.planning.plan };
const httpError = (status: number) => new AxiosError("sensitive backend detail", "ERR_BAD_RESPONSE", undefined, undefined, { status } as never);
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const clients: QueryClient[] = [];
function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity }, mutations: { retry: 3, retryDelay: 0 } } });
  clients.push(client);
  const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { client, wrapper };
}
function mount(token: string | undefined = A) {
  const { client, wrapper } = setup();
  return { client, ...renderHook(({ token }: { token?: string }) => useAiChat(pageId, token ? bound(token) : undefined), { initialProps: { token: token as string | undefined }, wrapper }) };
}
beforeEach(() => {
  vi.resetAllMocks(); localStorage.clear(); useAiChatStore.setState(useAiChatStore.getInitialState(), true);
  vi.mocked(api.getAiConversation).mockResolvedValue(conversation);
  vi.mocked(api.getAiGeneration).mockResolvedValue(generation);
  vi.mocked(api.listAiConversations).mockResolvedValue({ items: [conversation], nextCursor: null });
  vi.mocked(api.listAiConversationMessages).mockResolvedValue({ items: [], nextCursor: null });
  vi.mocked(api.listAiConversationGenerations).mockResolvedValue({ items: [generation], nextCursor: null });
  vi.mocked(api.askAi).mockImplementation(async (request) => ({ ...askResponses.plan, requestId: request.requestId! }));
  vi.mocked(api.confirmAiModificationPlan).mockResolvedValue({ generation: { ...generation, status: "APPLIED" }, execution: { createdBlockIds: [], createdRowIds: [] } });
  vi.mocked(api.discardAiGeneration).mockResolvedValue({ ...generation, status: "DISCARDED" });
});
afterEach(() => { cleanup(); clients.splice(0).forEach((client) => client.clear()); });

describe("FIX07 operation context through real hook/query/mutations", () => {
  it("carries original token through Ask, owner verification, generation GET and history without storing it", async () => {
    const { result, client } = mount();
    await act(async () => { await result.current.sendUnifiedAsk({ instruction: "Add QA" }); });
    expect(api.askAi).toHaveBeenCalledWith(expect.not.objectContaining({ shareToken: A }), A);
    expect(api.getAiConversation).toHaveBeenCalledWith(conversationId, expect.any(AbortSignal), A);
    expect(api.getAiGeneration).toHaveBeenCalledWith(generationId, undefined, A);
    await waitFor(() => expect(api.listAiConversationGenerations).toHaveBeenCalledWith(conversationId, undefined, expect.any(AbortSignal), A));
    expect(JSON.stringify(useAiChatStore.getState())).not.toContain(A);
    expect(JSON.stringify(localStorage)).not.toContain(A);
    expect(JSON.stringify(client.getQueryCache().getAll().map((query) => query.queryKey))).not.toContain(A);
    expect(view.error).not.toHaveBeenCalled();
  });

  it.each(["confirm", "discard"] as const)("uses captured token for %s preflight and mutation without auto-retry", async (action) => {
    const { result } = mount();
    await act(async () => { await (action === "confirm" ? result.current.confirmAiModificationPlan(generationId, pageId) : result.current.discardGeneration(generationId)); });
    expect(api.getAiGeneration).toHaveBeenCalledWith(generationId, undefined, A);
    expect(action === "confirm" ? api.confirmAiModificationPlan : api.discardAiGeneration).toHaveBeenCalledExactlyOnceWith(generationId, A);
  });

  it.each([B, undefined])("removes protected preview/verification when switching A to %s", async (token) => {
    const { result, rerender } = mount();
    await act(async () => { await result.current.sendUnifiedAsk({ instruction: "Add QA" }); });
    const oldScope = result.current.chatScope;
    expect(useAiChatStore.getState().threads[oldScope].messages.some((message) => message.generation)).toBe(true);
    rerender({ token });
    expect(result.current.chatScope).not.toBe(oldScope);
    expect(result.current.savedGenerations).toEqual([]);
    expect(useAiChatStore.getState().threads[result.current.chatScope]?.messages ?? []).toEqual([]);
  });

  it.each(["success", 403, 404] as const)("ignores old A %s after B is independently verified", async (outcome) => {
    const pending = deferred<Awaited<ReturnType<typeof api.askAi>>>();
    vi.mocked(api.askAi).mockReturnValueOnce(pending.promise);
    const { result, rerender } = mount();
    let sending!: Promise<boolean>;
    act(() => { sending = result.current.sendUnifiedAsk({ instruction: "A request" }); });
    await waitFor(() => expect(api.askAi).toHaveBeenCalledTimes(1));
    rerender({ token: B });
    await act(async () => { await result.current.sendUnifiedAsk({ instruction: "B request" }); });
    expect(api.askAi).toHaveBeenCalledTimes(2);
    expect(api.askAi).toHaveBeenLastCalledWith(expect.objectContaining({ instruction: "B request" }), B);
    const scope = result.current.chatScope;
    await act(async () => { if (outcome === "success") pending.resolve({ ...askResponses.plan, requestId: vi.mocked(api.askAi).mock.calls[0][0].requestId! }); else pending.reject(httpError(outcome)); await sending; });
    expect(useAiChatStore.getState().threads[scope].messages.some((message) => message.generation)).toBe(true);
    expect(result.current.accessDenied).toBe(false);
    expect(view.error).not.toHaveBeenCalled();
  });

  it.each([403, 404])("revocation %s clears only A protected content and blocks mutations", async (status) => {
    const { result } = mount();
    await act(async () => { await result.current.sendUnifiedAsk({ instruction: "Add QA" }); });
    vi.mocked(api.getAiGeneration).mockRejectedValue(httpError(status));
    await act(async () => { await result.current.discardGeneration(generationId); });
    expect(useAiChatStore.getState().threads[result.current.chatScope].messages.some((message) => message.generation || message.previewRecovery)).toBe(false);
    expect(api.discardAiGeneration).not.toHaveBeenCalled();
    expect(result.current.canReadGeneration(generationId)).toBe(false);
  });

  it("A denial preserves B cache and B thread for the very same conversation/generation", async () => {
    const { result, client } = mount();
    await act(async () => { await result.current.sendUnifiedAsk({ instruction: "Add QA" }); });
    const identity = getAiAccessIdentity(B);
    const bKey = aiHistoryKeys.generations("user-1", conversationId, identity);
    const protectedB = { pages: [{ items: [generation], nextCursor: null }], pageParams: [null] };
    client.setQueryData(bKey, protectedB);
    const bScope = getAiChatScope(pageId, workspaceId, "user-1", identity);
    act(() => { useAiChatStore.getState().setConversation(bScope, conversationId, workspaceId); useAiChatStore.getState().addMessage(bScope, { id: "B", role: "assistant", content: "B protected", capability: generation.capability, generation, createdAt: generation.created_at }); });
    vi.mocked(api.getAiGeneration).mockRejectedValue(httpError(403));
    await act(async () => { await result.current.discardGeneration(generationId); });
    expect(client.getQueryData(bKey)).toEqual(protectedB);
    expect(useAiChatStore.getState().threads[bScope].messages).toHaveLength(1);
  });

  it.each(["confirm", "discard", "composition"] as const)("does not dispatch %s if token changes during preflight", async (action) => {
    const pending = deferred<Awaited<ReturnType<typeof api.getAiGeneration>>>();
    vi.mocked(api.getAiGeneration).mockReturnValue(pending.promise);
    const { result, rerender } = mount();
    let operation!: Promise<unknown>;
    act(() => { operation = action === "confirm" ? result.current.confirmAiModificationPlan(generationId, pageId) : action === "discard" ? result.current.discardGeneration(generationId) : result.current.confirmPageComposition(generationId); });
    rerender({ token: B });
    await act(async () => { pending.resolve(generation); await operation; });
    expect(api.confirmAiModificationPlan).not.toHaveBeenCalled();
    expect(api.confirmPageComposition).not.toHaveBeenCalled();
    expect(api.discardAiGeneration).not.toHaveBeenCalled();
    expect(view.error).not.toHaveBeenCalled();
  });

  it.each([400, 401, 409, 429, 500, 502, "network"] as const)("%s follows existing error policy without token-denial cleanup", async (status) => {
    const { result } = mount();
    await act(async () => { await result.current.sendUnifiedAsk({ instruction: "Add QA" }); });
    const scope = result.current.chatScope;
    vi.mocked(api.getAiGeneration).mockRejectedValue(status === "network" ? new AxiosError("request URL contains private-token-A", "ERR_NETWORK") : httpError(status));
    await act(async () => { await result.current.discardGeneration(generationId); });
    expect(useAiChatStore.getState().threads[scope].messages.some((message) => message.generation)).toBe(true);
    expect(useAiChatStore.getState().accessDenials).toEqual([]);
    expect(api.discardAiGeneration).not.toHaveBeenCalled();
    expect(JSON.stringify(view.error.mock.calls)).not.toContain(A);
  });

  it("accepts an unvalidated/expired-looking token when server grants direct permission", async () => {
    const { result } = mount("expired-looking-token");
    await act(async () => { await result.current.sendUnifiedAsk({ instruction: "Add QA" }); });
    expect(api.askAi).toHaveBeenCalledWith(expect.any(Object), "expired-looking-token");
    expect(useAiChatStore.getState().threads[result.current.chatScope].messages.some((message) => message.generation)).toBe(true);
    expect(result.current.accessDenied).toBe(false);
  });

  it("retains server WORKSPACE_READ denial despite a Page token and never falls back to legacy APIs", async () => {
    vi.mocked(api.askAi).mockRejectedValue(httpError(403));
    const { result } = mount();
    await act(async () => { await result.current.sendUnifiedAsk({ instruction: "Add QA" }); });
    expect(api.askAi).toHaveBeenCalledExactlyOnceWith(expect.any(Object), A);
    expect(result.current.accessDenied).toBe(true);
    expect(api.createAiConversation).not.toHaveBeenCalled();
    expect(api.submitAiMessage).not.toHaveBeenCalled();
    expect(api.getAiGeneration).not.toHaveBeenCalled();
  });

  it("retains owner-scoped 404 on a selected conversation before sending Ask", async () => {
    vi.mocked(api.getAiConversation).mockRejectedValue(httpError(404));
    const { result } = mount();
    act(() => { result.current.selectHistoryConversation("other-users-conversation"); });
    await waitFor(() => expect(result.current.accessDenied).toBe(true));
    await act(async () => { await result.current.sendUnifiedAsk({ instruction: "Add QA" }); });
    expect(api.askAi).not.toHaveBeenCalled();
    expect(api.confirmAiModificationPlan).not.toHaveBeenCalled();
  });

  it("retains independent destination PAGE_CREATE denial after readable composition preflight", async () => {
    vi.mocked(api.getAiGeneration).mockResolvedValue({ ...foundationGeneration, ...askResponses.composition.generation, capability: "GENERATE_PAGE_COMPOSITION" });
    vi.mocked(api.confirmPageComposition).mockRejectedValue(httpError(403));
    const { result } = mount();
    await act(async () => { await result.current.confirmPageComposition(generationId, { parentPageId: "destination-page" }); });
    expect(api.getAiGeneration).toHaveBeenCalledWith(generationId, undefined, A);
    expect(api.confirmPageComposition).toHaveBeenCalledExactlyOnceWith(generationId, { parentPageId: "destination-page" }, A);
    expect(view.push).not.toHaveBeenCalled();
    expect(view.success).not.toHaveBeenCalled();
  });

  it("blocks a candidate on another Page before dispatching the bound token", async () => {
    const { result } = mount();
    await act(async () => { await result.current.sendUnifiedAsk({ instruction: "Add QA", selectedPageId: "different-page" }); });
    expect(api.askAi).not.toHaveBeenCalled();
  });

  it.each(["userId", "workspaceId", "pageId"] as const)("never forwards a credential bound to a different %s", async (field) => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useAiChat(pageId, { ...bound(A), [field]: "different-binding" }), { wrapper });
    await act(async () => { await result.current.sendUnifiedAsk({ instruction: "Add QA" }); });
    expect(vi.mocked(api.askAi).mock.calls).toHaveLength(1);
    expect(JSON.stringify(vi.mocked(api.askAi).mock.calls)).not.toContain(A);
  });
});

describe("FIX07 query partitions and FIX06 list epochs", () => {
  it("revalidates an earlier token instead of replaying its cached success", async () => {
    const { wrapper } = setup();
    const { result, rerender } = renderHook(({ token }) => useAiHistoryMessages("user-1", conversationId, true, undefined, undefined, token), { initialProps: { token: A }, wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    rerender({ token: B });
    await waitFor(() => expect(api.listAiConversationMessages).toHaveBeenCalledTimes(2));
    const pending = deferred<Awaited<ReturnType<typeof api.listAiConversationMessages>>>();
    vi.mocked(api.listAiConversationMessages).mockReturnValueOnce(pending.promise);
    rerender({ token: A });
    expect(result.current.data).toBeUndefined();
    expect(result.current.isSuccess).toBe(false);
    await act(async () => { pending.resolve({ items: [], nextCursor: null }); });
    await waitFor(() => expect(api.listAiConversationMessages).toHaveBeenCalledTimes(3));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("independently verifies A, B and direct message history with AbortSignal/pagination", async () => {
    const { wrapper } = setup();
    const { result, rerender } = renderHook(({ token }: { token?: string }) => useAiHistoryMessages("user-1", conversationId, true, undefined, undefined, token), { initialProps: { token: A as string | undefined }, wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.listAiConversationMessages).toHaveBeenLastCalledWith(conversationId, undefined, expect.any(AbortSignal), A);
    rerender({ token: B });
    await waitFor(() => expect(api.listAiConversationMessages).toHaveBeenLastCalledWith(conversationId, undefined, expect.any(AbortSignal), B));
    rerender({ token: undefined });
    await waitFor(() => expect(api.listAiConversationMessages).toHaveBeenLastCalledWith(conversationId, undefined, expect.any(AbortSignal)));
  });

  it.each(["PAGE", "GLOBAL"] as const)("isolates %s list denial marker and Fresh Retry across A/B", async (scope) => {
    const { wrapper, client } = setup();
    vi.mocked(api.listAiConversations).mockRejectedValueOnce(httpError(403));
    const { result, rerender } = renderHook(({ token }) => useAiHistoryConversations("user-1", { workspaceId, scope, ...(scope === "PAGE" ? { pageId } : {}) }, undefined, token), { initialProps: { token: A }, wrapper });
    await waitFor(() => expect(result.current.isAccessDenied).toBe(true));
    rerender({ token: B });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0].items).toEqual([conversation]);
    expect(client.getQueryCache().findAll({ queryKey: ["ai-conversation-list-access"] })).toHaveLength(2);
    rerender({ token: A });
    expect(result.current.data).toBeUndefined();
    await act(async () => { await result.current.refetch(); });
    await waitFor(() => expect(result.current.isAccessDenied).toBe(false));
    expect(api.listAiConversations).toHaveBeenLastCalledWith(expect.objectContaining({ scope }), undefined, expect.any(AbortSignal), A);
  });
});
