import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError } from "axios";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "@/entities/ai-assistant/api/ai-assistant.api";
import type { AiConversation, AiConversationsFilter, AiHistoryPage } from "@/entities/ai-assistant/model/ai-assistant.types";
import { aiHistoryKeys } from "@/entities/ai-assistant/model/ai-assistant.queries";
import { useAiChat } from "@/widgets/ai-chat/model/use-ai-chat";
import { aiHistorySelectionKey, saveSelectedAiConversation } from "@/widgets/ai-chat/model/ai-history-selection";
import { getAiChatScope, useAiChatStore } from "@/widgets/ai-chat/model/use-ai-chat-store";
import { AiChatHome } from "@/widgets/ai-chat/ui/AiChatHome";
import { AiChatHistory } from "@/widgets/ai-chat/ui/AiChatHistory";
import { foundationConversation, foundationGeneration, serverMessage } from "../unit/ai-foundation.fixtures";
import { conversationId, workspaceId } from "../unit/ai-ask.fixtures";

const view = vi.hoisted(() => ({
  user: { id: "user-1", lastActiveWorkspaceId: "22222222-2222-4222-8222-222222222222" },
  pageWorkspace: "22222222-2222-4222-8222-222222222222", push: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: view.push }) }));
vi.mock("@/features/auth", () => ({ useUser: () => ({ user: view.user }) }));
vi.mock("@/entities/workspace/model/workspace.queries", () => ({
  useWorkspaces: () => ({ data: [{ id: "22222222-2222-4222-8222-222222222222" }, { id: "workspace-b" }] }),
}));
vi.mock("@/entities/page/model/page.queries", () => ({
  usePage: (id?: string) => ({ data: id ? { id, workspace_id: view.pageWorkspace } : undefined }),
  pageKeys: { byWorkspace: (id: string) => ["pages", id], detail: (id: string) => ["page", id] },
}));
vi.mock("@/entities/ai-assistant/api/ai-assistant.api");
// Presentation-only replacements; list UI, hook, queries, mutations and store are real.
vi.mock("@/widgets/ai-chat/ui/AiChatComposer", () => ({ AiChatComposer: () => null }));
vi.mock("@/widgets/ai-chat/ui/AiMessageItem", () => ({ AiAssistantAvatar: () => null }));

type Chat = ReturnType<typeof useAiChat>;
const globalChat: AiConversation = { ...foundationConversation, title: "PROTECTED_GLOBAL_TITLE" };
const pageChat: AiConversation = { ...foundationConversation, id: "page-conversation", scope: "PAGE", page_id: "page-a", title: "PROTECTED_PAGE_TITLE" };
const data = <T,>(items: T[], nextCursor: string | null = null) => ({ pages: [{ items, nextCursor }], pageParams: [null] });
const filters = (scope: "GLOBAL" | "PAGE", pageId?: string, workspace = workspaceId): AiConversationsFilter =>
  ({ workspaceId: workspace, scope, ...(pageId ? { pageId } : {}) });
const listKey = (scope: "GLOBAL" | "PAGE", pageId?: string, user = "user-1", workspace = workspaceId) =>
  aiHistoryKeys.conversations(user, filters(scope, pageId, workspace));
