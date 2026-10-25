import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError } from "axios";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "@/entities/ai-assistant/api/ai-assistant.api";
import type { AiConversation, AiGeneration } from "@/entities/ai-assistant/model/ai-assistant.types";
import { aiHistoryKeys } from "@/entities/ai-assistant/model/ai-assistant.queries";
import { useAiChat } from "@/widgets/ai-chat/model/use-ai-chat";
import { aiHistorySelectionKey, saveSelectedAiConversation } from "@/widgets/ai-chat/model/ai-history-selection";
import { getAiChatScope, useAiChatStore } from "@/widgets/ai-chat/model/use-ai-chat-store";
import { AiChat } from "@/widgets/ai-chat/ui/AiChat";
import { askResponses, conversationId, generationId, pageId, workspaceId } from "../unit/ai-ask.fixtures";
import { foundationConversation, foundationGeneration, localMessage, serverMessage } from "../unit/ai-foundation.fixtures";

const view = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn(), push: vi.fn(), pageError: null as unknown }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: view.push }) }));
vi.mock("sonner", () => ({ toast: { error: view.error, success: view.success } }));
vi.mock("@/features/auth", () => ({ useUser: () => ({ user: { id: "user-1", lastActiveWorkspaceId: "22222222-2222-4222-8222-222222222222" } }) }));
vi.mock("@/entities/workspace/model/workspace.queries", () => ({ useWorkspaces: () => ({ data: [{ id: "22222222-2222-4222-8222-222222222222" }] }) }));
vi.mock("@/entities/page/model/page.queries", () => ({
  usePage: (id?: string) => ({ data: id ? { id, workspace_id: "22222222-2222-4222-8222-222222222222" } : undefined, error: view.pageError }),
  pageKeys: { byWorkspace: (id: string) => ["pages", id], detail: (id: string) => ["page", id] },
}));
vi.mock("@/entities/ai-assistant/api/ai-assistant.api");
vi.mock("@/widgets/ai-chat/ui/AiChatComposer", () => ({ AiChatComposer: () => null }));
vi.mock("@/widgets/ai-chat/ui/AiChatHistory", () => ({ AiChatHistory: ({ onOpenGeneration }: { onOpenGeneration: (id: string) => void }) =>
  <button onClick={() => onOpenGeneration("55555555-5555-4555-8555-555555555555")}>Open saved draft</button> }));
// Only the visual preview is replaced. The real hook, store, queries, mutations,
// AiChat saved-preview state, message eligibility and action dialog run unchanged.
vi.mock("@/widgets/ai-chat/ui/AiPageCompositionPreview", () => ({ AiPageCompositionPreview: ({ generation, onConfirm, onDiscard }: {
  generation: AiGeneration; onConfirm: (id: string) => void; onDiscard: (id: string) => void;
}) => <div data-testid="protected-preview">{JSON.stringify(generation.output_data)}
  <button onClick={() => onConfirm(generation.id)}>Confirm protected draft</button>
  <button onClick={() => onDiscard(generation.id)}>Discard protected draft</button></div> }));
vi.mock("@/widgets/ai-chat/ui/AiModificationPlanPreview", () => ({ AiModificationPlanPreview: ({ generation, onConfirm, onDiscard }: {
  generation: AiGeneration; onConfirm: (id: string, page: string) => void; onDiscard: (id: string) => void;
}) => <div data-testid="protected-plan">{JSON.stringify(generation.output_data)}
  <button onClick={() => onConfirm(generation.id, "33333333-3333-4333-8333-333333333333")}>Apply protected plan</button>
  <button onClick={() => onDiscard(generation.id)}>Discard protected plan</button></div> }));

