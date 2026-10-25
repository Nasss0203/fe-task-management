import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { StrictMode, type PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "@/entities/ai-assistant/api/ai-assistant.api";
import { aiHistoryKeys, useAiConversation, useAiHistoryConversations, useAiHistoryMessages, useAiHistoryGenerations } from "@/entities/ai-assistant/model/ai-assistant.queries";
import { getAiAccessIdentity } from "@/entities/ai-assistant/model/ai-assistant.access";
import { useAiChat } from "@/widgets/ai-chat/model/use-ai-chat";
import { useAiChatStore } from "@/widgets/ai-chat/model/use-ai-chat-store";
import { aiHistorySelectionKey, saveSelectedAiConversation } from "@/widgets/ai-chat/model/ai-history-selection";
import { AiChat } from "@/widgets/ai-chat/ui/AiChat";
import { foundationConversation, foundationGeneration, serverMessage } from "../unit/ai-foundation.fixtures";
import { askResponses, workspaceId, pageId, conversationId } from "../unit/ai-ask.fixtures";

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

const A = "followup-private-A", B = "followup-private-B";
const filters = { workspaceId, scope: "PAGE" as const, pageId };
const conversation = { ...foundationConversation, scope: "PAGE" as const, page_id: pageId, title: "OLD_PROTECTED_TITLE" };
const message = serverMessage("OLD_PROTECTED_MESSAGE", "USER");
const bound = (shareToken: string) => ({ userId: "user-1", workspaceId, pageId, shareToken });
const key = (token?: string) => aiHistoryKeys.conversations("user-1", filters, getAiAccessIdentity(token));
const http = (status: number) => new AxiosError("temporary failure", "ERR_BAD_RESPONSE", undefined, undefined, { status } as never);
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const clients: QueryClient[] = [];
function setup(strict = false) {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false, retryDelay: 0 }, mutations: { retry: false } } });
  clients.push(client);
  const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>{strict ? <StrictMode>{children}</StrictMode> : children}</QueryClientProvider>;
  return { client, wrapper };
}
function list(context: ReturnType<typeof setup>, token: string | undefined = A) {
  return renderHook(({ token }) => useAiHistoryConversations("user-1", filters, undefined, token), { initialProps: { token: token as string | undefined }, wrapper: context.wrapper });
}
async function cachedList(context: ReturnType<typeof setup>) {
  const first = list(context);
  await waitFor(() => expect(first.result.current.isSuccess).toBe(true));
  first.unmount();
}
beforeEach(() => {
  vi.resetAllMocks(); onlineManager.setOnline(true); localStorage.clear(); sessionStorage.clear();
  useAiChatStore.setState(useAiChatStore.getInitialState(), true);
  vi.mocked(api.getAiConversation).mockResolvedValue(conversation);
  vi.mocked(api.listAiConversations).mockResolvedValue({ items: [conversation], nextCursor: null });
  vi.mocked(api.listAiConversationMessages).mockResolvedValue({ items: [message], nextCursor: null });
  vi.mocked(api.listAiConversationGenerations).mockResolvedValue({ items: [foundationGeneration], nextCursor: null });
});
afterEach(() => { cleanup(); clients.splice(0).forEach((client) => client.clear()); onlineManager.setOnline(true); });