const http = (status: number) => new AxiosError("private backend exception", "ERR_BAD_RESPONSE", undefined, undefined, { status } as never);
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const clients: QueryClient[] = [];
function setup(page?: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity, retryDelay: 0 }, mutations: { retry: false } } });
  clients.push(client);
  const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  const selected = page ? { ...pageChat, id: conversationId, page_id: page } : globalChat;
  saveSelectedAiConversation(aiHistorySelectionKey("user-1", workspaceId, page), conversationId);
  client.setQueryData(aiHistoryKeys.conversation("user-1", conversationId), selected);
  client.setQueryData(aiHistoryKeys.messages("user-1", conversationId), data([serverMessage("saved", "USER")]));
  client.setQueryData(aiHistoryKeys.generations("user-1", conversationId), data([foundationGeneration]));
  client.setQueryData(listKey(page ? "PAGE" : "GLOBAL", page), data([selected]));
  if (!page) client.setQueryData(listKey("PAGE"), data([pageChat]));
  const protectedKeys = [aiHistoryKeys.conversation("user-1", conversationId), aiHistoryKeys.messages("user-1", conversationId), aiHistoryKeys.generations("user-1", conversationId)];
  const protectedData = protectedKeys.map((key) => client.getQueryData(key));
  const preserved = () => {
    protectedKeys.forEach((key, i) => expect(client.getQueryData(key)).toEqual(protectedData[i]));
    expect(useAiChatStore.getState().accessDenials).toEqual([]);
    for (const mutation of [api.askAi, api.createAiConversation, api.submitAiMessage, api.confirmPageComposition, api.confirmAiModificationPlan, api.discardAiGeneration])
      expect(mutation).not.toHaveBeenCalled();
  };
  return { client, wrapper, preserved };
}
function mount(page?: string) {
  const context = setup(page);
  return { ...context, ...renderHook(({ page }: { page?: string }) => useAiChat(page), { initialProps: { page }, wrapper: context.wrapper }) };
}
function History({ page }: { page: string }) {
  const chat = useAiChat(page);
  return <AiChatHistory conversations={chat.conversations} generations={chat.savedGenerations}
    selectedConversationId={chat.selectedConversationId} loading={chat.conversationsQuery.isPending} error={chat.conversationsQuery.isError}
    conversationsDenied={chat.conversationsQuery.isAccessDenied} onRetryConversations={() => { void chat.conversationsQuery.refetch(); }}
    hasMoreConversations={Boolean(chat.conversationsQuery.hasNextPage)} hasMoreGenerations={false}
    loadingMoreConversations={false} loadingMoreGenerations={false} disabled={chat.isPending}
    onSelectConversation={chat.selectHistoryConversation} onNewChat={chat.startNewChat}
    onLoadConversations={() => { void chat.conversationsQuery.fetchNextPage(); }} onLoadGenerations={vi.fn()} onOpenGeneration={vi.fn()} />;
}
async function refetch(client: QueryClient, key: ReturnType<typeof listKey>) {
  await act(async () => { await client.refetchQueries({ queryKey: key, exact: true }); });
}
beforeEach(() => {
  vi.resetAllMocks(); localStorage.clear(); useAiChatStore.setState(useAiChatStore.getInitialState(), true);
  view.user = { id: "user-1", lastActiveWorkspaceId: workspaceId }; view.pageWorkspace = workspaceId;
  vi.mocked(api.getAiConversation).mockResolvedValue(globalChat);
  vi.mocked(api.listAiConversations).mockResolvedValue({ items: [], nextCursor: null });
  vi.mocked(api.listAiConversationMessages).mockResolvedValue({ items: [], nextCursor: null });
  vi.mocked(api.listAiConversationGenerations).mockResolvedValue({ items: [], nextCursor: null });
});
afterEach(() => { cleanup(); clients.splice(0).forEach((client) => client.clear()); });