const scope = (page?: string, user = "user-1", workspace = workspaceId) => getAiChatScope(page, workspace, user);
const thread = (page?: string) => useAiChatStore.getState().threads[scope(page)];
const key = (page?: string) => aiHistorySelectionKey("user-1", workspaceId, page);
const denied = (status: number) => new AxiosError("private backend exception", "ERR_BAD_RESPONSE", undefined, undefined, { status } as never);
const draft: AiGeneration = { ...foundationGeneration, ...askResponses.composition.generation, capability: "GENERATE_PAGE_COMPOSITION" };
const plan: AiGeneration = { ...foundationGeneration, capability: "GENERATE_PAGE_MODIFICATION_PLAN", output_data: askResponses.plan.planning.plan };
const pageConversation: AiConversation = { ...foundationConversation, scope: "PAGE", page_id: pageId };
const pageData = <T,>(items: T[]) => ({ pages: [{ items, nextCursor: null }], pageParams: [null] });
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const clients: QueryClient[] = [];
function setup(page?: string, generation = draft) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity }, mutations: { retry: false } } });
  clients.push(client);
  const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  saveSelectedAiConversation(key(page), conversationId);
  useAiChatStore.getState().setConversation(scope(page), conversationId, workspaceId);
  useAiChatStore.getState().addMessage(scope(page), localMessage("protected", "assistant", "request-1", {
    content: "protected assistant content", generation,
  }));
  client.setQueryData(aiHistoryKeys.conversation("user-1", conversationId), page ? pageConversation : foundationConversation);
  client.setQueryData(aiHistoryKeys.messages("user-1", conversationId), pageData([
    serverMessage("protected", "ASSISTANT", { generationId, capability: generation.capability }),
  ]));
  client.setQueryData(aiHistoryKeys.generations("user-1", conversationId), pageData([generation]));
  // Same workspace, another conversation; also independent Page/workspace/user scopes.
  const unrelatedScopes = [scope("page-b"), scope(undefined, "user-2"), scope(undefined, "user-1", "workspace-b")];
  for (const other of unrelatedScopes) {
    useAiChatStore.getState().setConversation(other, "conversation-b", workspaceId);
    useAiChatStore.getState().addMessage(other, localMessage("unrelated", "assistant", "other-request", {
      origin: { source: "feedback", feedbackKind: "clarification", localId: "unrelated", conversationId: "conversation-b" },
    }));
  }
  client.setQueryData(aiHistoryKeys.messages("user-1", "conversation-b"), pageData([serverMessage("unrelated", "USER")]));
  const unrelated = () => {
    for (const other of unrelatedScopes) expect(useAiChatStore.getState().threads[other].messages).toHaveLength(1);
    expect(client.getQueryData(aiHistoryKeys.messages("user-1", "conversation-b"))).toBeDefined();
  };
  return { client, wrapper, unrelated };
}
function mount(page?: string, generation = draft) {
  const context = setup(page, generation);
  return { ...context, ...renderHook(() => useAiChat(page), { wrapper: context.wrapper }) };
}
beforeEach(() => {
  vi.resetAllMocks(); localStorage.clear(); useAiChatStore.setState(useAiChatStore.getInitialState(), true);
  view.pageError = null;
  vi.mocked(api.getAiConversation).mockResolvedValue(foundationConversation);
  vi.mocked(api.getAiGeneration).mockResolvedValue(draft);
  vi.mocked(api.listAiConversations).mockResolvedValue({ items: [], nextCursor: null });
  vi.mocked(api.listAiConversationMessages).mockResolvedValue({ items: [], nextCursor: null });
  vi.mocked(api.listAiConversationGenerations).mockResolvedValue({ items: [], nextCursor: null });
});
afterEach(() => { cleanup(); clients.splice(0).forEach((client) => client.clear()); useAiChatStore.setState(useAiChatStore.getInitialState(), true); });

