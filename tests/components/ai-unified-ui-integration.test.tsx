import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { StrictMode, type PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "@/entities/ai-assistant/api/ai-assistant.api";
import type { AiAskResponse, AiConversation, AiGeneration } from "@/entities/ai-assistant/model/ai-assistant.types";
import { aiHistoryKeys } from "@/entities/ai-assistant/model/ai-assistant.queries";
import { AiChat } from "@/widgets/ai-chat/ui/AiChat";
import { AiChatHome } from "@/widgets/ai-chat/ui/AiChatHome";
import { AiMessageItem } from "@/widgets/ai-chat/ui/AiMessageItem";
import { AiPageCompositionPreview } from "@/widgets/ai-chat/ui/AiPageCompositionPreview";
import { getAiChatScope, useAiChatStore } from "@/widgets/ai-chat/model/use-ai-chat-store";
import { aiHistorySelectionKey, getSelectedAiConversation, saveSelectedAiConversation } from "@/widgets/ai-chat/model/ai-history-selection";
import { askResponses, conversationId, generationId, pageId, sentenceResponses, workspaceId } from "../unit/ai-ask.fixtures";
import { foundationConversation, foundationGeneration } from "../unit/ai-foundation.fixtures";

const view = vi.hoisted(() => ({
  user: { id: "user-1", lastActiveWorkspaceId: "22222222-2222-4222-8222-222222222222" },
  workspace: "22222222-2222-4222-8222-222222222222", push: vi.fn(), toastError: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: view.push }) }));
vi.mock("sonner", () => ({ toast: { error: view.toastError, success: vi.fn() } }));
vi.mock("@/features/auth", () => ({ useUser: () => ({ user: view.user }) }));
vi.mock("@/entities/workspace/model/workspace.queries", () => ({
  useWorkspaces: () => ({ data: [{ id: "22222222-2222-4222-8222-222222222222" }, { id: "workspace-2" }] }),
}));
vi.mock("@/entities/page/model/page.queries", () => ({
  usePage: (id?: string) => ({ data: id ? { id, workspace_id: view.workspace } : undefined }),
  usePagesByWorkspace: () => ({ data: [] }),
  pageKeys: { detail: (id: string) => ["pages", "detail", id], byWorkspace: (id: string) => ["pages", "workspace", id] },
}));
vi.mock("@/entities/teamspace/model/teamspace.queries", () => ({ useTeamspaces: () => ({ data: [] }) }));
vi.mock("@/entities/page-block/model/page-block.queries", () => ({
  usePageBlocks: () => ({ data: [], isPending: false }), pageBlockKeys: { byPage: (id: string) => ["page-blocks", "page", id] },
}));
vi.mock("@/entities/database/model/database.queries", () => ({
  useDatabase: () => ({ data: undefined, isPending: false }), databaseKeys: { rows: (id: string) => ["databases", id, "rows"] },
}));
vi.mock("@/entities/ai-assistant/api/ai-assistant.api");

const ask = vi.mocked(api.askAi), detail = vi.mocked(api.getAiConversation), getGeneration = vi.mocked(api.getAiGeneration);
const scope = (page?: string) => getAiChatScope(page, workspaceId, "user-1");
const thread = (page?: string) => useAiChatStore.getState().threads[scope(page)];
const key = (page?: string) => aiHistorySelectionKey("user-1", workspaceId, page);
const pageConversation: AiConversation = { ...foundationConversation, scope: "PAGE", page_id: pageId };
const plan = (context = false): AiGeneration => ({ ...foundationGeneration, capability: "GENERATE_PAGE_MODIFICATION_PLAN",
  output_data: context ? askResponses.context.planning.plan : askResponses.plan.planning.plan });
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function respond(variant: keyof typeof askResponses) {
  ask.mockImplementation(async (request) => ({ ...askResponses[variant], requestId: request.requestId! } as AiAskResponse));
}
function mount(home = false, page?: string, strict = false) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>{strict ? <StrictMode>{children}</StrictMode> : children}</QueryClientProvider>;
  return { ...render(home ? <AiChatHome /> : <AiChat currentPageId={page} />, { wrapper }), client };
}
function submit(instruction = "Write a complete request") {
  fireEvent.change(screen.getByRole("textbox"), { target: { value: instruction } });
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
}
beforeEach(() => {
  vi.resetAllMocks(); localStorage.clear(); useAiChatStore.setState({ threads: {} });
  view.user = { id: "user-1", lastActiveWorkspaceId: workspaceId }; view.workspace = workspaceId;
  HTMLElement.prototype.scrollIntoView = vi.fn();
  detail.mockResolvedValue(foundationConversation); getGeneration.mockResolvedValue(plan());
  vi.mocked(api.listAiConversations).mockResolvedValue({ items: [], nextCursor: null });
  vi.mocked(api.listAiConversationMessages).mockResolvedValue({ items: [], nextCursor: null });
  vi.mocked(api.listAiConversationGenerations).mockResolvedValue({ items: [], nextCursor: null });
  respond("clarification");
});
afterEach(cleanup);