describe("FIX06 follow-up list authorization visibility and scope isolation", () => {
  it.each([["GLOBAL", 403], ["GLOBAL", 404], ["PAGE", 403], ["PAGE", 404]] as const)(
    "Dashboard cached %s list -> refetch %s hides only that list in hook and real Home", async (scope, status) => {
      const context = mount();
      render(<AiChatHome />, { wrapper: context.wrapper });
      expect(screen.getByText(globalChat.title!)).toBeInTheDocument();
      expect(screen.getByText(pageChat.title!)).toBeInTheDocument();
      const protectedChat = scope === "GLOBAL" ? globalChat : pageChat;
      const independent = scope === "GLOBAL" ? pageChat : globalChat;
      const independentCache = context.client.getQueryData(listKey(scope === "GLOBAL" ? "PAGE" : "GLOBAL"));
      vi.mocked(api.listAiConversations).mockRejectedValue(http(status));
      await refetch(context.client, listKey(scope));
      await waitFor(() => expect(context.result.current.conversations.map((item) => item.title)).not.toContain(protectedChat.title));
      expect(screen.queryByText(protectedChat.title!)).toBeNull();
      expect(document.body.innerHTML).not.toContain(protectedChat.title);
      expect(screen.getByText(independent.title!)).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveTextContent("Unable to load chat history.");
      expect(context.client.getQueryData(listKey(scope === "GLOBAL" ? "PAGE" : "GLOBAL"))).toEqual(independentCache);
      expect(JSON.stringify(context.client.getQueryData(listKey(scope)))).not.toContain(protectedChat.title);
      expect(api.listAiConversations).toHaveBeenCalledTimes(1);
      expect(context.result.current.accessDenied).toBe(false);
      expect(context.result.current.selectedConversationId).toBe(conversationId);
      context.preserved();
      // Replaying cached-success and remounting are not new authorization evidence.
      act(() => context.client.setQueryData(listKey(scope), data([protectedChat])));
      context.rerender({ page: undefined });
      expect(context.result.current.conversations.map((item) => item.title)).not.toContain(protectedChat.title);
      expect(document.body.innerHTML).not.toContain(protectedChat.title);
      context.unmount();
      const remounted = renderHook(() => useAiChat(), { wrapper: context.wrapper });
      expect(remounted.result.current.conversations.map((item) => item.title)).not.toContain(protectedChat.title);
      expect(api.listAiConversations).toHaveBeenCalledTimes(1);
    });

  it.each([403, 404])("Page-specific History %s removes title, tooltip and selection target, preserving Page B", async (status) => {
    const context = setup("page-a");
    const independentKey = listKey("PAGE", "page-b");
    const independentData = data([{ ...pageChat, id: "page-b-conversation", page_id: "page-b" }]);
    context.client.setQueryData(independentKey, independentData);
    render(<History page="page-a" />, { wrapper: context.wrapper });
    fireEvent.click(screen.getByRole("button", { name: /History/ }));
    expect(screen.getByTitle(pageChat.title!)).toBeInTheDocument();
    vi.mocked(api.listAiConversations).mockRejectedValue(http(status));
    await refetch(context.client, listKey("PAGE", "page-a"));
    await waitFor(() => expect(screen.queryByText(pageChat.title!)).toBeNull());
    expect(screen.queryByTitle(pageChat.title!)).toBeNull();
    expect(screen.queryByRole("button", { name: new RegExp(pageChat.title!) })).toBeNull();
    expect(document.body.innerHTML).not.toContain(pageChat.title);
    expect(screen.getByRole("alert")).toHaveTextContent("Unable to load chat history.");
    expect(context.client.getQueryData(independentKey)).toEqual(independentData);
    expect(useAiChatStore.getState().threads[getAiChatScope("page-a", workspaceId, "user-1")].conversationId).toBe(conversationId);
    context.preserved();
  });

  it.each([403, 404])("late success ignoring AbortSignal cannot restore a list denied with %s; fresh explicit refetch recovers", async (status) => {
    const context = mount();
    const old = deferred<AiHistoryPage<AiConversation>>();
    let oldSignal: AbortSignal | undefined;
    vi.mocked(api.listAiConversations).mockImplementationOnce((_filters, _cursor, signal) => { oldSignal = signal; return old.promise; });
    let oldFetch!: Promise<void>;
    act(() => { oldFetch = context.client.refetchQueries({ queryKey: listKey("GLOBAL"), exact: true }); });
    await waitFor(() => expect(api.listAiConversations).toHaveBeenCalledTimes(1));
    vi.mocked(api.listAiConversations).mockRejectedValue(http(status));
    await refetch(context.client, listKey("GLOBAL"));
    await waitFor(() => expect(context.result.current.conversations.map((item) => item.title)).not.toContain(globalChat.title));
    await act(async () => { old.resolve({ items: [globalChat], nextCursor: "old-cursor" }); await oldFetch; });
    expect(oldSignal?.aborted).toBe(true);
    expect(context.result.current.conversations.map((item) => item.title)).not.toContain(globalChat.title);
    expect(JSON.stringify(context.client.getQueryData(listKey("GLOBAL")))).not.toContain(globalChat.title);
    // Do not use stale cached pages/cursors to recover.
    act(() => context.client.setQueryData(listKey("GLOBAL"), data([globalChat], "old-cursor")));
    const fresh = deferred<AiHistoryPage<AiConversation>>();
    vi.mocked(api.listAiConversations).mockReturnValue(fresh.promise);
    let recovery!: ReturnType<Chat["conversationsQuery"]["refetch"]>;
    act(() => { recovery = context.result.current.conversationsQuery.refetch(); });
    expect(context.result.current.conversations.map((item) => item.title)).not.toContain(globalChat.title);
    const verified = { ...globalChat, title: "FRESH_VERIFIED_TITLE" };
    await act(async () => { fresh.resolve({ items: [verified], nextCursor: "fresh-cursor" }); await recovery; });
    await waitFor(() => expect(context.result.current.conversations.map((item) => item.title)).toContain(verified.title));
    expect(context.result.current.conversationsQuery.isError).toBe(false);
    expect(api.listAiConversations).toHaveBeenLastCalledWith(filters("GLOBAL"), undefined, expect.any(AbortSignal));
    vi.mocked(api.listAiConversations).mockResolvedValue({ items: [{ ...globalChat, id: "next", title: "NEXT_AUTHORIZED_TITLE" }], nextCursor: null });
    await act(async () => { await context.result.current.conversationsQuery.fetchNextPage(); });
    await waitFor(() => expect(context.result.current.conversations.map((item) => item.title)).toContain("NEXT_AUTHORIZED_TITLE"));
    expect(api.listAiConversations).toHaveBeenLastCalledWith(filters("GLOBAL"), "fresh-cursor", expect.any(AbortSignal));
    expect(context.result.current.conversations.map((item) => item.title)).not.toContain(globalChat.title);
    context.preserved();
  });

  it.each(["user", "workspace", "page", "selection"] as const)("late denial after %s navigation belongs only to the original query identity", async (change) => {
    const initialPage = change === "page" ? "page-a" : undefined;
    const context = mount(initialPage);
    const originKey = listKey(initialPage ? "PAGE" : "GLOBAL", initialPage);
    const old = deferred<AiHistoryPage<AiConversation>>();
    vi.mocked(api.listAiConversations).mockReturnValue(old.promise);
    let pending!: Promise<void>;
    act(() => { pending = context.client.refetchQueries({ queryKey: originKey, exact: true }); });
    await waitFor(() => expect(api.listAiConversations).toHaveBeenCalledTimes(1));
    if (change === "user") view.user = { ...view.user, id: "user-b" };
    if (change === "workspace") view.user = { ...view.user, lastActiveWorkspaceId: "workspace-b" };
    const nextPage = change === "page" ? "page-b" : initialPage;
    const nextWorkspace = view.user.lastActiveWorkspaceId;
    const nextListKey = listKey(nextPage ? "PAGE" : "GLOBAL", nextPage, view.user.id, nextWorkspace);
    if (change !== "selection") {
      context.client.setQueryData(nextListKey, data([{ ...globalChat, id: "independent", workspace_id: nextWorkspace, title: "INDEPENDENT_TITLE",
        ...(nextPage ? { scope: "PAGE", page_id: nextPage } : {}) }]));
      context.client.setQueryData(listKey("PAGE", undefined, view.user.id, nextWorkspace), data([]));
    } else {
      context.client.setQueryData(aiHistoryKeys.conversation("user-1", "selected-b"), { ...globalChat, id: "selected-b" });
      context.client.setQueryData(aiHistoryKeys.messages("user-1", "selected-b"), data([]));
      context.client.setQueryData(aiHistoryKeys.generations("user-1", "selected-b"), data([]));
      act(() => { context.result.current.selectHistoryConversation("selected-b"); });
    }
    context.rerender({ page: nextPage });
    await act(async () => { old.reject(http(403)); await pending; });
    if (change !== "selection") {
      expect(context.result.current.conversations.map((item) => item.title)).toContain("INDEPENDENT_TITLE");
      expect(context.client.getQueryData(nextListKey)).toBeDefined();
    } else {
      expect(context.result.current.selectedConversationId).toBe("selected-b");
      expect(context.result.current.conversationDetailQuery.isSuccess).toBe(true);
    }
    expect(context.result.current.accessDenied).toBe(false);
    context.preserved();
  });

  it.each([400, 401, 409, 429, 500, 502, "timeout"] as const)("%s list error preserves cache and never creates resource denial", async (status) => {
    const context = mount();
    const cached = context.client.getQueryData(listKey("GLOBAL"));
    expect(context.result.current.conversationsQuery.isError).toBe(false);
    vi.mocked(api.listAiConversations).mockRejectedValue(status === "timeout" ? new AxiosError("private timeout", "ECONNABORTED") : http(status));
    await refetch(context.client, listKey("GLOBAL"));
    await waitFor(() => expect(context.result.current.conversationsQuery.isError).toBe(true));
    expect(context.client.getQueryData(listKey("GLOBAL"))).toEqual(cached);
    expect(context.result.current.conversations.map((item) => item.title)).toContain(globalChat.title);
    expect(context.result.current.accessDenied).toBe(false);
    context.preserved();
  });

  it("Home Retry reauthorizes only the denied list and keeps independent PAGE history visible", async () => {
    const context = setup();
    render(<AiChatHome />, { wrapper: context.wrapper });
    vi.mocked(api.listAiConversations).mockRejectedValue(http(403));
    await refetch(context.client, listKey("GLOBAL"));
    expect(screen.getByText(pageChat.title!)).toBeInTheDocument();
    vi.mocked(api.listAiConversations).mockResolvedValue({ items: [{ ...globalChat, title: "REAUTHORIZED_GLOBAL" }], nextCursor: null });
    fireEvent.click(await screen.findByRole("button", { name: "Retry chat history" }));
    await screen.findByText("REAUTHORIZED_GLOBAL");
    expect(screen.queryByText(globalChat.title!)).toBeNull();
    expect(screen.getByText(pageChat.title!)).toBeInTheDocument();
    expect(api.listAiConversations).toHaveBeenCalledTimes(2);
    context.preserved();
  });

  it("History Retry recovers Page A from page one without revoking independently authorized detail", async () => {
    const context = setup("page-a");
    render(<History page="page-a" />, { wrapper: context.wrapper });
    fireEvent.click(screen.getByRole("button", { name: /History/ }));
    vi.mocked(api.listAiConversations).mockRejectedValue(http(404));
    await refetch(context.client, listKey("PAGE", "page-a"));
    await screen.findByRole("alert");
    vi.mocked(api.listAiConversations).mockResolvedValue({ items: [{ ...pageChat, title: "REAUTHORIZED_PAGE" }], nextCursor: null });
    fireEvent.click(screen.getByRole("button", { name: "Retry chat history" }));
    await screen.findByTitle("REAUTHORIZED_PAGE");
    expect(api.listAiConversations).toHaveBeenLastCalledWith(filters("PAGE", "page-a"), undefined, expect.any(AbortSignal));
    context.preserved();
  });

  it("History visibility barrier rejects stale entry props and tooltip while retaining independent draft access", () => {
    const select = vi.fn();
    render(<AiChatHistory conversations={[pageChat]} conversationsDenied generations={[]} selectedConversationId={conversationId}
      loading={false} error hasMoreConversations hasMoreGenerations={false} loadingMoreConversations={false}
      loadingMoreGenerations={false} disabled={false} onSelectConversation={select} onNewChat={vi.fn()}
      onLoadConversations={vi.fn()} onLoadGenerations={vi.fn()} onOpenGeneration={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /History/ }));
    expect(document.body.innerHTML).not.toContain(pageChat.title);
    expect(screen.queryByRole("button", { name: "Load more conversations" })).toBeNull();
    expect(select).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Unable to load chat history.");
  });

  it.each([403, 404])("pagination %s removes all prior cached pages, not only the denied next page", async (status) => {
    const context = mount();
    act(() => context.client.setQueryData(listKey("GLOBAL"), {
      pages: [{ items: [globalChat], nextCursor: "page-two" }, { items: [{ ...globalChat, id: "second", title: "PROTECTED_SECOND_TITLE" }], nextCursor: "page-three" }],
      pageParams: [null, "page-two"],
    }));
    vi.mocked(api.listAiConversations).mockRejectedValue(http(status));
    await act(async () => { await context.result.current.conversationsQuery.fetchNextPage(); });
    await waitFor(() => expect(context.result.current.conversations.map((item) => item.title)).toEqual([pageChat.title]));
    expect(JSON.stringify(context.client.getQueryData(listKey("GLOBAL")))).not.toContain("PROTECTED");
    expect(api.listAiConversations).toHaveBeenLastCalledWith(filters("GLOBAL"), "page-three", expect.any(AbortSignal));
    expect(api.listAiConversations).toHaveBeenCalledTimes(1);
    context.preserved();
  });

  it("failed recovery and list GC/remount cannot use cached-success to clear the barrier", async () => {
    const context = mount();
    vi.mocked(api.listAiConversations).mockRejectedValue(http(403));
    await refetch(context.client, listKey("GLOBAL"));
    await waitFor(() => expect(context.result.current.conversations.map((item) => item.title)).not.toContain(globalChat.title));
    vi.mocked(api.listAiConversations).mockRejectedValue(http(500));
    await act(async () => { await context.result.current.conversationsQuery.refetch(); });
    expect(api.listAiConversations).toHaveBeenCalledTimes(5); // one denial; existing transient policy permits three retries
    expect(context.result.current.conversations.map((item) => item.title)).not.toContain(globalChat.title);
    context.unmount();
    act(() => {
      context.client.removeQueries({ queryKey: listKey("GLOBAL"), exact: true });
      context.client.setQueryData(listKey("GLOBAL"), data([globalChat]));
    });
    const remounted = renderHook(() => useAiChat(), { wrapper: context.wrapper });
    expect(remounted.result.current.conversations.map((item) => item.title)).not.toContain(globalChat.title);
    expect(api.listAiConversations).toHaveBeenCalledTimes(5);
    context.preserved();
  });

  it("a cancelled old success completing after fresh recovery cannot overwrite verified history", async () => {
    const context = mount();
    const old = deferred<AiHistoryPage<AiConversation>>();
    vi.mocked(api.listAiConversations).mockReturnValueOnce(old.promise);
    let oldFetch!: Promise<void>;
    act(() => { oldFetch = context.client.refetchQueries({ queryKey: listKey("GLOBAL"), exact: true }); });
    vi.mocked(api.listAiConversations).mockRejectedValue(http(403));
    await refetch(context.client, listKey("GLOBAL"));
    await waitFor(() => expect(context.result.current.conversations.map((item) => item.title)).not.toContain(globalChat.title));
    vi.mocked(api.listAiConversations).mockResolvedValue({ items: [{ ...globalChat, title: "FRESH_HISTORY" }], nextCursor: null });
    await act(async () => { await context.result.current.conversationsQuery.refetch(); });
    await waitFor(() => expect(context.result.current.conversations.map((item) => item.title)).toContain("FRESH_HISTORY"));
    await act(async () => { old.resolve({ items: [globalChat], nextCursor: null }); await oldFetch; });
    expect(context.result.current.conversations.map((item) => item.title)).toContain("FRESH_HISTORY");
    expect(JSON.stringify(context.client.getQueryData(listKey("GLOBAL")))).not.toContain(globalChat.title);
    context.preserved();
  });

  it.each([403, 404])("old %s after successful Retry cannot erase fresh verified history or independent lists", async (status) => {
    const context = mount();
    const key = listKey("GLOBAL");
    const accessKey = ["ai-conversation-list-access", ...key.slice(1)];
    const pageAccessKey = ["ai-conversation-list-access", ...listKey("PAGE").slice(1)];
    const independentKeys = [listKey("GLOBAL", undefined, "user-b"), listKey("GLOBAL", undefined, "user-1", "workspace-b")];
    independentKeys.forEach((independentKey) => {
      context.client.setQueryData(independentKey, data([{ ...globalChat, title: "INDEPENDENT_TITLE" }]));
      context.client.setQueryData(["ai-conversation-list-access", ...independentKey.slice(1)], { epoch: 7, denied: false });
    });
    act(() => context.client.setQueryData(key, data([{ ...globalChat, title: "OLD_PROTECTED_TITLE" }], "old-cursor")));
    render(<AiChatHome />, { wrapper: context.wrapper });
    expect(screen.getByText("OLD_PROTECTED_TITLE")).toBeInTheDocument();
    const old = deferred<AiHistoryPage<AiConversation>>();
    let oldSignal: AbortSignal | undefined;
    vi.mocked(api.listAiConversations).mockImplementationOnce((_filters, _cursor, signal) => { oldSignal = signal; return old.promise; });
    let oldFetch!: Promise<void>;
    act(() => { oldFetch = context.client.refetchQueries({ queryKey: key, exact: true }); });
    expect(api.listAiConversations).toHaveBeenCalledTimes(1);
    expect(oldSignal?.aborted).toBe(false);
    vi.mocked(api.listAiConversations).mockRejectedValueOnce(http(status));
    await refetch(context.client, key);
    await waitFor(() => expect(context.result.current.conversationsQuery.isAccessDenied).toBe(true));
    expect(oldSignal?.aborted).toBe(true);
    expect(context.client.getQueryData(accessKey)).toEqual({ epoch: 1, denied: true });
    expect(context.client.getQueryData(key)).toEqual({ pages: [], pageParams: [] });
    expect(screen.queryByText("OLD_PROTECTED_TITLE")).toBeNull();
    // PAGE succeeds independently while GLOBAL's cancelled transport remains pending.
    vi.mocked(api.listAiConversations).mockResolvedValueOnce({ items: [{ ...pageChat, title: "FRESH_PAGE_TITLE" }], nextCursor: null });
    await refetch(context.client, listKey("PAGE"));
    await screen.findByText("FRESH_PAGE_TITLE");
    const pageCache = context.client.getQueryData(listKey("PAGE"));
    const pageAccess = context.client.getQueryData(pageAccessKey);
    const independentCaches = independentKeys.map((independentKey) => context.client.getQueryData(independentKey));
    vi.mocked(api.listAiConversations).mockResolvedValueOnce({ items: [{ ...globalChat, title: "FRESH_VERIFIED_TITLE" }], nextCursor: "fresh-cursor" });
    fireEvent.click(screen.getByRole("button", { name: "Retry chat history" }));
    await screen.findByText("FRESH_VERIFIED_TITLE");
    await waitFor(() => expect(context.result.current.conversationsQuery.isAccessDenied).toBe(false));
    expect(context.client.getQueryData(accessKey)).toEqual({ epoch: 1, denied: false });
    expect(api.listAiConversations).toHaveBeenLastCalledWith(filters("GLOBAL"), undefined, expect.any(AbortSignal));
    const freshCache = context.client.getQueryData(key);
    const cancel = vi.spyOn(context.client, "cancelQueries");
    const write = vi.spyOn(context.client, "setQueryData");
    await act(async () => { old.reject(http(status)); await oldFetch; });
    // Assert cache first: RED must demonstrate loss of the newly verified data.
    expect(context.client.getQueryData(key)).toEqual(freshCache);
    expect(context.client.getQueryData(accessKey)).toEqual({ epoch: 1, denied: false });
    expect(context.result.current.conversationsQuery.isAccessDenied).toBe(false);
    expect(screen.getByText("FRESH_VERIFIED_TITLE")).toBeInTheDocument();
    expect(document.body.innerHTML).not.toContain("OLD_PROTECTED_TITLE");
    expect(cancel).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
    expect(api.listAiConversations).toHaveBeenCalledTimes(4);
    expect(context.client.getQueryData(listKey("PAGE"))).toBe(pageCache);
    expect(context.client.getQueryData(pageAccessKey)).toBe(pageAccess);
    independentKeys.forEach((independentKey, i) => {
      expect(context.client.getQueryData(independentKey)).toBe(independentCaches[i]);
      expect(context.client.getQueryData(["ai-conversation-list-access", ...independentKey.slice(1)])).toEqual({ epoch: 7, denied: false });
    });
    context.preserved();
  });

  it.each([403, 404])("old %s cannot cancel an explicit Retry still awaiting fresh authorization", async (status) => {
    const context = mount();
    const key = listKey("GLOBAL");
    const accessKey = ["ai-conversation-list-access", ...key.slice(1)];
    const old = deferred<AiHistoryPage<AiConversation>>();
    vi.mocked(api.listAiConversations).mockReturnValueOnce(old.promise);
    let oldFetch!: Promise<void>;
    act(() => { oldFetch = context.client.refetchQueries({ queryKey: key, exact: true }); });
    vi.mocked(api.listAiConversations).mockRejectedValueOnce(http(status));
    await refetch(context.client, key);
    await waitFor(() => expect(context.result.current.conversationsQuery.isAccessDenied).toBe(true));
    const fresh = deferred<AiHistoryPage<AiConversation>>();
    let freshSignal: AbortSignal | undefined;
    vi.mocked(api.listAiConversations).mockImplementationOnce((_filters, _cursor, signal) => { freshSignal = signal; return fresh.promise; });
    let recovery!: ReturnType<Chat["conversationsQuery"]["refetch"]>;
    act(() => { recovery = context.result.current.conversationsQuery.refetch(); });
    const cancel = vi.spyOn(context.client, "cancelQueries");
    const write = vi.spyOn(context.client, "setQueryData");
    await act(async () => { old.reject(http(status)); await oldFetch; });
    const lateEffects = { aborted: freshSignal?.aborted, marker: context.client.getQueryData(accessKey), cancels: cancel.mock.calls.length, writes: write.mock.calls.length };
    // Always settle C before asserting so even RED leaves no outstanding transport.
    await act(async () => { fresh.resolve({ items: [{ ...globalChat, title: "FRESH_VERIFIED_TITLE" }], nextCursor: null }); await recovery; });
    expect(lateEffects).toEqual({ aborted: false, marker: { epoch: 1, denied: true }, cancels: 0, writes: 0 });
    await waitFor(() => expect(context.result.current.conversations.map((item) => item.title)).toContain("FRESH_VERIFIED_TITLE"));
    expect(context.client.getQueryData(accessKey)).toEqual({ epoch: 1, denied: false });
    expect(api.listAiConversations).toHaveBeenCalledTimes(3);
    context.preserved();
  });

  it.each([403, 404])("cancelled %s cannot deny a successful replacement in the same epoch", async (status) => {
    const context = mount();
    const key = listKey("GLOBAL");
    const accessKey = ["ai-conversation-list-access", ...key.slice(1)];
    const old = deferred<AiHistoryPage<AiConversation>>();
    let oldSignal: AbortSignal | undefined;
    vi.mocked(api.listAiConversations).mockImplementationOnce((_filters, _cursor, signal) => { oldSignal = signal; return old.promise; });
    let oldFetch!: Promise<void>;
    act(() => { oldFetch = context.client.refetchQueries({ queryKey: key, exact: true }); });
    vi.mocked(api.listAiConversations).mockResolvedValueOnce({ items: [{ ...globalChat, title: "FRESH_VERIFIED_TITLE" }], nextCursor: null });
    await refetch(context.client, key);
    await waitFor(() => expect(context.result.current.conversations.map((item) => item.title)).toContain("FRESH_VERIFIED_TITLE"));
    expect(oldSignal?.aborted).toBe(true);
    expect(context.client.getQueryData(accessKey)).toEqual({ epoch: 0, denied: false });
    const cache = context.client.getQueryData(key);
    const cancel = vi.spyOn(context.client, "cancelQueries");
    await act(async () => { old.reject(http(status)); await oldFetch; });
    expect(context.client.getQueryData(key)).toEqual(cache);
    expect(context.client.getQueryData(accessKey)).toEqual({ epoch: 0, denied: false });
    expect(cancel).not.toHaveBeenCalled();
    expect(api.listAiConversations).toHaveBeenCalledTimes(2);
    context.preserved();
  });

  it.each([403, 404])("fresh Retry %s remains denied and discards replayed pages without automatic retry", async (status) => {
    const context = mount();
    const key = listKey("GLOBAL");
    const accessKey = ["ai-conversation-list-access", ...key.slice(1)];
    vi.mocked(api.listAiConversations).mockRejectedValue(http(status));
    await refetch(context.client, key);
    await waitFor(() => expect(context.result.current.conversationsQuery.isAccessDenied).toBe(true));
    act(() => context.client.setQueryData(key, data([globalChat], "replayed-cursor")));
    await act(async () => { await context.result.current.conversationsQuery.refetch(); });
    expect(context.client.getQueryData(accessKey)).toEqual({ epoch: 2, denied: true });
    expect(context.client.getQueryData(key)).toEqual({ pages: [], pageParams: [] });
    expect(context.result.current.conversations.map((item) => item.title)).not.toContain(globalChat.title);
    expect(api.listAiConversations).toHaveBeenLastCalledWith(filters("GLOBAL"), undefined, expect.any(AbortSignal));
    expect(api.listAiConversations).toHaveBeenCalledTimes(2);
    context.preserved();
  });

  it("authorized Home load-more merges both scopes and selects a conversation", async () => {
    const context = setup();
    context.client.setQueryData(listKey("GLOBAL"), data([globalChat], "global-next"));
    context.client.setQueryData(listKey("PAGE"), data([pageChat], "page-next"));
    vi.mocked(api.listAiConversations).mockImplementation(async (filter, cursor) => ({
      items: [{ ...(filter.scope === "GLOBAL" ? globalChat : pageChat), id: cursor!, title: cursor! }], nextCursor: null,
    }));
    render(<AiChatHome />, { wrapper: context.wrapper });
    fireEvent.click(screen.getByRole("button", { name: "Load more chats" }));
    await screen.findByText("global-next");
    fireEvent.click(screen.getByRole("button", { name: "Load more chats" }));
    await screen.findByText("page-next");
    expect(screen.getByText(globalChat.title!)).toBeInTheDocument();
    expect(screen.getByText(pageChat.title!)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /PROTECTED_PAGE_TITLE/ }));
    expect(view.push).toHaveBeenCalledWith("/dashboard/ai/chat");
    expect(localStorage.getItem(aiHistorySelectionKey("user-1", workspaceId)!)).toBe(pageChat.id);
  });

  it("fresh successful lists cannot revive an individually denied FIX06 conversation", async () => {
    const context = mount();
    act(() => useAiChatStore.getState().denyAccess({ userId: "user-1", workspaceId, conversationId, pageId: null }));
    vi.mocked(api.listAiConversations).mockResolvedValue({ items: [globalChat], nextCursor: null });
    await refetch(context.client, listKey("GLOBAL"));
    expect(context.result.current.conversations.map((item) => item.id)).not.toContain(conversationId);
    expect(context.result.current.conversations.map((item) => item.id)).toContain(pageChat.id);
    expect(useAiChatStore.getState().accessDenials).toHaveLength(1);
  });
});