describe("FIX06 authorization denial with real hook/store/query cache", () => {
  it.each(["confirm", "discard"] as const)("%s preflight 403 revokes protected output and cached history", async (action) => {
    const { result, client, unrelated, rerender } = mount();
    vi.mocked(api.getAiGeneration).mockRejectedValue(denied(403));
    await act(async () => { await (action === "confirm" ? result.current.confirmPageComposition(generationId) : result.current.discardGeneration(generationId)); });
    expect(api.confirmPageComposition).not.toHaveBeenCalled(); expect(api.discardAiGeneration).not.toHaveBeenCalled();
    expect(thread().messages).toEqual([]);
    expect(JSON.stringify(client.getQueryData(aiHistoryKeys.generations("user-1", conversationId)))).not.toContain("PAGE_COMPOSITION");
    rerender(); expect(thread().messages).toEqual([]); unrelated();
    expect(view.error).toHaveBeenCalledWith(expect.stringContaining("permission"));
    expect(thread().operation).toBeNull();
  });

  it.each(["confirm", "modify", "discard"] as const)("%s mutation 403 also revokes output", async (action) => {
    const { result, unrelated } = mount(undefined, action === "modify" ? plan : draft);
    vi.mocked(api.getAiGeneration).mockResolvedValue(action === "modify" ? plan : draft);
    vi.mocked(api.confirmPageComposition).mockRejectedValue(denied(403));
    vi.mocked(api.confirmAiModificationPlan).mockRejectedValue(denied(403));
    vi.mocked(api.discardAiGeneration).mockRejectedValue(denied(403));
    await act(async () => { await (action === "confirm" ? result.current.confirmPageComposition(generationId) :
      action === "modify" ? result.current.confirmAiModificationPlan(generationId, pageId) : result.current.discardGeneration(generationId)); });
    expect(action === "confirm" ? api.confirmPageComposition : action === "modify" ? api.confirmAiModificationPlan : api.discardAiGeneration).toHaveBeenCalledTimes(1);
    expect(thread().messages).toEqual([]); unrelated(); expect(view.success).not.toHaveBeenCalled();
  });

  it.each([["messages", 403], ["generations", 403], ["messages", 404], ["generations", 404]] as const)("%s history %s overrides cached-success detail", async (resource, status) => {
    const { result, client, unrelated, rerender } = mount();
    expect(result.current.conversationDetailQuery.isSuccess).toBe(true);
    vi.mocked(resource === "messages" ? api.listAiConversationMessages : api.listAiConversationGenerations).mockRejectedValue(denied(status));
    await act(async () => { await client.refetchQueries({ queryKey: aiHistoryKeys[resource]("user-1", conversationId), exact: true }); });
    await waitFor(() => expect(thread().messages).toEqual([]));
    rerender(); expect(thread().messages).toEqual([]); unrelated();
    expect(result.current.savedGenerations).toEqual([]);
  });

  it.each([403, 404])("detail refresh %s purges cache and messages without retrying Ask", async (status) => {
    const { client, unrelated } = mount();
    vi.mocked(api.getAiConversation).mockRejectedValue(denied(status));
    await act(async () => { await client.refetchQueries({ queryKey: aiHistoryKeys.conversation("user-1", conversationId), exact: true }); });
    await waitFor(() => expect(thread().messages).toEqual([]));
    expect(client.getQueryData(aiHistoryKeys.generations("user-1", conversationId))).toBeUndefined();
    expect(api.askAi).not.toHaveBeenCalled(); expect(api.createAiConversation).not.toHaveBeenCalled(); unrelated();
  });

  it("generation 404 removes only that generation, retaining other turns", async () => {
    const { result, unrelated } = mount();
    act(() => useAiChatStore.getState().addMessage(scope(), localMessage("different-turn", "assistant", "different-request", {
      generation: { ...foundationGeneration, id: "other-generation" },
      origin: { source: "generation-overlay", localId: "different-turn", conversationId, generationId: "other-generation", requestId: "different-request", turnId: "different-turn" },
    })));
    vi.mocked(api.getAiGeneration).mockRejectedValue(denied(404));
    await act(async () => { await result.current.discardGeneration(generationId); });
    expect(thread().messages.some((message) => message.generation?.id === generationId)).toBe(false);
    expect(thread().messages.some((message) => message.generation?.id === "other-generation")).toBe(true); unrelated();
  });

  it.each([400, 409, 429, 500, 502, "timeout"] as const)("%s preserves protected history on non-authorization failure", async (status) => {
    const { result, unrelated } = mount();
    vi.mocked(api.getAiGeneration).mockRejectedValue(status === "timeout" ? new AxiosError("timeout", "ECONNABORTED") : denied(status));
    await act(async () => { await result.current.discardGeneration(generationId); });
    expect(thread().messages.some((message) => message.generation?.id === generationId)).toBe(true); unrelated();
  });

  it("late history success ignoring AbortSignal cannot resurrect revoked output", async () => {
    const { result, client, unrelated } = mount();
    const old = deferred<{ items: AiGeneration[]; nextCursor: null }>();
    vi.mocked(api.listAiConversationGenerations).mockReturnValue(old.promise);
    let refresh!: Promise<void>;
    act(() => { refresh = client.refetchQueries({ queryKey: aiHistoryKeys.generations("user-1", conversationId), exact: true }); });
    vi.mocked(api.getAiGeneration).mockRejectedValue(denied(403));
    await act(async () => { await result.current.discardGeneration(generationId); });
    await act(async () => { old.resolve({ items: [draft], nextCursor: null }); await refresh; });
    expect(thread().messages).toEqual([]); unrelated();
    expect(JSON.stringify(client.getQueryData(aiHistoryKeys.generations("user-1", conversationId)))).not.toContain("PAGE_COMPOSITION");
  });

  it("stale denial from conversation A does not purge selected conversation B", async () => {
    const { result, client, unrelated } = mount();
    client.setQueryData(aiHistoryKeys.conversation("user-1", "conversation-b"), { ...foundationConversation, id: "conversation-b" });
    client.setQueryData(aiHistoryKeys.messages("user-1", "conversation-b"), pageData([{ ...serverMessage("active-b", "USER"), conversation_id: "conversation-b" }]));
    client.setQueryData(aiHistoryKeys.generations("user-1", "conversation-b"), pageData([]));
    const old = deferred<AiGeneration>(); vi.mocked(api.getAiGeneration).mockReturnValue(old.promise);
    let action!: Promise<AiGeneration | null>;
    act(() => { action = result.current.discardGeneration(generationId); });
    act(() => saveSelectedAiConversation(key(), "conversation-b"));
    await act(async () => { old.reject(denied(403)); await action; });
    await waitFor(() => expect(thread().conversationId).toBe("conversation-b"));
    expect(thread().messages.some((message) => message.id === "active-b")).toBe(true); unrelated();
    expect(api.discardAiGeneration).not.toHaveBeenCalled();
  });

  it("modification preflight 403 blocks mutation and protected plan", async () => {
    const { result, unrelated } = mount(undefined, plan);
    vi.mocked(api.getAiGeneration).mockRejectedValue(denied(403));
    await act(async () => { await result.current.confirmAiModificationPlan(generationId, pageId); });
    expect(api.confirmAiModificationPlan).not.toHaveBeenCalled(); expect(thread().messages).toEqual([]); unrelated();
  });

  it.each([403, 404])("Unified Ask %s clears bound output without retry or preview recovery", async (status) => {
    const { result, unrelated } = mount();
    vi.mocked(api.askAi).mockRejectedValue(denied(status));
    await act(async () => { await result.current.sendUnifiedAsk({ instruction: "Private user instruction" }); });
    expect(api.askAi).toHaveBeenCalledTimes(1); expect(thread().messages).toEqual([]);
    expect(thread().operation).toBeNull(); unrelated();
  });

  it.each([403, 404])("Unified preview GET %s does not retain a recovery plan", async (status) => {
    const { result } = mount(pageId, plan);
    vi.mocked(api.getAiConversation).mockResolvedValue(pageConversation);
    vi.mocked(api.askAi).mockImplementation(async (request) => ({ ...askResponses.plan, requestId: request.requestId! }));
    vi.mocked(api.getAiGeneration).mockRejectedValue(denied(status));
    await act(async () => { await result.current.sendUnifiedAsk({ instruction: "Private user instruction" }); });
    expect(thread(pageId).messages.some((message) => message.previewRecovery || message.generation)).toBe(false);
    expect(JSON.stringify(thread(pageId).messages)).not.toContain("Private user instruction");
    expect(thread(pageId).operation).toBeNull();
  });

  it("legacy submit 403 clears the bound conversation and invalidates its request", async () => {
    vi.mocked(api.listAiConversations).mockResolvedValue({ items: [foundationConversation], nextCursor: null });
    const { result, unrelated } = mount();
    await waitFor(() => expect(result.current.conversations.some((conversation) => conversation.id === conversationId)).toBe(true));
    act(() => useAiChatStore.getState().setInput(scope(), "Private legacy instruction"));
    vi.mocked(api.submitAiMessage).mockRejectedValue(denied(403));
    await act(async () => { await result.current.sendMessage(); });
    expect(api.submitAiMessage).toHaveBeenCalledTimes(1); expect(thread().messages).toEqual([]); unrelated();
  });

  it("legacy preview Generation 404 preserves other generations in the readable conversation", async () => {
    vi.mocked(api.listAiConversations).mockResolvedValue({ items: [pageConversation], nextCursor: null });
    const { result, unrelated } = mount(pageId, plan);
    await waitFor(() => expect(result.current.conversations).toHaveLength(1));
    vi.mocked(api.generateAiModificationPlan).mockResolvedValue({ ...askResponses.plan.planning.plan, generationId: "missing-generation" });
    vi.mocked(api.getAiGeneration).mockRejectedValue(denied(404));
    act(() => {
      useAiChatStore.getState().setMode(scope(pageId), "GENERATE_PAGE_MODIFICATION_PLAN");
      useAiChatStore.getState().setInput(scope(pageId), "Private failed preview request");
    });
    await act(async () => { await result.current.sendMessage(); });
    expect(api.getAiGeneration).toHaveBeenCalledWith("missing-generation");
    expect(thread(pageId).messages.some((message) => message.generation?.id === generationId)).toBe(true);
    expect(JSON.stringify(thread(pageId).messages)).not.toContain("Private failed preview request");
    expect(thread(pageId).activeRequestId).toBeNull(); unrelated();
  });

  it.each([403, 404])("Page %s hides current context without touching Page B", async (status) => {
    const { rerender, unrelated } = mount(pageId, plan);
    view.pageError = denied(status);
    rerender();
    await waitFor(() => expect(thread(pageId).messages).toEqual([])); unrelated();
  });

  it("late successful mutation cannot restore a draft after history denial", async () => {
    const { result, client } = mount();
    const mutation = deferred<Awaited<ReturnType<typeof api.confirmPageComposition>>>();
    vi.mocked(api.confirmPageComposition).mockReturnValue(mutation.promise);
    let action!: Promise<void>;
    act(() => { action = result.current.confirmPageComposition(generationId); });
    await waitFor(() => expect(api.confirmPageComposition).toHaveBeenCalledTimes(1));
    vi.mocked(api.listAiConversationMessages).mockRejectedValue(denied(403));
    await act(async () => { await client.refetchQueries({ queryKey: aiHistoryKeys.messages("user-1", conversationId), exact: true }); });
    await act(async () => { mutation.resolve({ generation: { ...draft, status: "APPLIED" }, execution: { pageId: "created-page" } } as Awaited<ReturnType<typeof api.confirmPageComposition>>); await action; });
    expect(thread().messages).toEqual([]); expect(view.success).not.toHaveBeenCalled(); expect(view.push).not.toHaveBeenCalled();
  });

  it("New Chat remains available after denial and old cached success cannot restore the denied conversation", async () => {
    const { result, client } = mount();
    vi.mocked(api.getAiConversation).mockRejectedValue(denied(403));
    await act(async () => { await client.refetchQueries({ queryKey: aiHistoryKeys.conversation("user-1", conversationId), exact: true }); });
    expect(result.current.accessDenied).toBe(true);
    act(() => { expect(result.current.startNewChat()).toBe(true); });
    expect(thread().conversationId).toBeNull();
    act(() => {
      client.setQueryData(aiHistoryKeys.conversation("user-1", conversationId), foundationConversation);
      client.setQueryData(aiHistoryKeys.messages("user-1", conversationId), pageData([serverMessage("stale", "ASSISTANT", { generationId })]));
      client.setQueryData(aiHistoryKeys.generations("user-1", conversationId), pageData([draft]));
      result.current.selectHistoryConversation(conversationId);
    });
    expect(thread().messages).toEqual([]); expect(result.current.accessDenied).toBe(true);
    await act(async () => { await result.current.confirmPageComposition(generationId); });
    expect(api.confirmPageComposition).not.toHaveBeenCalled();
  });

  it("late history denial cleans original A while B remains active", async () => {
    const { result, client, unrelated } = mount();
    const old = deferred<Awaited<ReturnType<typeof api.listAiConversationMessages>>>();
    vi.mocked(api.listAiConversationMessages).mockReturnValue(old.promise);
    let refresh!: Promise<void>;
    act(() => { refresh = client.refetchQueries({ queryKey: aiHistoryKeys.messages("user-1", conversationId), exact: true }); });
    client.setQueryData(aiHistoryKeys.conversation("user-1", "conversation-b"), { ...foundationConversation, id: "conversation-b" });
    client.setQueryData(aiHistoryKeys.messages("user-1", "conversation-b"), pageData([{ ...serverMessage("active-b", "USER"), conversation_id: "conversation-b" }]));
    client.setQueryData(aiHistoryKeys.generations("user-1", "conversation-b"), pageData([]));
    act(() => { result.current.selectHistoryConversation("conversation-b"); });
    await waitFor(() => expect(thread().messages.some((message) => message.id === "active-b")).toBe(true));
    await act(async () => { old.reject(denied(403)); await refresh; });
    expect(thread().conversationId).toBe("conversation-b");
    expect(thread().messages.some((message) => message.id === "active-b")).toBe(true); unrelated();
    expect(client.getQueryData(aiHistoryKeys.generations("user-1", conversationId))).toBeUndefined();
  });

  it.each(["confirm", "discard"] as const)("authorized %s keeps the settled generation", async (action) => {
    const { result } = mount();
    const status = action === "confirm" ? "APPLIED" : "DISCARDED";
    vi.mocked(api.confirmPageComposition).mockResolvedValue({ generation: { ...draft, status: "APPLIED" }, execution: { pageId: "created-page" } } as Awaited<ReturnType<typeof api.confirmPageComposition>>);
    vi.mocked(api.discardAiGeneration).mockResolvedValue({ ...draft, status: "DISCARDED" });
    await act(async () => { await (action === "confirm" ? result.current.confirmPageComposition(generationId) : result.current.discardGeneration(generationId)); });
    expect(thread().messages.find((message) => message.generation)?.generation?.status).toBe(status);
  });
});