describe("Activated Chat UI with real useAiChat/useAskAi", () => {
  it.each(Object.keys(askResponses) as (keyof typeof askResponses)[])("renders %s via Unified Ask without legacy mutation", async (variant) => {
    respond(variant);
    if (variant === "plan" || variant === "context") { detail.mockResolvedValue(pageConversation); getGeneration.mockResolvedValue(plan(variant === "context")); }
    mount(); submit();
    await waitFor(() => expect(thread()?.operation).toBeNull());
    expect(ask).toHaveBeenCalledTimes(1);
    expect(ask.mock.calls[0][0]).toMatchObject({ instruction: "Write a complete request", workspaceId });
    expect(ask.mock.calls[0][0]).not.toHaveProperty("capability");
    expect(ask.mock.calls[0][0]).not.toHaveProperty("userId");
    expect(api.createAiConversation).not.toHaveBeenCalled();
    expect(api.submitAiMessage).not.toHaveBeenCalled();
    expect(api.generatePagePlanFromInstruction).not.toHaveBeenCalled();
    expect(api.generateAiModificationPlan).not.toHaveBeenCalled();
    expect(api.confirmPageComposition).not.toHaveBeenCalled();
    expect(api.confirmAiModificationPlan).not.toHaveBeenCalled();
    expect(api.discardAiGeneration).not.toHaveBeenCalled();
    expect(thread().messages.filter((message) => message.role === "user")).toHaveLength(1);
    expect(screen.getByRole("textbox")).toHaveValue("");
    if (variant === "writing") expect(screen.getByText("Improved text")).toBeVisible();
    else if (variant === "composition") {
      expect(screen.getByText("New page draft")).toBeVisible();
      expect(screen.getByRole("button", { name: "Confirm" })).toBeDisabled();
    } else if (variant === "plan") expect(screen.getByRole("button", { name: "Apply changes" })).toBeEnabled();
    else if (variant === "context") {
      expect(screen.getByText("Choose a block.")).toBeVisible();
      expect(screen.queryByRole("button", { name: "Apply changes" })).toBeNull();
      expect(screen.getByText("Or discard this draft.")).toBeVisible();
    } else if (variant === "ambiguous") expect(screen.getByRole("button", { name: "Select" })).toBeEnabled();
    else expect(screen.getByText("Review the result.")).toBeVisible();
  });

  it.each([400, 401, 403, 404, 409, 502, "timeout"] as const)("clears the dispatched input once for %s without restoring/resending it", async (status) => {
    ask.mockRejectedValue(status === "timeout" ? new AxiosError("private", "ECONNABORTED")
      : new AxiosError("private", "ERR_BAD_RESPONSE", undefined, undefined, { status } as never));
    mount(); submit("May already be accepted");
    await waitFor(() => expect(thread()?.operation).toBeNull());
    expect(ask).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("textbox")).toHaveValue("");
    expect(thread().messages.filter((message) => message.role === "user")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
    if (status === "timeout") expect(screen.getByText(/outcome is unknown/)).toBeVisible();
    expect(document.body.textContent).not.toContain("private");
  });

  it("retains text when selected-conversation preflight refuses Send", async () => {
    saveSelectedAiConversation(key(), conversationId);
    detail.mockResolvedValue({ ...foundationConversation, status: "ARCHIVED" });
    mount();
    await waitFor(() => expect(screen.getByRole("textbox")).toBeEnabled());
    submit("Keep this unsent instruction");
    await screen.findByText(/This conversation cannot continue/);
    expect(screen.getByRole("textbox")).toHaveValue("Keep this unsent instruction");
    expect(ask).not.toHaveBeenCalled();
    expect(localStorage.getItem(key()!)).toBe(conversationId);
  });

  it("never clears a newer input revision after metadata verification", async () => {
    saveSelectedAiConversation(key(), conversationId);
    mount(); await waitFor(() => expect(screen.getByRole("textbox")).toBeEnabled());
    const metadata = deferred<AiConversation>();
    detail.mockReturnValue(metadata.promise);
    submit("Original input");
    act(() => useAiChatStore.getState().setInput(scope(), "New text typed later"));
    await act(async () => { metadata.resolve(foundationConversation); });
    await waitFor(() => expect(ask).toHaveBeenCalledTimes(1));
    expect(ask.mock.calls[0][0].instruction).toBe("Original input");
    expect(screen.getByRole("textbox")).toHaveValue("New text typed later");
  });

  it("does not lose local feedback when selected history refreshes", async () => {
    saveSelectedAiConversation(key(), conversationId);
    const { client } = mount();
    await waitFor(() => expect(screen.getByRole("textbox")).toBeEnabled());
    submit(); await screen.findByText("Review the result.");
    await act(async () => { await client.invalidateQueries({ queryKey: aiHistoryKeys.all }); });
    expect(screen.getByText("Review the result.")).toBeVisible();
    // The AI's own Vietnamese question says what to send again; no English hint is added.
    expect(screen.queryByText(/Send a complete request/)).toBeNull();
    expect(thread().messages).toHaveLength(2);
  });

  it("blocks duplicate clicks and conflicting actions synchronously while pending", async () => {
    const pending = deferred<AiAskResponse>(); ask.mockReturnValue(pending.promise);
    mount(); submit("One request");
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    await waitFor(() => expect(ask).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
    await act(async () => { pending.resolve({ ...askResponses.clarification, requestId: ask.mock.calls[0][0].requestId! }); });
    expect(ask).toHaveBeenCalledTimes(1);
  });
});

describe("Home → Chat scoped one-time handoff", () => {
  it.each([false, true])("submits only after Chat mounts, exactly once (StrictMode=%s)", async (strict) => {
    respond("writing");
    saveSelectedAiConversation(key(), "previous-conversation");
    detail.mockResolvedValueOnce({ ...foundationConversation, id: "previous-conversation" }).mockResolvedValue(foundationConversation);
    const ui = mount(true, undefined, strict);
    await waitFor(() => expect(screen.getByRole("textbox")).toBeEnabled());
    submit("Original Home instruction");
    expect(view.push).toHaveBeenCalledTimes(1);
    expect(view.push).toHaveBeenCalledWith("/dashboard/ai/chat");
    expect(ask).not.toHaveBeenCalled();
    expect(localStorage.getItem(key()!)).toBe("");
    expect(thread().pendingSubmission?.instruction).toBe("Original Home instruction");
    ui.rerender(<AiChat />);
    await screen.findByText("Improved text");
    expect(ask).toHaveBeenCalledTimes(1);
    expect(ask.mock.calls[0][0].instruction).toBe("Original Home instruction");
    expect(ask.mock.calls[0][0]).not.toHaveProperty("conversationId");
    expect(thread().pendingSubmission).toBeNull();
    ui.rerender(<AiChatHome />);
    ui.rerender(<AiChat />);
    await act(async () => {});
    expect(ask).toHaveBeenCalledTimes(1);
    expect(thread().messages.filter((message) => message.role === "user")).toHaveLength(1);
  });

  it.each(["user", "workspace", "selection", "edited-input", "new-chat", "page"] as const)("cancels auto-submit after %s changes", async (change) => {
    const ui = mount(true);
    submit("Home scoped instruction");
    if (change === "user") view.user = { id: "different-user", lastActiveWorkspaceId: workspaceId };
    if (change === "workspace") view.user = { id: "user-1", lastActiveWorkspaceId: "workspace-2" };
    if (change === "selection") act(() => saveSelectedAiConversation(key(), "different-conversation"));
    if (change === "edited-input") act(() => useAiChatStore.getState().setInput(scope(), "Edited after submit"));
    if (change === "new-chat") act(() => { useAiChatStore.getState().newChat(scope()); });
    ui.rerender(<AiChat currentPageId={change === "page" ? pageId : undefined} />);
    await act(async () => {});
    expect(ask).not.toHaveBeenCalled();
    expect(Object.values(useAiChatStore.getState().threads).some((item) => item.pendingSubmission)).toBe(false);
  });

  it("does not navigate or clear selection when reset is refused between render and click", async () => {
    saveSelectedAiConversation(key(), conversationId);
    mount(true); await waitFor(() => expect(screen.getByRole("textbox")).toBeEnabled());
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Keep me" } });
    act(() => {
      useAiChatStore.getState().beginRequest(scope(), "busy", "preparing");
      fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    });
    expect(view.push).not.toHaveBeenCalled();
    expect(localStorage.getItem(key()!)).toBe(conversationId);
    expect(thread().input).toBe("Keep me");
    expect(ask).not.toHaveBeenCalled();
  });

  it("does not navigate to a recent chat when selection is refused", async () => {
    vi.mocked(api.listAiConversations).mockResolvedValue({ items: [foundationConversation], nextCursor: null });
    mount(true); await screen.findByRole("button", { name: /Foundation/ });
    act(() => {
      useAiChatStore.getState().beginRequest(scope(), "busy", "preparing");
      fireEvent.click(screen.getByRole("button", { name: /Foundation/ }));
    });
    expect(view.push).not.toHaveBeenCalled();
    expect(thread().conversationId).toBeNull();
  });
});

describe("Unified candidates and GET-only preview recovery on UI", () => {
  it("uses original context, replaces candidates, and creates no second USER", async () => {
    respond("ambiguous"); const ui = mount(); submit("Original candidate instruction");
    const select = await screen.findByRole("button", { name: "Select" });
    expect(screen.getByText("QA")).toBeVisible();
    act(() => useAiChatStore.getState().setInput(scope(), "New Composer text"));
    respond("plan"); detail.mockResolvedValue(pageConversation);
    fireEvent.click(select); fireEvent.click(select);
    await screen.findByRole("button", { name: "Apply changes" });
    expect(ask).toHaveBeenCalledTimes(2);
    const [first, second] = ask.mock.calls.map(([body]) => body);
    expect(second).toMatchObject({ instruction: first.instruction, selectedPageId: pageId });
    expect(second.requestId).not.toBe(first.requestId);
    expect(screen.queryByRole("button", { name: "Select" })).toBeNull();
    expect(thread().messages.filter((message) => message.role === "user")).toHaveLength(1);
    expect(screen.getByRole("textbox")).toHaveValue("New Composer text");
    await act(async () => { await ui.client.invalidateQueries({ queryKey: aiHistoryKeys.all }); });
    expect(screen.getByRole("button", { name: "Apply changes" })).toBeVisible();
  });

  it("plans a Page found in the sentence only after the user picks it (M1b)", async () => {
    ask.mockImplementation(async (request) => ({
      ...(request.selectedPageId ? sentenceResponses.plan : sentenceResponses.ambiguous), requestId: request.requestId!,
    } as AiAskResponse));
    detail.mockResolvedValue(pageConversation);
    mount(); submit("thêm checklist vào trang qa");
    expect(await screen.findByText('Ý bạn là trang "QA"? Chọn trang để tiếp tục:')).toBeVisible();
    expect(screen.queryByRole("button", { name: "Apply changes" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Select" }));
    expect(await screen.findByRole("button", { name: "Apply changes" })).toBeEnabled();
    expect(ask).toHaveBeenCalledTimes(2);
    expect(ask.mock.calls[1][0]).toMatchObject({ instruction: "thêm checklist vào trang qa", selectedPageId: pageId });
    expect(api.confirmAiModificationPlan).not.toHaveBeenCalled();
  });

  it("keeps recovery on failed GET, disables during retry and replaces it only after verified GET", async () => {
    respond("plan"); detail.mockResolvedValue(pageConversation);
    getGeneration.mockRejectedValueOnce(new Error("private")).mockRejectedValueOnce(new Error("private"));
    mount(); submit();
    let retry = await screen.findByRole("button", { name: "Retry loading preview" });
    expect(screen.queryByRole("button", { name: "Apply changes" })).toBeNull();
    fireEvent.click(retry); await waitFor(() => expect(getGeneration).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(retry).toBeEnabled());
    expect(thread().messages.at(-1)?.previewRecovery?.generationId).toBe(generationId);
    const pending = deferred<AiGeneration>(); getGeneration.mockReturnValue(pending.promise);
    fireEvent.click(retry); fireEvent.click(retry);
    await waitFor(() => expect(getGeneration).toHaveBeenCalledTimes(3));
    retry = screen.getByRole("button", { name: "Retry loading preview" });
    expect(retry).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Apply changes" })).toBeNull();
    await act(async () => { pending.resolve(plan()); });
    expect(await screen.findByRole("button", { name: "Apply changes" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Retry loading preview" })).toBeNull();
    expect(ask).toHaveBeenCalledTimes(1);
    expect(api.confirmAiModificationPlan).not.toHaveBeenCalled();
  });

  it("drops preview retry results after switching Page", async () => {
    respond("plan"); detail.mockResolvedValue(pageConversation); getGeneration.mockRejectedValueOnce(new Error("failed"));
    const ui = mount(); submit();
    const retry = await screen.findByRole("button", { name: "Retry loading preview" });
    const pending = deferred<AiGeneration>(); getGeneration.mockReturnValue(pending.promise);
    fireEvent.click(retry); await waitFor(() => expect(getGeneration).toHaveBeenCalledTimes(2));
    ui.rerender(<AiChat currentPageId="other-page" />);
    await act(async () => { pending.resolve(plan()); });
    expect(screen.queryByRole("button", { name: "Apply changes" })).toBeNull();
    expect(thread().messages.at(-1)?.previewRecovery?.generationId).toBe(generationId);
  });
});

describe("Composition content review and saved draft safety", () => {
  const composition = (): AiGeneration => ({
    ...foundationGeneration, capability: "GENERATE_PAGE_COMPOSITION",
    output_data: { schemaVersion: 1, type: "PAGE_COMPOSITION", page: { title: "Full draft" },
      blocks: [{ ref: "intro", type: "TEXT", content: { text: "<script>untrusted()</script>" } }],
      databases: [{ ref: "db", name: "Team", properties: [{ ref: "title", name: "Person", type: "TITLE" }], views: [{ ref: "table", name: "All people", type: "TABLE" }],
        rows: [{ values: { title: "AI inferred person" } }] }] },
    preview: { type: "PAGE_COMPOSITION", page: { title: "Full draft", icon: null, cover_url: null }, summary: { blocks: 1, databases: 1, database_rows: 1 } },
  });
  it("shows all generated data as escaped read-only text and requires review before explicit Confirm", async () => {
    const generation = composition();
    ask.mockImplementation(async (request) => ({ ...askResponses.composition, generation, requestId: request.requestId! }));
    getGeneration.mockResolvedValue(generation);
    vi.mocked(api.confirmPageComposition).mockResolvedValue({
      generation: { ...generation, status: "APPLIED" }, execution: { pageId: "created-page", blockIds: {}, databaseIds: {}, propertyIds: {}, optionIds: {}, viewIds: {}, rowIds: {} },
    });
    mount(); submit();
    const confirm = await screen.findByRole("button", { name: "Confirm" });
    const approved = screen.getByRole("checkbox", { name: /I have reviewed/ });
    expect(confirm).toBeDisabled(); expect(approved).toBeDisabled();
    const details = screen.getByText("Review full generated content").closest("details")!;
    fireEvent.click(screen.getByText("Review full generated content"));
    await waitFor(() => expect(approved).toBeEnabled());
    expect(details.textContent).toContain("AI inferred person");
    expect(details.textContent).toContain("<script>untrusted()</script>");
    // Rendered like the page, not as raw JSON.
    expect(details.querySelector("pre")).toBeNull();
    expect(details.textContent).not.toContain("schemaVersion");
    expect(within(details).getByRole("columnheader", { name: "Person" })).toBeInTheDocument();
    expect(within(details).getByText("Team")).toBeInTheDocument();
    expect(details.querySelector("script")).toBeNull();
    expect(details.querySelector("textarea, input, [contenteditable]")).toBeNull();
    expect(confirm).toBeDisabled();
    fireEvent.click(approved);
    expect(confirm).toBeEnabled();
    expect(api.confirmPageComposition).not.toHaveBeenCalled();
    fireEvent.click(confirm); fireEvent.click(confirm);
    await waitFor(() => expect(api.confirmPageComposition).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(view.push).toHaveBeenCalledWith("/page/created-page"));
  });

  it("invalidates content approval when generated data changes", async () => {
    const generation = composition();
    const onConfirm = vi.fn();
    const ui = render(<AiPageCompositionPreview generation={generation} requireContentReview onConfirm={onConfirm} onDiscard={vi.fn()} />);
    fireEvent.click(screen.getByText("Review full generated content"));
    const approved = screen.getByRole("checkbox");
    await waitFor(() => expect(approved).toBeEnabled());
    fireEvent.click(approved);
    expect(screen.getByRole("button", { name: "Confirm" })).toBeEnabled();
    ui.rerender(<AiPageCompositionPreview generation={{ ...generation, updated_at: "2026-10-22T00:00:00Z" }} requireContentReview onConfirm={onConfirm} onDiscard={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Confirm" })).toBeDisabled();
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("hides raw draft JSON stored as message content and shows only the composition card", () => {
    const generation = composition();
    const ui = render(<AiMessageItem generationContext={{ workspaceId: generation.workspace_id! }}
      message={{ id: "saved", role: "assistant", content: JSON.stringify(generation.output_data), capability: generation.capability, generation, createdAt: generation.created_at }}
      onConfirmAiModificationPlan={vi.fn()} onConfirmPageComposition={vi.fn()} onDiscardGeneration={vi.fn()} />);
    // The collapsed review <pre> may hold the draft; the chat bubble must not.
    const paragraphs = Array.from(ui.container.querySelectorAll("p"), (p) => p.textContent ?? "");
    expect(paragraphs.some((text) => text.includes("schemaVersion"))).toBe(false);
    expect(screen.getAllByText("Full draft").length).toBeGreaterThan(0);
  });

  it.each(["unknown", "malformed", "wrong-workspace", "wrong-page"] as const)("does not expose actions for %s generation", (failure) => {
    const generation = plan();
    if (failure === "unknown") Object.assign(generation, { capability: "future.capability" });
    if (failure === "malformed") generation.output_data = { type: "AI_MODIFICATION_PLAN" };
    if (failure === "wrong-workspace") generation.workspace_id = "other";
    const onConfirm = vi.fn(), onDiscard = vi.fn();
    render(<AiMessageItem generationContext={{ workspaceId, pageId: failure === "wrong-page" ? "other" : pageId }}
      message={{ id: "unsafe", role: "assistant", content: "", capability: generation.capability, generation, createdAt: generation.created_at }}
      onConfirmAiModificationPlan={onConfirm} onConfirmPageComposition={vi.fn()} onDiscardGeneration={onDiscard} />);
    expect(screen.getByRole("alert")).toHaveTextContent("could not be verified");
    expect(screen.queryByRole("button", { name: /Apply|Confirm|Discard/ })).toBeNull();
    expect(onConfirm).not.toHaveBeenCalled(); expect(onDiscard).not.toHaveBeenCalled();
  });

  it.each(["conversation", "workspace", "identity"] as const)("rejects a saved draft with wrong %s before displaying actions", async (mismatch) => {
    saveSelectedAiConversation(key(pageId), conversationId); detail.mockResolvedValue(pageConversation);
    vi.mocked(api.listAiConversations).mockResolvedValue({ items: [pageConversation], nextCursor: null });
    vi.mocked(api.listAiConversationGenerations).mockResolvedValue({ items: [plan()], nextCursor: null });
    const generation = plan();
    if (mismatch === "conversation") generation.conversation_id = "other";
    if (mismatch === "workspace") generation.workspace_id = "other";
    if (mismatch === "identity") generation.id = "other";
    getGeneration.mockResolvedValue(generation);
    mount(false, pageId);
    await waitFor(() => expect(screen.getByRole("textbox")).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: /History/ }));
    fireEvent.click(await screen.findByRole("button", { name: /Page modification/ }));
    await waitFor(() => expect(getGeneration).toHaveBeenCalled());
    await act(async () => {});
    expect(screen.queryByText("Saved generation preview")).toBeNull();
    expect(screen.queryByRole("button", { name: /Apply changes|Confirm|Discard/ })).toBeNull();
  });

  it("does not surface a saved-draft GET failure after its viewer unmounts", async () => {
    saveSelectedAiConversation(key(pageId), conversationId); detail.mockResolvedValue(pageConversation);
    vi.mocked(api.listAiConversations).mockResolvedValue({ items: [pageConversation], nextCursor: null });
    vi.mocked(api.listAiConversationGenerations).mockResolvedValue({ items: [plan()], nextCursor: null });
    const pending = deferred<AiGeneration>(); getGeneration.mockReturnValue(pending.promise);
    const ui = mount(false, pageId);
    await waitFor(() => expect(screen.getByRole("textbox")).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: /History/ }));
    fireEvent.click(await screen.findByRole("button", { name: /Page modification/ }));
    await waitFor(() => expect(getGeneration).toHaveBeenCalledTimes(1));
    ui.unmount();
    await act(async () => { pending.reject(new Error("late failure")); });
    expect(view.toastError).not.toHaveBeenCalled();
  });
});


describe("chat nhiều lượt: the server opens a new conversation for the next request", () => {
  const newId = "66666666-6666-4666-8666-666666666666";
  const notice = /Started a new conversation for this request/;
  const switched = <T extends { conversationId: string; planning: { plan: object } }>(response: T, withFlag = true) =>
    ({ ...response, conversationId: newId, ...(withFlag ? { conversationSwitched: true } : {}),
      planning: { ...response.planning, plan: { ...response.planning.plan, conversationId: newId } } }) as unknown as AiAskResponse;
  const answer = (response: AiAskResponse) => ask.mockImplementation(async (request) => ({ ...response, requestId: request.requestId! }));
  beforeEach(() => {
    getGeneration.mockImplementation(async () => ({ ...plan(), conversation_id: newId }));
  });

  it.each([
    ["a translation", "writing", "Improved text"],
    ["a new page draft", "composition", "New page draft"],
  ] as const)("moves a page edit after %s to the new PAGE conversation", async (_label, first, firstText) => {
    detail.mockImplementation(async (id) => id === newId ? { ...pageConversation, id: newId } : foundationConversation);
    respond(first); mount(); submit("Dịch sang tiếng Anh: Xin chào");
    expect(await screen.findByText(firstText)).toBeVisible();
    await waitFor(() => expect(thread()?.operation).toBeNull());
    expect(thread().conversationId).toBe(conversationId);
    answer(switched(askResponses.plan)); submit("Thêm checklist vào trang QA");
    expect(await screen.findByRole("button", { name: "Apply changes" })).toBeEnabled();
    expect(screen.getByText(notice)).toBeVisible();
    expect(ask.mock.calls[1][0]).toMatchObject({ conversationId });
    expect(thread().conversationId).toBe(newId);
    expect(getSelectedAiConversation(key())).toBe(newId);
    // The current turn stays; the earlier turn remains in the previous conversation (History).
    expect(screen.getByText("Thêm checklist vào trang QA")).toBeVisible();
    expect(screen.queryByText(firstText)).toBeNull();
  });

  it("moves a translation after a page edit to a new GLOBAL conversation", async () => {
    detail.mockImplementation(async (id) => id === newId ? { ...foundationConversation, id: newId } : pageConversation);
    getGeneration.mockResolvedValue(plan());
    respond("plan"); mount(); submit("Thêm checklist vào trang QA");
    await screen.findByRole("button", { name: "Apply changes" });
    await waitFor(() => expect(thread()?.operation).toBeNull());
    answer({ ...askResponses.writing, conversationId: newId, conversationSwitched: true,
      generation: { ...askResponses.writing.generation, conversation_id: newId } } as AiAskResponse);
    submit("Dịch sang tiếng Anh: Xin chào");
    expect(await screen.findByText("Improved text")).toBeVisible();
    expect(screen.getByText(notice)).toBeVisible();
    expect(screen.queryByRole("button", { name: "Apply changes" })).toBeNull();
    expect(thread().conversationId).toBe(newId);
  });

  it("moves an edit of another Page out of the first Page's conversation without a denial", async () => {
    detail.mockImplementation(async (id) => ({ ...pageConversation, id }));
    getGeneration.mockResolvedValueOnce(plan()).mockImplementation(async () => ({ ...plan(), conversation_id: newId }));
    const denials = useAiChatStore.getState().accessDenials.length;
    respond("plan"); mount(); submit("Thêm checklist vào trang A");
    await screen.findByRole("button", { name: "Apply changes" });
    await waitFor(() => expect(thread()?.operation).toBeNull());
    answer(switched(askResponses.plan)); submit("Thêm checklist vào trang B");
    await screen.findByText(notice);
    expect(screen.getAllByRole("button", { name: "Apply changes" })).toHaveLength(1);
    expect(thread().conversationId).toBe(newId);
    expect(useAiChatStore.getState().accessDenials).toHaveLength(denials);
  });

  it("keeps a candidate choice in the new conversation after the switch", async () => {
    detail.mockImplementation(async (id) => id === newId ? { ...pageConversation, id: newId } : foundationConversation);
    respond("writing"); mount(); submit("Dịch sang tiếng Anh: Xin chào");
    await screen.findByText("Improved text");
    await waitFor(() => expect(thread()?.operation).toBeNull());
    ask.mockImplementation(async (request) => ({
      ...(request.selectedPageId ? switched(sentenceResponses.plan) : sentenceResponses.ambiguous), requestId: request.requestId!,
    } as AiAskResponse));
    submit("thêm checklist vào trang qa");
    fireEvent.click(await screen.findByRole("button", { name: "Select" }));
    const apply = await screen.findByRole("button", { name: "Apply changes" });
    expect(apply).toBeEnabled();
    expect(ask.mock.calls[2][0]).toMatchObject({ conversationId, selectedPageId: pageId });
    expect(screen.getByText(notice)).toBeVisible();
    // The notice takes the candidate list's place, so the draft follows it.
    expect(screen.getByText(notice).compareDocumentPosition(apply) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Select" })).toBeNull();
    expect(screen.getByText("thêm checklist vào trang qa")).toBeVisible();
    expect(thread().conversationId).toBe(newId);
  });

  it("still refuses another conversation without the server's flag", async () => {
    detail.mockImplementation(async (id) => id === newId ? { ...pageConversation, id: newId } : foundationConversation);
    respond("writing"); mount(); submit("Dịch sang tiếng Anh: Xin chào");
    await screen.findByText("Improved text");
    await waitFor(() => expect(thread()?.operation).toBeNull());
    answer(switched(askResponses.plan, false)); submit("Thêm checklist vào trang QA");
    expect(await screen.findByText(/could not be verified/)).toBeVisible();
    expect(screen.queryByRole("button", { name: "Apply changes" })).toBeNull();
    expect(thread().conversationId).toBe(conversationId);
  });
});
