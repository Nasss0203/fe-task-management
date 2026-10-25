import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError } from "axios";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/entities/ai-assistant/api/ai-assistant.api";
import type { AiAskResponse, AiConversation, AiGeneration } from "@/entities/ai-assistant/model/ai-assistant.types";
import { aiHistoryKeys } from "@/entities/ai-assistant/model/ai-assistant.queries";
import { useAiChat } from "@/widgets/ai-chat/model/use-ai-chat";
import { aiHistorySelectionKey, saveSelectedAiConversation } from "@/widgets/ai-chat/model/ai-history-selection";
import { getAiChatScope, useAiChatStore } from "@/widgets/ai-chat/model/use-ai-chat-store";
import { askResponses, conversationId, generationId, pageId, workspaceId } from "../unit/ai-ask.fixtures";
import { foundationConversation, foundationGeneration, serverMessage } from "../unit/ai-foundation.fixtures";

const view = vi.hoisted(() => ({
  user: { id: "user-1", lastActiveWorkspaceId: "22222222-2222-4222-8222-222222222222" } as { id: string; lastActiveWorkspaceId: string } | undefined,
  pageWorkspace: "22222222-2222-4222-8222-222222222222",
  push: vi.fn(), success: vi.fn(), error: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: view.push }) }));
vi.mock("sonner", () => ({ toast: { success: view.success, error: view.error } }));
vi.mock("@/features/auth", () => ({ useUser: () => ({ user: view.user }) }));
vi.mock("@/entities/workspace/model/workspace.queries", () => ({
  useWorkspaces: () => ({ data: [{ id: "22222222-2222-4222-8222-222222222222" }, { id: "workspace-2" }] }),
}));
vi.mock("@/entities/page/model/page.queries", () => ({
  usePage: (id?: string) => ({ data: id ? { id, workspace_id: view.pageWorkspace } : undefined }),
  pageKeys: {
    byWorkspace: (id: string) => ["pages", "workspace", id],
    detail: (id: string) => ["pages", "detail", id],
  },
}));
vi.mock("@/entities/ai-assistant/api/ai-assistant.api");

const ask = vi.mocked(api.askAi);
const detail = vi.mocked(api.getAiConversation);
const getGeneration = vi.mocked(api.getAiGeneration);
const confirm = vi.mocked(api.confirmAiModificationPlan);
const discard = vi.mocked(api.discardAiGeneration);
const compositionConfirm = vi.mocked(api.confirmPageComposition);
const scope = (page?: string, user = "user-1", workspace = workspaceId) => getAiChatScope(page, workspace, user);
const thread = (page?: string) => useAiChatStore.getState().threads[scope(page)];
const selectedKey = (page?: string) => aiHistorySelectionKey("user-1", workspaceId, page);
const pageConversation: AiConversation = { ...foundationConversation, scope: "PAGE", page_id: pageId };
const planGeneration = (context = false): AiGeneration => ({
  ...foundationGeneration, capability: "GENERATE_PAGE_MODIFICATION_PLAN",
  output_data: context ? askResponses.context.planning.plan : askResponses.plan.planning.plan,
});
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const httpError = (status: number) => new AxiosError("private server internals", "ERR_BAD_RESPONSE", undefined, undefined, { status } as never);
function respond(variant: keyof typeof askResponses) {
  ask.mockImplementation(async (request) => ({ ...askResponses[variant], requestId: request.requestId! } as AiAskResponse));
}
function mount(page?: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  const hook = renderHook(({ page }: { page?: string }) => useAiChat(page), { initialProps: { page }, wrapper });
  return { ...hook, client };
}
async function send(result: ReturnType<typeof mount>["result"], instruction = "Original complete instruction", selectedText?: string | null) {
  await act(async () => { await result.current.sendUnifiedAsk({ instruction, selectedText }); });
}
function select(page?: string) { saveSelectedAiConversation(selectedKey(page), conversationId); }

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  useAiChatStore.setState({ threads: {}, accessDenials: [] });
  view.user = { id: "user-1", lastActiveWorkspaceId: workspaceId };
  view.pageWorkspace = workspaceId;
  detail.mockResolvedValue(foundationConversation);
  getGeneration.mockResolvedValue(planGeneration());
  vi.mocked(api.listAiConversations).mockResolvedValue({ items: [], nextCursor: null });
  vi.mocked(api.listAiConversationMessages).mockResolvedValue({ items: [], nextCursor: null });
  vi.mocked(api.listAiConversationGenerations).mockResolvedValue({ items: [], nextCursor: null });
  respond("clarification");
});
afterEach(cleanup);