describe("FIX06 saved preview rendering", () => {
  it.each(["confirm", "discard"] as const)("saved preview closes after %s preflight denial and stays closed on rerender", async (action) => {
    const context = setup(pageId);
    const rendered = render(<AiChat currentPageId={pageId} />, { wrapper: context.wrapper });
    fireEvent.click(screen.getByRole("button", { name: "Open saved draft" }));
    expect(await screen.findByText("Saved generation preview")).toBeInTheDocument();
    vi.mocked(api.getAiGeneration).mockRejectedValue(denied(403));
    const buttons = screen.getAllByRole("button", { name: action === "confirm" ? "Confirm protected draft" : "Discard protected draft" });
    fireEvent.click(buttons[0]);
    await waitFor(() => expect(view.error).toHaveBeenCalled());
    expect(screen.queryByText("Saved generation preview")).not.toBeInTheDocument();
    expect(screen.queryByTestId("protected-preview")).not.toBeInTheDocument();
    rendered.rerender(<AiChat currentPageId={pageId} />);
    expect(screen.queryByText("Saved generation preview")).not.toBeInTheDocument(); context.unrelated();
  });

  it.each([403, 404])("saved preview GET %s cleans the matching output", async (status) => {
    const context = setup(pageId);
    vi.mocked(api.getAiGeneration).mockRejectedValue(denied(status));
    render(<AiChat currentPageId={pageId} />, { wrapper: context.wrapper });
    fireEvent.click(screen.getByRole("button", { name: "Open saved draft" }));
    await waitFor(() => expect(view.error).toHaveBeenCalled());
    expect(thread(pageId).messages).toEqual([]); expect(screen.queryByTestId("protected-preview")).toBeNull(); context.unrelated();
  });

  it("late saved-preview GET ignoring cancellation cannot reopen after history denial", async () => {
    const context = setup(pageId);
    const pending = deferred<AiGeneration>(); vi.mocked(api.getAiGeneration).mockReturnValue(pending.promise);
    render(<AiChat currentPageId={pageId} />, { wrapper: context.wrapper });
    fireEvent.click(screen.getByRole("button", { name: "Open saved draft" }));
    expect(screen.getByText("Loading draft...")).toBeInTheDocument();
    vi.mocked(api.listAiConversationMessages).mockRejectedValue(denied(403));
    await act(async () => { await context.client.refetchQueries({ queryKey: aiHistoryKeys.messages("user-1", conversationId), exact: true }); });
    await act(async () => { pending.resolve(draft); await pending.promise; });
    expect(screen.queryByText("Loading draft...")).toBeNull(); expect(screen.queryByText("Saved generation preview")).toBeNull();
    expect(screen.queryByTestId("protected-preview")).toBeNull();
  });

  it("dialog verification 403 closes saved plan and removes its protected summary", async () => {
    const context = setup(pageId, plan);
    vi.mocked(api.getAiGeneration).mockResolvedValue(plan);
    render(<AiChat currentPageId={pageId} />, { wrapper: context.wrapper });
    fireEvent.click(screen.getByRole("button", { name: "Open saved draft" }));
    await screen.findByText("Saved generation preview");
    vi.mocked(api.getAiGeneration).mockRejectedValue(denied(403));
    fireEvent.click(screen.getAllByRole("button", { name: "Apply protected plan" })[0]);
    await waitFor(() => expect(screen.queryByText("Saved generation preview")).toBeNull());
    expect(screen.queryByRole("alertdialog")).toBeNull(); expect(screen.queryByTestId("protected-plan")).toBeNull();
    expect(api.confirmAiModificationPlan).not.toHaveBeenCalled();
  });
});