describe("FIX07 follow-up: real Query cache re-entry", () => {
  it.each(["detail", "list", "messages", "generations"] as const)("R01/R13 cached %s offline remount exposes no protected data", async (surface) => {
    const context = setup();
    const useSurface = () => {
      const detail = useAiConversation("user-1", surface === "detail" ? conversationId : null, true, undefined, A);
      const conversations = useAiHistoryConversations("user-1", surface === "list" ? filters : null, undefined, A);
      const messages = useAiHistoryMessages("user-1", surface === "messages" ? conversationId : null, true, undefined, undefined, A);
      const generations = useAiHistoryGenerations("user-1", surface === "generations" ? conversationId : null, true, undefined, undefined, A);
      return { detail, list: conversations, messages, generations }[surface];
    };
    const first = renderHook(useSurface, { wrapper: context.wrapper });
    await waitFor(() => expect(first.result.current.isSuccess).toBe(true));
    first.unmount(); onlineManager.setOnline(false);
    const second = renderHook(useSurface, { wrapper: context.wrapper });
    await waitFor(() => expect(second.result.current.fetchStatus).toBe("paused"));
    const cached = context.client.getQueryCache().getAll().find((q) => q.queryKey[0] === "ai-history" && q.queryKey[2] === (surface === "detail" ? "conversation" : surface === "list" ? "conversations" : surface) && q.state.data !== undefined);
    expect(cached?.state.status).toBe("success");
    await waitFor(() => expect(cached?.state.fetchStatus).toBe("paused"));
    expect(cached?.state.data).toBeDefined();
    expect(second.result.current.data).toBeUndefined();
    expect(second.result.current.isSuccess).toBe(false);
    expect(second.result.current.status).toBe("pending");
    expect(second.result.current.isPending).toBe(true);
  });

  it("R02 A to B to offline A cannot reuse A's cached success", async () => {
    const context = setup(); const hook = list(context);
    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
    hook.rerender({ token: B });
    await waitFor(() => expect(api.listAiConversations).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
    onlineManager.setOnline(false); hook.rerender({ token: A });
    expect(hook.result.current.fetchStatus).toBe("paused");
    expect(hook.result.current.data).toBeUndefined();
    expect(hook.result.current.isSuccess).toBe(false);
  });

  it.each([500, "timeout", "network"] as const)("R03/R04/R16 re-entry %s retains raw cache but hides it without denial", async (failure) => {
    const context = setup(); await cachedList(context);
    vi.mocked(api.listAiConversations).mockRejectedValue(failure === 500 ? http(500) : new AxiosError("transport failed", failure === "timeout" ? "ECONNABORTED" : "ERR_NETWORK"));
    const hook = list(context);
    await waitFor(() => expect(hook.result.current.isError).toBe(true));
    expect(context.client.getQueryState(key(A))?.status).toBe("error");
    expect(context.client.getQueryData(key(A))).toBeDefined();
    expect(hook.result.current.data).toBeUndefined();
    expect(hook.result.current.isAccessDenied).toBe(false);
    expect(context.client.getQueryData(["ai-conversation-list-access", ...key(A).slice(1)])).toEqual({ epoch: 0, denied: false });
    expect(useAiChatStore.getState().accessDenials).toEqual([]);
  });

  it("R05 a pending re-entry never flashes protected data, including render snapshots", async () => {
    const context = setup(); await cachedList(context);
    const pending = deferred<Awaited<ReturnType<typeof api.listAiConversations>>>();
    vi.mocked(api.listAiConversations).mockReturnValueOnce(pending.promise);
    const snapshots: unknown[] = [];
    const hook = renderHook(() => { const q = useAiHistoryConversations("user-1", filters, undefined, A); snapshots.push(q.data); return q; }, { wrapper: context.wrapper });
    expect(hook.result.current.data).toBeUndefined();
    expect(snapshots.every((data) => data === undefined)).toBe(true);
    await act(async () => pending.resolve({ items: [{ ...conversation, title: "FRESH_TITLE" }], nextCursor: null }));
    await waitFor(() => expect(hook.result.current.data?.pages[0].items[0].title).toBe("FRESH_TITLE"));
  });

  it("R06 offline re-entry unlocks only after connectivity and successful server verification", async () => {
    const context = setup(); await cachedList(context); onlineManager.setOnline(false);
    const hook = list(context); expect(hook.result.current.data).toBeUndefined();
    vi.mocked(api.listAiConversations).mockResolvedValue({ items: [{ ...conversation, title: "RECONNECTED_TITLE" }], nextCursor: null });
    act(() => onlineManager.setOnline(true));
    await waitFor(() => expect(hook.result.current.data?.pages[0].items[0].title).toBe("RECONNECTED_TITLE"));
    expect(api.listAiConversations).toHaveBeenCalledTimes(2);
  });

  it("R07 transient verification failure recovers by explicit server Retry", async () => {
    const context = setup(); await cachedList(context);
    vi.mocked(api.listAiConversations).mockRejectedValue(http(500));
    const hook = list(context); await waitFor(() => expect(hook.result.current.isError).toBe(true));
    expect(hook.result.current.data).toBeUndefined();
    vi.mocked(api.listAiConversations).mockResolvedValue({ items: [{ ...conversation, title: "RETRIED_TITLE" }], nextCursor: null });
    await act(async () => { await hook.result.current.refetch(); });
    await waitFor(() => expect(hook.result.current.data?.pages[0].items[0].title).toBe("RETRIED_TITLE"));
    expect(hook.result.current.isAccessDenied).toBe(false);
    expect(api.askAi).not.toHaveBeenCalled(); expect(api.confirmAiModificationPlan).not.toHaveBeenCalled(); expect(api.discardAiGeneration).not.toHaveBeenCalled();
  });

  it.each([403, 404])("R08/R09 revalidation %s cleans only A and requires fresh Retry", async (status) => {
    const context = setup(); await cachedList(context);
    const independent = [key(B), key(), aiHistoryKeys.conversations("other-user", filters, getAiAccessIdentity(A)), aiHistoryKeys.conversations("user-1", { ...filters, workspaceId: "other-workspace" }, getAiAccessIdentity(A)), aiHistoryKeys.conversations("user-1", { ...filters, pageId: "other-page" }, getAiAccessIdentity(A))];
    const data = { pages: [{ items: [conversation], nextCursor: null }], pageParams: [null] };
    independent.forEach((k) => context.client.setQueryData(k, data));
    const before = independent.map((k) => context.client.getQueryData(k));
    vi.mocked(api.listAiConversations).mockRejectedValue(http(status));
    const hook = list(context); await waitFor(() => expect(hook.result.current.isAccessDenied).toBe(true));
    expect(hook.result.current.data).toBeUndefined();
    expect(context.client.getQueryData(key(A))).toEqual({ pages: [], pageParams: [] });
    independent.forEach((k, i) => expect(context.client.getQueryData(k)).toBe(before[i]));
    vi.mocked(api.listAiConversations).mockResolvedValue({ items: [conversation], nextCursor: null });
    await act(async () => { await hook.result.current.refetch(); });
    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
  });

  it.each(["success", 403, 404] as const)("R10 late obsolete A %s cannot affect verified B", async (outcome) => {
    const context = setup(); const old = deferred<Awaited<ReturnType<typeof api.listAiConversationMessages>>>();
    vi.mocked(api.listAiConversationMessages).mockReturnValueOnce(old.promise);
    const hook = renderHook(({ token }) => useAiHistoryMessages("user-1", conversationId, true, undefined, undefined, token), { initialProps: { token: A }, wrapper: context.wrapper });
    hook.rerender({ token: B }); await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
    const verified = hook.result.current.data;
    await act(async () => { if (outcome === "success") old.resolve({ items: [serverMessage("OBSOLETE", "USER")], nextCursor: null }); else old.reject(http(outcome)); });
    expect(hook.result.current.data).toBe(verified);
    expect(JSON.stringify(hook.result.current.data)).not.toContain("OBSOLETE");
    expect(useAiChatStore.getState().accessDenials).toEqual([]);
  });

  it("R11 verified pages survive next-page loading and cursor handling", async () => {
    const context = setup();
    vi.mocked(api.listAiConversations).mockResolvedValueOnce({ items: [conversation], nextCursor: "page-2" });
    const hook = list(context); await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
    const next = deferred<Awaited<ReturnType<typeof api.listAiConversations>>>();
    vi.mocked(api.listAiConversations).mockReturnValueOnce(next.promise);
    let fetching!: ReturnType<typeof hook.result.current.fetchNextPage>;
    act(() => { fetching = hook.result.current.fetchNextPage(); });
    await waitFor(() => expect(hook.result.current.isFetchingNextPage).toBe(true));
    expect(hook.result.current.data?.pages[0].items[0].title).toBe("OLD_PROTECTED_TITLE");
    expect(api.listAiConversations).toHaveBeenLastCalledWith(filters, "page-2", expect.any(AbortSignal), A);
    await act(async () => { next.resolve({ items: [{ ...conversation, id: "second", title: "SECOND_PAGE" }], nextCursor: null }); await fetching; });
    await waitFor(() => expect(hook.result.current.data?.pages).toHaveLength(2)); expect(hook.result.current.hasNextPage).toBe(false);
  });

  it.each(["paused", "failed"] as const)("R12 multiple cached pages cannot bypass %s first-page revalidation", async (mode) => {
    const context = setup();
    vi.mocked(api.listAiConversations).mockResolvedValueOnce({ items: [conversation], nextCursor: "page-2" });
    const first = list(context); await waitFor(() => expect(first.result.current.isSuccess).toBe(true));
    await act(async () => { await first.result.current.fetchNextPage(); });
    await waitFor(() => expect(first.result.current.data?.pages).toHaveLength(2)); first.unmount();
    if (mode === "paused") onlineManager.setOnline(false); else vi.mocked(api.listAiConversations).mockRejectedValue(http(500));
    const second = list(context);
    await waitFor(() => expect(mode === "paused" ? second.result.current.fetchStatus === "paused" : second.result.current.isError).toBe(true));
    expect(second.result.current.data).toBeUndefined(); expect(second.result.current.hasNextPage).toBe(false);
  });

  it("disabled then enabled token query requires another server verification", async () => {
    const context = setup();
    const hook = renderHook(({ readable }) => useAiConversation("user-1", conversationId, readable, undefined, A), { initialProps: { readable: true }, wrapper: context.wrapper });
    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
    hook.rerender({ readable: false }); expect(hook.result.current.data).toBeUndefined();
    onlineManager.setOnline(false); hook.rerender({ readable: true }); expect(hook.result.current.data).toBeUndefined();
  });

  it("StrictMode remount cannot establish verification from cached success", async () => {
    const context = setup(true); await cachedList(context); onlineManager.setOnline(false);
    const hook = list(context); expect(hook.result.current.data).toBeUndefined();
    act(() => onlineManager.setOnline(true)); await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
  });

  it("R17 direct access retains Infinity cache semantics offline", async () => {
    const context = setup(); const first = list(context, undefined);
    // Pass undefined explicitly via props because the helper's default is Token A.
    first.rerender({ token: undefined }); await waitFor(() => expect(first.result.current.isSuccess).toBe(true)); first.unmount();
    const calls = vi.mocked(api.listAiConversations).mock.calls.length; onlineManager.setOnline(false);
    const second = list(context); second.rerender({ token: undefined });
    expect(second.result.current.data?.pages[0].items[0].title).toBe("OLD_PROTECTED_TITLE");
    expect(api.listAiConversations).toHaveBeenCalledTimes(calls);
  });
  it("a joined pre-entry GET cannot unlock a new observer; a current GET follows", async () => {
    const context = setup(); const old = deferred<Awaited<ReturnType<typeof api.listAiConversations>>>();
    const fresh = deferred<Awaited<ReturnType<typeof api.listAiConversations>>>();
    vi.mocked(api.listAiConversations).mockReturnValueOnce(old.promise).mockReturnValueOnce(fresh.promise);
    const first = list(context); const second = list(context);
    await act(async () => old.resolve({ items: [conversation], nextCursor: null }));
    await waitFor(() => expect(api.listAiConversations).toHaveBeenCalledTimes(2));
    expect(second.result.current.data).toBeUndefined();
    await act(async () => fresh.resolve({ items: [{ ...conversation, title: "CURRENT_GET" }], nextCursor: null }));
    await waitFor(() => expect(second.result.current.data?.pages[0].items[0].title).toBe("CURRENT_GET"));
    await waitFor(() => expect(first.result.current.data?.pages[0].items[0].title).toBe("CURRENT_GET"));
  });

  it("manual cached-success replay during a paused entry cannot provide request provenance", async () => {
    const context = setup(); await cachedList(context); const old = context.client.getQueryData(key(A));
    onlineManager.setOnline(false); const hook = list(context);
    act(() => context.client.setQueryData(key(A), old));
    expect(hook.result.current.data).toBeUndefined(); expect(hook.result.current.isSuccess).toBe(false);
    expect(api.listAiConversations).toHaveBeenCalledTimes(1);
  });

  it("an unverified fetchNextPage call revalidates page one instead of authorizing old pages", async () => {
    const context = setup();
    vi.mocked(api.listAiConversations).mockResolvedValueOnce({ items: [conversation], nextCursor: "page-2" });
    await cachedList(context); onlineManager.setOnline(false); const hook = list(context);
    vi.mocked(api.listAiConversations).mockResolvedValue({ items: [{ ...conversation, title: "FRESH_FIRST" }], nextCursor: null });
    let recovery!: ReturnType<typeof hook.result.current.fetchNextPage>;
    act(() => { recovery = hook.result.current.fetchNextPage(); onlineManager.setOnline(true); });
    await act(async () => { await recovery; });
    await waitFor(() => expect(hook.result.current.data?.pages[0].items[0].title).toBe("FRESH_FIRST"));
    expect(api.listAiConversations).toHaveBeenLastCalledWith(filters, undefined, expect.any(AbortSignal), A);
    expect(hook.result.current.data?.pages).toHaveLength(1);
  });

  it("late obsolete pagination success cannot revive A after B and a new paused A entry", async () => {
    const context = setup();
    vi.mocked(api.listAiConversations).mockResolvedValueOnce({ items: [conversation], nextCursor: "page-2" });
    const hook = list(context); await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
    const old = deferred<Awaited<ReturnType<typeof api.listAiConversations>>>();
    vi.mocked(api.listAiConversations).mockReturnValueOnce(old.promise);
    let pagination!: ReturnType<typeof hook.result.current.fetchNextPage>;
    act(() => { pagination = hook.result.current.fetchNextPage(); });
    hook.rerender({ token: B }); await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
    onlineManager.setOnline(false); hook.rerender({ token: A });
    await act(async () => { old.resolve({ items: [{ ...conversation, title: "OBSOLETE_PAGE" }], nextCursor: null }); await pagination; });
    expect(hook.result.current.data).toBeUndefined();
    expect(JSON.stringify(context.client.getQueryData(key(A)))).not.toContain("OBSOLETE_PAGE");
  });

  it.each(["detail", "messages", "generations"] as const)("R13 %s transient failure and awaited Retry cannot expose cached data", async (surface) => {
    const context = setup();
    const useSurface = () => {
      const detail = useAiConversation("user-1", surface === "detail" ? conversationId : null, true, undefined, A);
      const messages = useAiHistoryMessages("user-1", surface === "messages" ? conversationId : null, true, undefined, undefined, A);
      const generations = useAiHistoryGenerations("user-1", surface === "generations" ? conversationId : null, true, undefined, undefined, A);
      return { detail, messages, generations }[surface];
    };
    const first = renderHook(useSurface, { wrapper: context.wrapper });
    await waitFor(() => expect(first.result.current.isSuccess).toBe(true)); first.unmount();
    vi.mocked(api.getAiConversation).mockRejectedValue(http(500));
    vi.mocked(api.listAiConversationMessages).mockRejectedValue(http(500));
    vi.mocked(api.listAiConversationGenerations).mockRejectedValue(http(500));
    const hook = renderHook(useSurface, { wrapper: context.wrapper });
    await waitFor(() => expect(hook.result.current.isError).toBe(true));
    expect(hook.result.current.data).toBeUndefined();
    await act(async () => { const retry = await hook.result.current.refetch(); expect(retry.data).toBeUndefined(); expect(retry.isSuccess).toBe(false); });
    expect(useAiChatStore.getState().accessDenials).toEqual([]);
  });

  it("R18 errors, cache, storage and console output never disclose the raw credential", async () => {
    const output = [vi.spyOn(console, "log"), vi.spyOn(console, "info"), vi.spyOn(console, "warn"), vi.spyOn(console, "error"), vi.spyOn(console, "debug")];
    try {
      const context = setup(); await cachedList(context);
      vi.mocked(api.listAiConversations).mockRejectedValue(new AxiosError("transport failed", "ERR_NETWORK"));
      const hook = list(context); await waitFor(() => expect(hook.result.current.isError).toBe(true));
      const exposed = JSON.stringify([context.client.getQueryCache().getAll().map((q) => q.queryKey), localStorage, sessionStorage, useAiChatStore.getState(), document.body.textContent, view.error.mock.calls, output.map((spy) => spy.mock.calls)]);
      expect(exposed).not.toContain(A); expect(exposed).not.toContain(B);
    } finally { output.forEach((spy) => spy.mockRestore()); }
  });

  it.each([500, "network"] as const)("R09 failed A verification (%s) preserves B/direct/user/workspace/page partitions", async (failure) => {
    const context = setup(); await cachedList(context);
    const independent = [key(B), key(), aiHistoryKeys.conversations("other-user", filters, getAiAccessIdentity(A)), aiHistoryKeys.conversations("user-1", { ...filters, workspaceId: "other-workspace" }, getAiAccessIdentity(A)), aiHistoryKeys.conversations("user-1", { ...filters, pageId: "other-page" }, getAiAccessIdentity(A))];
    independent.forEach((k) => context.client.setQueryData(k, { pages: [{ items: [conversation], nextCursor: null }], pageParams: [null] }));
    const before = independent.map((k) => context.client.getQueryData(k));
    vi.mocked(api.listAiConversations).mockRejectedValue(failure === 500 ? http(500) : new AxiosError("transport failed", "ERR_NETWORK"));
    const hook = list(context); await waitFor(() => expect(hook.result.current.isError).toBe(true));
    independent.forEach((k, i) => expect(context.client.getQueryData(k)).toBe(before[i]));
    expect(hook.result.current.data).toBeUndefined(); expect(hook.result.current.isAccessDenied).toBe(false);
  });

  it("an old success replay after failed active revalidation cannot restore verification", async () => {
    const context = setup(); const hook = list(context);
    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
    const original = context.client.getQueryData(key(A));
    vi.mocked(api.listAiConversations).mockRejectedValue(http(500));
    await act(async () => { await hook.result.current.refetch(); });
    await waitFor(() => expect(hook.result.current.isError).toBe(true));
    const fresh = deferred<Awaited<ReturnType<typeof api.listAiConversations>>>();
    vi.mocked(api.listAiConversations).mockReturnValue(fresh.promise);
    act(() => context.client.setQueryData(key(A), original));
    await waitFor(() => expect(hook.result.current.status).not.toBe("error"));
    expect(hook.result.current.data).toBeUndefined(); expect(hook.result.current.isSuccess).toBe(false);
    await act(async () => fresh.resolve({ items: [{ ...conversation, title: "VERIFIED_AFTER_REPLAY" }], nextCursor: null }));
    await waitFor(() => expect(hook.result.current.data?.pages[0].items[0].title).toBe("VERIFIED_AFTER_REPLAY"));
  });

});

describe("FIX07 follow-up: production hook, Zustand and UI consumers", () => {
  async function cachedChat(context: ReturnType<typeof setup>) {
    saveSelectedAiConversation(aiHistorySelectionKey("user-1", workspaceId, pageId, getAiAccessIdentity(A)), conversationId);
    const first = renderHook(() => useAiChat(pageId, bound(A)), { wrapper: context.wrapper });
    await waitFor(() => expect(useAiChatStore.getState().threads[first.result.current.chatScope]?.messages.some((m) => m.content === message.content)).toBe(true));
    first.unmount();
  }
  it("R14 offline remount cannot hydrate unverified history into Zustand", async () => {
    const context = setup(); await cachedChat(context);
    const hydrate = vi.spyOn(useAiChatStore.getState(), "hydrateHistory");
    onlineManager.setOnline(false);
    const hook = renderHook(() => useAiChat(pageId, bound(A)), { wrapper: context.wrapper });
    expect(hook.result.current.conversations).toEqual([]); expect(hook.result.current.savedGenerations).toEqual([]);
    expect(hydrate).not.toHaveBeenCalled(); expect(hook.result.current.canReadGeneration(foundationGeneration.id)).toBe(false);
  });
  it.each(["offline", "500"] as const)("R15/R18 real Chat and History hide retained protected content/actions on %s re-entry", async (failure) => {
    const context = setup(); await cachedChat(context);
    if (failure === "offline") onlineManager.setOnline(false); else {
      vi.mocked(api.getAiConversation).mockRejectedValue(http(500)); vi.mocked(api.listAiConversations).mockRejectedValue(http(500));
      vi.mocked(api.listAiConversationMessages).mockRejectedValue(http(500)); vi.mocked(api.listAiConversationGenerations).mockRejectedValue(http(500));
    }
    render(<AiChat currentPageId={pageId} pageAccess={bound(A)} />, { wrapper: context.wrapper });
    fireEvent.click(screen.getByRole("button", { name: /History/ }));
    if (failure === "500") await screen.findByText("Unable to load chat history.");
    expect(screen.queryByText("OLD_PROTECTED_TITLE")).toBeNull(); expect(screen.queryByText("OLD_PROTECTED_MESSAGE")).toBeNull();
    expect(screen.queryByText("Saved generation preview")).toBeNull(); expect(screen.queryByText("Apply changes")).toBeNull();
    if (failure === "500") expect(screen.getByRole("button", { name: "Retry chat history" })).toBeEnabled();
    const outputs = JSON.stringify([context.client.getQueryCache().getAll().map((q) => q.queryKey), useAiChatStore.getState(), localStorage, sessionStorage, document.body.textContent, view.error.mock.calls]);
    expect(outputs).not.toContain(A); expect(outputs).not.toContain(B);
    expect(api.askAi).not.toHaveBeenCalled(); expect(api.confirmAiModificationPlan).not.toHaveBeenCalled(); expect(api.discardAiGeneration).not.toHaveBeenCalled();
  });
  it("new token Ask feedback is visible in its active entry but retained feedback stays hidden on remount", async () => {
    const context = setup();
    vi.mocked(api.askAi).mockImplementation(async (request) => ({ ...askResponses.clarification, requestId: request.requestId! }));
    const hook = renderHook(() => useAiChat(pageId, bound(A)), { wrapper: context.wrapper });
    await act(async () => { await hook.result.current.sendUnifiedAsk({ instruction: "New instruction" }); });
    expect(hook.result.current.visibleMessages.some((m) => m.content === "Review the result.")).toBe(true);
    hook.unmount(); onlineManager.setOnline(false);
    const second = renderHook(() => useAiChat(pageId, bound(A)), { wrapper: context.wrapper });
    expect(second.result.current.visibleMessages).toEqual([]);
  });

  it("R07/R15 Chat history Retry verifies through GET and restores fresh titles without replaying mutations", async () => {
    const context = setup(); await cachedChat(context);
    vi.mocked(api.listAiConversations).mockRejectedValue(http(500));
    render(<AiChat currentPageId={pageId} pageAccess={bound(A)} />, { wrapper: context.wrapper });
    fireEvent.click(screen.getByRole("button", { name: /History/ }));
    const retry = await screen.findByRole("button", { name: "Retry chat history" });
    expect(screen.queryByText("OLD_PROTECTED_TITLE")).toBeNull();
    vi.mocked(api.listAiConversations).mockResolvedValue({ items: [{ ...conversation, title: "UI_RETRIED_TITLE" }], nextCursor: null });
    fireEvent.click(retry); await screen.findByText("UI_RETRIED_TITLE");
    expect(api.askAi).not.toHaveBeenCalled(); expect(api.confirmAiModificationPlan).not.toHaveBeenCalled(); expect(api.discardAiGeneration).not.toHaveBeenCalled();
  });

  it("retained local generation overlays stay hidden after an active-session transient history failure", async () => {
    const context = setup();
    const plan = { ...foundationGeneration, capability: "GENERATE_PAGE_MODIFICATION_PLAN" as const, output_data: askResponses.plan.planning.plan };
    vi.mocked(api.askAi).mockImplementation(async (request) => ({ ...askResponses.plan, requestId: request.requestId! }));
    vi.mocked(api.getAiGeneration).mockResolvedValue(plan);
    const hook = renderHook(() => useAiChat(pageId, bound(A)), { wrapper: context.wrapper });
    await act(async () => { await hook.result.current.sendUnifiedAsk({ instruction: "Add QA" }); });
    await waitFor(() => expect(hook.result.current.historyAccessVerified).toBe(true));
    expect(hook.result.current.visibleMessages.some((m) => m.generation)).toBe(true);
    vi.mocked(api.listAiConversationMessages).mockRejectedValue(http(500));
    await act(async () => { await hook.result.current.messagesQuery.refetch(); });
    await waitFor(() => expect(hook.result.current.messagesQuery.isError).toBe(true));
    expect(useAiChatStore.getState().threads[hook.result.current.chatScope].messages.some((m) => m.generation)).toBe(true);
    expect(hook.result.current.visibleMessages).toEqual([]);
    expect(hook.result.current.canReadGeneration(plan.id)).toBe(false); expect(hook.result.current.accessDenied).toBe(false);
  });

  it("R15 real protected generation content and enabled draft actions disappear on offline remount", async () => {
    const context = setup();
    const plan = { ...foundationGeneration, capability: "GENERATE_PAGE_MODIFICATION_PLAN" as const, output_data: { ...askResponses.plan.planning.plan, summary: "OLD_PROTECTED_PLAN" } };
    vi.mocked(api.listAiConversationMessages).mockResolvedValue({ items: [serverMessage("OLD_PROTECTED_PLAN_MESSAGE", "ASSISTANT", { generationId: plan.id, capability: plan.capability })], nextCursor: null });
    vi.mocked(api.listAiConversationGenerations).mockResolvedValue({ items: [plan], nextCursor: null });
    saveSelectedAiConversation(aiHistorySelectionKey("user-1", workspaceId, pageId, getAiAccessIdentity(A)), conversationId);
    const first = render(<AiChat currentPageId={pageId} pageAccess={bound(A)} />, { wrapper: context.wrapper });
    await waitFor(() => expect(screen.getByRole("button", { name: "Apply changes" })).toBeEnabled());
    expect(screen.getByText("OLD_PROTECTED_PLAN")).toBeInTheDocument(); first.unmount();
    onlineManager.setOnline(false); render(<AiChat currentPageId={pageId} pageAccess={bound(A)} />, { wrapper: context.wrapper });
    fireEvent.click(screen.getByRole("button", { name: /History/ }));
    expect(screen.queryByText("OLD_PROTECTED_PLAN")).toBeNull(); expect(screen.queryByText("OLD_PROTECTED_PLAN_MESSAGE")).toBeNull();
    expect(screen.queryByRole("button", { name: "Apply changes" })).toBeNull(); expect(screen.queryByRole("button", { name: /Page modification/ })).toBeNull();
    expect(api.confirmAiModificationPlan).not.toHaveBeenCalled(); expect(api.discardAiGeneration).not.toHaveBeenCalled();
  });

});