describe("Unified Ask: real useAiChat/useAskAi orchestration", () => {
  it.each(Object.keys(askResponses) as (keyof typeof askResponses)[])("routes %s through the real mutation and preserves history overlays", async (variant) => {
    const generationVariant = ["writing", "composition", "plan", "context"].includes(variant);
    if (variant === "plan" || variant === "context") detail.mockResolvedValue(pageConversation);
    getGeneration.mockResolvedValue(planGeneration(variant === "context"));
    respond(variant);
    const { result, client } = mount();
    await send(result);
    expect(ask).toHaveBeenCalledTimes(1);
    expect(api.createAiConversation).not.toHaveBeenCalled();
    expect(api.submitAiMessage).not.toHaveBeenCalled();
    const request = ask.mock.calls[0][0];
    expect(Object.keys(request).sort()).toEqual(["instruction", "requestId", "workspaceId"]);
    expect(request).toMatchObject({ instruction: "Original complete instruction", workspaceId });
    expect(request.requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(thread().messages.filter((message) => message.role === "user")).toHaveLength(1);
    const assistant = thread().messages.find((message) => message.role === "assistant")!;
    expect(assistant.generation?.id).toBe(generationVariant ? generationId : undefined);
    expect(Boolean(assistant.unifiedSelection)).toBe(variant === "ambiguous");
    expect(assistant.capability).toBe(generationVariant ? askResponses[variant].capability : null);
    expect(getGeneration).toHaveBeenCalledTimes(variant === "plan" || variant === "context" ? 1 : 0);
    expect(localStorage.getItem(selectedKey()!)).toBe(generationVariant ? conversationId : null);
    expect(confirm).not.toHaveBeenCalled();
    expect(discard).not.toHaveBeenCalled();
    expect(compositionConfirm).not.toHaveBeenCalled();
    expect(view.push).not.toHaveBeenCalled();
    expect(thread().operation).toBeNull();
    expect(thread().activeRequestId).toBeNull();
    // A server refresh must neither lose local feedback nor duplicate optimistic USER.
    if (generationVariant) await act(async () => { await client.invalidateQueries({ queryKey: aiHistoryKeys.all }); });
    expect(thread().messages).toHaveLength(2);
  });

  it("merges a later persisted writing turn once, with stable message IDs", async () => {
    respond("writing");
    const { result, client } = mount();
    await send(result);
    const identities = thread().messages.map((message) => message.id);
    const requestId = ask.mock.calls[0][0].requestId!;
    vi.mocked(api.listAiConversationMessages).mockResolvedValue({ items: [
      serverMessage("server-user", "USER", { requestId }),
      serverMessage("server-assistant", "ASSISTANT", { requestId, generationId, capability: "writing.improve" }),
    ], nextCursor: null });
    vi.mocked(api.listAiConversationGenerations).mockResolvedValue({ items: [foundationGeneration], nextCursor: null });
    await act(async () => { await client.invalidateQueries({ queryKey: aiHistoryKeys.all }); });
    await waitFor(() => expect(thread().messages.every((message) => message.origin?.source === "persisted")).toBe(true));
    expect(thread().messages.map((message) => message.id).sort()).toEqual([...identities].sort());
    expect(thread().messages).toHaveLength(2);
  });

  it.each(["clarification", "unsupported"] as const)("keeps local %s through a selected conversation refresh", async (variant) => {
    select(); respond(variant);
    const { result, client } = mount();
    await send(result);
    const messages = thread().messages;
    await act(async () => { await client.invalidateQueries({ queryKey: aiHistoryKeys.all }); });
    expect(thread().messages).toEqual(messages);
    expect(thread().messages.at(-1)?.origin?.source).toBe("feedback");
    expect(thread().messages.at(-1)?.capability).toBeNull();
    expect(thread().messages.at(-1)?.generation).toBeUndefined();
  });

  it.each([
    ["GLOBAL", "plan"], ["PAGE", "composition"], ["PAGE", "writing"],
  ] as const)("does not silently switch a Dashboard %s conversation for %s", async (kind, variant) => {
    select(); respond(variant);
    detail.mockResolvedValue(kind === "PAGE" ? pageConversation : foundationConversation);
    const { result } = mount();
    await send(result);
    expect(ask).toHaveBeenCalledTimes(1);
    expect(ask.mock.calls[0][0].conversationId).toBe(conversationId);
    expect(ask.mock.calls[0][0]).not.toHaveProperty("currentPageId");
    expect(thread().messages.at(-1)?.generation).toBeUndefined();
    expect(localStorage.getItem(selectedKey()!)).toBe(conversationId);
    expect(api.createAiConversation).not.toHaveBeenCalled();
  });

  it.each([
    ["GLOBAL", undefined], ["PAGE", undefined], ["GLOBAL", pageId], ["PAGE", pageId],
  ] as const)("verifies selected %s outside list pagination in route %s without synthesizing a page", async (kind, routePage) => {
    select(routePage);
    detail.mockResolvedValue(kind === "PAGE" ? pageConversation : foundationConversation);
    const { result } = mount(routePage);
    await send(result, "Mixed intent: improve text and add a page");
    expect(detail).toHaveBeenCalled();
    expect(ask).toHaveBeenCalledTimes(1);
    expect(ask.mock.calls[0][0]).toMatchObject({ conversationId, ...(routePage ? { currentPageId: pageId } : {}) });
    if (!routePage) expect(ask.mock.calls[0][0]).not.toHaveProperty("currentPageId");
    expect(api.createAiConversation).not.toHaveBeenCalled();
  });

  it("locks before selected metadata loading, deduplicates verification and refuses resets synchronously", async () => {
    select();
    const metadata = deferred<AiConversation>();
    detail.mockReturnValue(metadata.promise);
    const { result } = mount();
    let first!: Promise<boolean>;
    let second!: Promise<boolean>;
    act(() => {
      first = result.current.sendUnifiedAsk({ instruction: "One" });
      second = result.current.sendUnifiedAsk({ instruction: "Two" });
      expect(result.current.startNewChat()).toBe(false);
      expect(result.current.selectHistoryConversation("other")).toBe(false);
      expect(thread().operation?.type).toBe("ask");
    });
    expect(ask).not.toHaveBeenCalled();
    expect(localStorage.getItem(selectedKey()!)).toBe(conversationId);
    await act(async () => { metadata.resolve(foundationConversation); await Promise.all([first, second]); });
    expect(ask).toHaveBeenCalledTimes(1);
    expect(detail).toHaveBeenCalledTimes(1);
  });

  it.each([
    { status: "ARCHIVED" }, { scope: "LEGACY" }, { workspace_id: "other" },
    { id: "wrong-id" }, { scope: "PAGE", page_id: "another-page" }, { scope: "PAGE", page_id: null },
  ] as Partial<AiConversation>[])("blocks invalid selected metadata %j without implicit creation", async (override) => {
    select(pageId);
    detail.mockResolvedValue({ ...foundationConversation, ...override });
    const { result } = mount(pageId);
    await send(result);
    expect(ask).not.toHaveBeenCalled();
    expect(api.createAiConversation).not.toHaveBeenCalled();
    expect(localStorage.getItem(selectedKey(pageId)!)).toBe(conversationId);
    expect(thread(pageId).messages.some((message) => message.generation)).toBe(false);
    expect(thread(pageId).operation).toBeNull();
  });

  it.each([403, 404])("blocks selected metadata HTTP %s without rendering a wrong-context preview", async (status) => {
    select();
    detail.mockRejectedValue(httpError(status));
    const { result } = mount();
    await send(result);
    expect(ask).not.toHaveBeenCalled();
    expect(thread().messages.map((message) => message.content).join(" ")).not.toContain("private server");
    expect(thread().messages.some((message) => message.generation)).toBe(false);
  });

  it.each([400, 401, 403, 404, 409, 502])("sanitizes Ask HTTP %s once and preserves selection", async (status) => {
    select();
    ask.mockRejectedValue(httpError(status));
    const { result } = mount();
    await send(result);
    expect(ask).toHaveBeenCalledTimes(1);
    expect(ask.mock.calls[0][0].conversationId).toBe(conversationId);
    expect(localStorage.getItem(selectedKey()!)).toBe(conversationId);
    if (status === 403 || status === 404) {
      expect(thread().messages).toEqual([]);
      expect(view.error).toHaveBeenCalledWith(expect.not.stringContaining("private server"));
    } else {
      const feedback = thread().messages.at(-1)!;
      expect(feedback.content).not.toContain("private server");
      if (status === 400) expect(feedback.content).toContain("Check the instruction");
    }
    expect(api.createAiConversation).not.toHaveBeenCalled();
    expect(thread().operation).toBeNull();
  });

  it("treats timeout as unknown, never retries, and leaves a check-history instruction", async () => {
    ask.mockRejectedValue(new AxiosError("private timeout", "ECONNABORTED"));
    const { result } = mount();
    await send(result);
    expect(ask).toHaveBeenCalledTimes(1);
    expect(thread().messages.at(-1)?.content).toContain("outcome is unknown");
    expect(thread().messages.at(-1)?.content).toContain("Check conversation history");
    expect(thread().messages.at(-1)?.generation).toBeUndefined();
  });

  it.each(["wrong-request", "unknown-capability", "wrong-workspace", "malformed-output", "cross-page"] as const)("fails closed for %s", async (failure) => {
    ask.mockImplementation(async (request) => {
      if (failure === "cross-page") return { ...askResponses.plan, requestId: request.requestId! };
      const response = structuredClone(askResponses.writing) as Record<string, unknown>;
      response.requestId = failure === "wrong-request" ? "different" : request.requestId;
      const generation = response.generation as Record<string, unknown>;
      if (failure === "unknown-capability") response.capability = generation.capability = "future.tool";
      if (failure === "wrong-workspace") generation.workspace_id = "other";
      if (failure === "malformed-output") generation.output_data = { secret: "private" };
      return response as unknown as AiAskResponse;
    });
    const routePage = failure === "cross-page" ? "other-page" : undefined;
    const { result } = mount(routePage);
    await send(result);
    expect(thread(routePage).messages.at(-1)?.generation).toBeUndefined();
    expect(getGeneration).not.toHaveBeenCalled();
    expect(confirm).not.toHaveBeenCalled();
    expect(localStorage.getItem(selectedKey(routePage)!)).toBeNull();
  });

  it("sends explicit selectedText null and accepts no consumer capability/user identity", async () => {
    const { result } = mount(pageId);
    await send(result, "Use backend intent", null);
    expect(ask.mock.calls[0][0]).toMatchObject({ selectedText: null, currentPageId: pageId });
    expect(ask.mock.calls[0][0]).not.toHaveProperty("userId");
    expect(ask.mock.calls[0][0]).not.toHaveProperty("capability");
  });

  it.each(["", "  ", "x".repeat(4001)])("rejects invalid instruction before metadata/network", async (instruction) => {
    const { result } = mount();
    await send(result, instruction);
    expect(ask).not.toHaveBeenCalled();
    expect(detail).not.toHaveBeenCalled();
  });
});

describe("Unified candidate continuation and preview recovery", () => {
  it("continues original instruction/text with a fresh requestId, one USER, and a same-tick double-click lock", async () => {
    respond("ambiguous");
    const { result } = mount();
    await send(result, "Original complete instruction", "Original selected text");
    const selection = thread().messages.at(-1)!;
    act(() => useAiChatStore.getState().setInput(scope(), "Edited composer text"));
    const response = deferred<AiAskResponse>();
    ask.mockImplementation(() => response.promise);
    detail.mockResolvedValue(pageConversation);
    let first!: Promise<boolean>;
    let second!: Promise<boolean>;
    act(() => {
      first = result.current.selectUnifiedAskPageCandidate(selection.id, pageId);
      second = result.current.selectUnifiedAskPageCandidate(selection.id, pageId);
    });
    await waitFor(() => expect(ask).toHaveBeenCalledTimes(2));
    const [original, continued] = ask.mock.calls.map(([request]) => request);
    expect(continued).toMatchObject({ instruction: original.instruction, selectedText: original.selectedText, selectedPageId: pageId });
    expect(continued.requestId).not.toBe(original.requestId);
    await act(async () => { response.resolve({ ...askResponses.plan, requestId: continued.requestId! }); await Promise.all([first, second]); });
    expect(thread().messages).toHaveLength(2);
    expect(thread().messages.filter((message) => message.role === "user")).toHaveLength(1);
    expect(thread().messages.at(-1)?.generation?.id).toBe(generationId);
    expect(thread().messages.at(-1)?.id).toBe(selection.id);
  });

  it.each(["non-member", "new-chat", "selection-changed", "page-changed"] as const)("ignores %s candidate callbacks", async (reason) => {
    respond("ambiguous");
    const { result, rerender } = mount();
    await send(result);
    const id = thread().messages.at(-1)!.id;
    if (reason === "new-chat") act(() => { result.current.startNewChat(); });
    if (reason === "selection-changed") act(() => { saveSelectedAiConversation(selectedKey(), "other"); });
    if (reason === "page-changed") rerender({ page: pageId });
    await act(async () => { await result.current.selectUnifiedAskPageCandidate(id, reason === "non-member" ? "not-listed" : pageId); });
    expect(ask).toHaveBeenCalledTimes(1);
  });

  it("keeps known IDs on GET failure and retries only GET in place", async () => {
    respond("plan");
    detail.mockResolvedValue(pageConversation);
    getGeneration.mockRejectedValueOnce(httpError(502)).mockResolvedValue(planGeneration());
    const { result, client } = mount();
    await send(result);
    const failed = thread().messages.at(-1)!;
    expect(failed.generation).toBeUndefined();
    expect(failed.previewRecovery).toMatchObject({ generationId, conversationId });
    expect(failed.content).toContain("do not resend");
    vi.mocked(api.listAiConversationMessages).mockResolvedValue({ items: [serverMessage("saved-plan", "ASSISTANT", { generationId })], nextCursor: null });
    vi.mocked(api.listAiConversationGenerations).mockResolvedValue({ items: [planGeneration()], nextCursor: null });
    await act(async () => { await client.invalidateQueries({ queryKey: aiHistoryKeys.all }); });
    expect(thread().messages.some((message) => message.generation)).toBe(false);
    await act(async () => { await result.current.retryUnifiedAskPreview(failed.id); });
    expect(ask).toHaveBeenCalledTimes(1);
    expect(getGeneration).toHaveBeenCalledTimes(2);
    expect(thread().messages.at(-1)?.id).toBe(failed.id);
    expect(thread().messages.at(-1)?.generation?.id).toBe(generationId);
    expect(thread().messages.at(-1)?.previewRecovery).toBeUndefined();
  });

  it.each(["identity", "conversation", "workspace", "capability", "status", "output", "page"] as const)("does not expose a preview after a mismatched GET %s", async (field) => {
    respond("plan");
    detail.mockResolvedValue(pageConversation);
    const generation = planGeneration();
    if (field === "identity") generation.id = "wrong";
    if (field === "conversation") generation.conversation_id = "wrong";
    if (field === "workspace") generation.workspace_id = "wrong";
    if (field === "capability") generation.capability = "writing.improve";
    if (field === "status") generation.status = "PROCESSING";
    if (field === "output") generation.output_data = { ...askResponses.plan.planning.plan, summary: "Different result" };
    if (field === "page") generation.output_data = { ...askResponses.plan.planning.plan, pageId: "wrong" };
    getGeneration.mockResolvedValue(generation);
    const { result } = mount();
    await send(result);
    expect(thread().messages.at(-1)?.generation).toBeUndefined();
    expect(thread().messages.at(-1)?.previewRecovery?.generationId).toBe(generationId);
    expect(ask).toHaveBeenCalledTimes(1);
  });
});

describe("Shared Ask/Confirm/Discard locks and stale-view safety", () => {
  it.each(["confirm", "discard", "composition"] as const)("abandons %s before mutation if context changes during GET", async (action) => {
    const pending = deferred<AiGeneration>();
    getGeneration.mockReturnValue(pending.promise);
    const { result, rerender } = mount();
    let operation!: Promise<unknown>;
    act(() => {
      operation = action === "confirm" ? result.current.confirmAiModificationPlan(generationId, pageId)
        : action === "discard" ? result.current.discardGeneration(generationId) : result.current.confirmPageComposition(generationId);
    });
    rerender({ page: "another-page" });
    await act(async () => { pending.resolve(planGeneration()); await operation; });
    expect(confirm).not.toHaveBeenCalled();
    expect(discard).not.toHaveBeenCalled();
    expect(compositionConfirm).not.toHaveBeenCalled();
    expect(thread().operation).toBeNull();
    expect(view.error).not.toHaveBeenCalled();
  });

  it.each(["confirm", "discard"] as const)("suppresses late %s UI updates after navigation while preserving origin invalidation", async (action) => {
    const generation = planGeneration();
    getGeneration.mockResolvedValue(generation);
    const confirmation = deferred<Awaited<ReturnType<typeof api.confirmAiModificationPlan>>>();
    const discarding = deferred<AiGeneration>();
    confirm.mockReturnValue(confirmation.promise);
    discard.mockReturnValue(discarding.promise);
    const { result, rerender, client } = mount();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    act(() => useAiChatStore.getState().addMessage(scope(), { id: "draft", role: "assistant", content: "Review", capability: generation.capability, generation, createdAt: generation.created_at }));
    let operation!: Promise<unknown>;
    act(() => { operation = action === "confirm" ? result.current.confirmAiModificationPlan(generationId, pageId) : result.current.discardGeneration(generationId); });
    await waitFor(() => expect(action === "confirm" ? confirm : discard).toHaveBeenCalledTimes(1));
    rerender({ page: "another-page" });
    await act(async () => {
      confirmation.resolve({ generation: { ...generation, status: "APPLIED" }, execution: {} } as Awaited<ReturnType<typeof api.confirmAiModificationPlan>>);
      discarding.resolve({ ...generation, status: "DISCARDED" });
      await operation;
    });
    expect(thread().messages[0].generation?.status).toBe("COMPLETED");
    expect(view.success).not.toHaveBeenCalled();
    expect(thread().operation).toBeNull();
    if (action === "confirm") expect(invalidate).toHaveBeenCalledWith({ queryKey: ["pages", "detail", pageId] });
  });

  it("purges observed logout state and allows atomic idle New Chat/selection", async () => {
    select();
    const { result, rerender } = mount();
    await waitFor(() => expect(result.current.conversationDetailQuery.isSuccess).toBe(true));
    act(() => { expect(result.current.startNewChat()).toBe(true); });
    expect(localStorage.getItem(selectedKey()!)).toBe("");
    act(() => { expect(result.current.selectHistoryConversation(conversationId)).toBe(true); });
    expect(thread().conversationId).toBe(conversationId);
    expect(localStorage.getItem(selectedKey()!)).toBe(conversationId);
    view.user = undefined;
    rerender({ page: undefined });
    expect(thread().messages).toEqual([]);
    expect(thread().conversationId).toBeNull();
    await send(result);
    expect(ask).not.toHaveBeenCalled();
  });

  it("allows a validated Page Writing turn and retains the selected Page context", async () => {
    select(pageId); detail.mockResolvedValue(pageConversation); respond("writing");
    const { result } = mount(pageId);
    await send(result);
    expect(thread(pageId).messages.at(-1)?.generation?.capability).toBe("writing.improve");
    expect(ask.mock.calls[0][0]).toMatchObject({ conversationId, currentPageId: pageId });
    expect(confirm).not.toHaveBeenCalled();
  });

  it("navigates only after an explicit valid Composition confirmation in the same view", async () => {
    const generation: AiGeneration = { ...askResponses.composition.generation, capability: "GENERATE_PAGE_COMPOSITION" };
    getGeneration.mockResolvedValue(generation);
    compositionConfirm.mockResolvedValue({ generation: { ...generation, status: "APPLIED" }, execution: { pageId: "new-page" } } as Awaited<ReturnType<typeof api.confirmPageComposition>>);
    const { result } = mount();
    await act(async () => { await result.current.confirmPageComposition(generationId, { parentPageId: null }); });
    expect(compositionConfirm).toHaveBeenCalledWith(generationId, { parentPageId: null });
    expect(view.push).toHaveBeenCalledWith("/page/new-page");
  });

  it.each(["confirm", "discard", "composition"] as const)("locks %s before GET, blocks all Send/reset paths, and releases after preflight failure", async (action) => {
    const pending = deferred<AiGeneration>();
    getGeneration.mockReturnValue(pending.promise);
    const { result } = mount();
    let operation!: Promise<unknown>;
    act(() => {
      operation = action === "confirm" ? result.current.confirmAiModificationPlan(generationId, pageId)
        : action === "discard" ? result.current.discardGeneration(generationId) : result.current.confirmPageComposition(generationId);
      expect(thread().operation?.type).toBe(action === "discard" ? "discard" : "confirm");
      expect(result.current.startNewChat()).toBe(false);
      expect(result.current.selectHistoryConversation("other")).toBe(false);
    });
    await act(async () => {
      await result.current.sendUnifiedAsk({ instruction: "Blocked" });
      useAiChatStore.getState().setInput(scope(), "Legacy blocked");
      await result.current.sendMessage();
    });
    expect(ask).not.toHaveBeenCalled();
    expect(api.createAiConversation).not.toHaveBeenCalled();
    expect(api.generatePagePlanFromInstruction).not.toHaveBeenCalled();
    await act(async () => { pending.reject(httpError(409)); await operation; });
    expect(thread().operation).toBeNull();
    expect(confirm).not.toHaveBeenCalled();
    expect(discard).not.toHaveBeenCalled();
  });

  it("blocks Confirm/Discard while Ask awaits its response and never applies automatically", async () => {
    const pending = deferred<AiAskResponse>();
    ask.mockReturnValue(pending.promise);
    const { result } = mount();
    let sending!: Promise<boolean>;
    act(() => { sending = result.current.sendUnifiedAsk({ instruction: "Ask" }); });
    await act(async () => {
      await result.current.confirmAiModificationPlan(generationId, pageId);
      await result.current.discardGeneration(generationId);
      await result.current.confirmPageComposition(generationId);
    });
    expect(getGeneration).not.toHaveBeenCalled();
    await act(async () => { pending.resolve({ ...askResponses.composition, requestId: ask.mock.calls[0][0].requestId! }); await sending; });
    expect(compositionConfirm).not.toHaveBeenCalled();
    expect(view.push).not.toHaveBeenCalled();
  });

  it.each(["page", "workspace", "user", "selection", "unmount"] as const)("drops a late Ask result after %s changes", async (change) => {
    const pending = deferred<AiAskResponse>();
    ask.mockReturnValue(pending.promise);
    const { result, rerender, unmount } = mount();
    let sending!: Promise<boolean>;
    act(() => { sending = result.current.sendUnifiedAsk({ instruction: "Ask" }); });
    await waitFor(() => expect(ask).toHaveBeenCalledTimes(1));
    if (change === "page") rerender({ page: pageId });
    if (change === "workspace") { view.user = { id: "user-1", lastActiveWorkspaceId: "workspace-2" }; rerender({ page: undefined }); }
    if (change === "user") { view.user = { id: "user-2", lastActiveWorkspaceId: workspaceId }; rerender({ page: undefined }); }
    if (change === "selection") act(() => saveSelectedAiConversation(selectedKey(), "other"));
    if (change === "unmount") unmount();
    await act(async () => { pending.resolve({ ...askResponses.writing, requestId: ask.mock.calls[0][0].requestId! }); await sending; });
    expect(Object.values(useAiChatStore.getState().threads).flatMap((item) => item.messages).some((message) => message.generation)).toBe(false);
    expect(detail.mock.calls.filter(([id]) => id === conversationId)).toHaveLength(0);
    expect(view.push).not.toHaveBeenCalled();
    if (change === "user") expect(thread().messages).toEqual([]);
    expect(thread()?.operation).toBeNull();
  });

  it("does not hydrate a plan after navigating during its GET", async () => {
    respond("plan"); detail.mockResolvedValue(pageConversation);
    const pending = deferred<AiGeneration>();
    getGeneration.mockReturnValue(pending.promise);
    const { result, rerender } = mount();
    let sending!: Promise<boolean>;
    act(() => { sending = result.current.sendUnifiedAsk({ instruction: "Plan" }); });
    await waitFor(() => expect(getGeneration).toHaveBeenCalled());
    rerender({ page: "different-page" });
    await act(async () => { pending.resolve(planGeneration()); await sending; });
    expect(thread().messages.some((message) => message.generation)).toBe(false);
    expect(thread().operation).toBeNull();
  });

  it("invalidates origin page/blocks/database rows on explicit Confirm and preserves the terminal preview", async () => {
    respond("plan"); detail.mockResolvedValue(pageConversation);
    const generation = planGeneration();
    generation.output_data = { ...askResponses.plan.planning.plan, operations: [{ type: "CREATE_DATABASE_ROWS", databaseId: "db-1", rows: [{ values: { title: "QA" } }] }] };
    // Start from a restored draft to exercise explicit action, independent of Ask.
    const { result, client } = mount();
    act(() => useAiChatStore.getState().addMessage(scope(), { id: "draft", role: "assistant", content: "Review", capability: generation.capability, createdAt: generation.created_at, generation }));
    getGeneration.mockResolvedValue(generation);
    const applied = { ...generation, status: "APPLIED" as const };
    confirm.mockResolvedValue({ generation: applied, execution: {} } as Awaited<ReturnType<typeof api.confirmAiModificationPlan>>);
    const invalidation = vi.spyOn(client, "invalidateQueries");
    await act(async () => { await result.current.confirmAiModificationPlan(generationId, pageId); });
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(invalidation).toHaveBeenCalledWith({ queryKey: ["pages", "detail", pageId] });
    expect(invalidation).toHaveBeenCalledWith({ queryKey: ["page-blocks", "page", pageId] });
    expect(invalidation).toHaveBeenCalledWith({ queryKey: ["databases", "db-1", "rows"] });
    expect(thread().messages[0].generation?.status).toBe("APPLIED");
    expect(thread().operation).toBeNull();
  });

  it("never confirms NEED_MORE_CONTEXT but allows explicit validated Discard", async () => {
    getGeneration.mockResolvedValue(planGeneration(true));
    discard.mockResolvedValue({ ...planGeneration(true), status: "DISCARDED" });
    const { result } = mount();
    await act(async () => { await result.current.confirmAiModificationPlan(generationId, pageId); });
    expect(confirm).not.toHaveBeenCalled();
    await act(async () => { await result.current.discardGeneration(generationId); });
    expect(discard).toHaveBeenCalledTimes(1);
    expect(thread().operation).toBeNull();
  });

  it.each(["APPLIED", "DISCARDED", "FAILED", "PROCESSING"] as const)("blocks draft actions on %s", async (status) => {
    getGeneration.mockResolvedValue({ ...planGeneration(), status });
    const { result } = mount();
    await act(async () => {
      await result.current.confirmAiModificationPlan(generationId, pageId);
      await result.current.discardGeneration(generationId);
    });
    expect(confirm).not.toHaveBeenCalled();
    expect(discard).not.toHaveBeenCalled();
    expect(thread().operation).toBeNull();
  });

  it("rejects cross-page draft action preflight", async () => {
    getGeneration.mockResolvedValue(planGeneration());
    const { result } = mount("different-page");
    await act(async () => {
      await result.current.confirmAiModificationPlan(generationId, pageId);
      await result.current.discardGeneration(generationId);
    });
    expect(confirm).not.toHaveBeenCalled();
    expect(discard).not.toHaveBeenCalled();
  });

  it("keeps mutation invalidation on the origin workspace but suppresses late Composition navigation", async () => {
    const generation: AiGeneration = { ...askResponses.composition.generation, capability: "GENERATE_PAGE_COMPOSITION" };
    getGeneration.mockResolvedValue(generation);
    const pending = deferred<Awaited<ReturnType<typeof api.confirmPageComposition>>>();
    compositionConfirm.mockReturnValue(pending.promise);
    const { result, rerender, client } = mount();
    const invalidation = vi.spyOn(client, "invalidateQueries");
    let operation!: Promise<unknown>;
    act(() => { operation = result.current.confirmPageComposition(generationId); });
    await waitFor(() => expect(compositionConfirm).toHaveBeenCalledTimes(1));
    view.user = { id: "user-1", lastActiveWorkspaceId: "workspace-2" };
    rerender({ page: undefined });
    await act(async () => { pending.resolve({ generation: { ...generation, status: "APPLIED" }, execution: { pageId: "new-page" } } as Awaited<ReturnType<typeof api.confirmPageComposition>>); await operation; });
    expect(invalidation).toHaveBeenCalledWith({ queryKey: ["pages", "workspace", workspaceId] });
    expect(view.push).not.toHaveBeenCalled();
    expect(view.success).not.toHaveBeenCalled();
    expect(thread().operation).toBeNull();
  });
});

