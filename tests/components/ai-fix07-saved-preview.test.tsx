import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AxiosError } from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "@/entities/ai-assistant/api/ai-assistant.api";
import type { AiGeneration } from "@/entities/ai-assistant/model/ai-assistant.types";
import { getAiAccessIdentity } from "@/entities/ai-assistant/model/ai-assistant.access";
import { aiHistorySelectionKey, saveSelectedAiConversation } from "@/widgets/ai-chat/model/ai-history-selection";
import { useAiChatStore } from "@/widgets/ai-chat/model/use-ai-chat-store";
import { AiChat } from "@/widgets/ai-chat/ui/AiChat";
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
vi.mock("@/widgets/ai-chat/ui/AiChatComposer", () => ({ AiChatComposer: () => null }));
vi.mock("@/widgets/ai-chat/ui/AiChatHistory", () => ({ AiChatHistory: ({ onOpenGeneration, disabled }: { onOpenGeneration: (id: string) => void; disabled: boolean }) => <button disabled={disabled} onClick={() => onOpenGeneration("55555555-5555-4555-8555-555555555555")}>Open saved draft</button> }));
// Real hook, Query, store, saved-preview state and action dialog. Only the plan's
// visual renderer is replaced; verification and actions still run production code.
vi.mock("@/widgets/ai-chat/ui/AiModificationPlanPreview", () => ({ AiModificationPlanPreview: ({ generation, onConfirm, onDiscard }: { generation: AiGeneration; onConfirm: (id: string, page: string) => void; onDiscard: (id: string) => void }) => <div data-testid="protected-plan">Protected plan
  <button onClick={() => onConfirm(generation.id, "33333333-3333-4333-8333-333333333333")}>Apply protected plan</button>
  <button onClick={() => onDiscard(generation.id)}>Discard protected plan</button></div> }));
const A = "saved-secret-A", B = "saved-secret-B";
const bound = (shareToken: string) => ({ userId: "user-1", workspaceId, pageId, shareToken });
const generation: AiGeneration = { ...foundationGeneration, capability: "GENERATE_PAGE_MODIFICATION_PLAN", output_data: askResponses.plan.planning.plan };
const clients: QueryClient[] = [];
function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  clients.push(client);
  const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  saveSelectedAiConversation(aiHistorySelectionKey("user-1", workspaceId, pageId, getAiAccessIdentity(A)), conversationId);
  return render(<AiChat currentPageId={pageId} pageAccess={bound(A)} />, { wrapper });
}
beforeEach(() => {
  vi.resetAllMocks(); localStorage.clear(); useAiChatStore.setState(useAiChatStore.getInitialState(), true);
  vi.mocked(api.getAiConversation).mockResolvedValue({ ...foundationConversation, scope: "PAGE", page_id: pageId });
  vi.mocked(api.getAiGeneration).mockResolvedValue(generation);
  vi.mocked(api.listAiConversations).mockResolvedValue({ items: [], nextCursor: null });
  vi.mocked(api.listAiConversationMessages).mockResolvedValue({ items: [], nextCursor: null });
  vi.mocked(api.listAiConversationGenerations).mockResolvedValue({ items: [generation], nextCursor: null });
  vi.mocked(api.confirmAiModificationPlan).mockResolvedValue({ generation: { ...generation, status: "APPLIED" }, execution: { createdBlockIds: [], createdRowIds: [] } });
  vi.mocked(api.discardAiGeneration).mockResolvedValue({ ...generation, status: "DISCARDED" });
});
afterEach(() => { cleanup(); clients.splice(0).forEach((client) => client.clear()); });
async function open() {
  await waitFor(() => expect(screen.getByRole("button", { name: "Open saved draft" })).toBeEnabled());
  fireEvent.click(screen.getByRole("button", { name: "Open saved draft" }));
  await screen.findByText("Saved generation preview");
}
describe("FIX07 optional Page-context UI saved previews", () => {
  it.each(["apply", "discard"] as const)("propagates token through saved GET, dialog GET and explicit %s", async (action) => {
    mount(); await open();
    expect(api.getAiGeneration).toHaveBeenCalledWith(generationId, undefined, A);
    fireEvent.click(screen.getByRole("button", { name: action === "apply" ? "Apply protected plan" : "Discard protected plan" }));
    await waitFor(() => expect(screen.getByRole("button", { name: `Confirm ${action}` })).toBeEnabled());
    expect(api.getAiGeneration).toHaveBeenCalledWith(generationId, expect.any(AbortSignal), A);
    fireEvent.click(screen.getByRole("button", { name: `Confirm ${action}` }));
    await waitFor(() => expect(action === "apply" ? api.confirmAiModificationPlan : api.discardAiGeneration).toHaveBeenCalledExactlyOnceWith(generationId, A));
    expect(document.body.textContent).not.toContain(A);
  });

  it.each(["stale", "handled"] as const)("closes the dialog when apply returns 409 for a %s draft", async (kind) => {
    vi.mocked(api.confirmAiModificationPlan).mockImplementation(async () => {
      // The re-read after 409 decides: still COMPLETED means the Page changed.
      if (kind === "handled") vi.mocked(api.getAiGeneration).mockResolvedValue({ ...generation, status: "APPLIED" });
      throw new AxiosError("conflict", "ERR_BAD_RESPONSE", undefined, undefined, { status: 409 } as never);
    });
    mount(); await open();
    fireEvent.click(screen.getByRole("button", { name: "Apply protected plan" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Confirm apply" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Confirm apply" }));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Confirm apply" })).toBeNull());
    expect(api.confirmAiModificationPlan).toHaveBeenCalledTimes(1);
    expect(Boolean(useAiChatStore.getState().staleGenerationIds[generationId])).toBe(kind === "stale");
    expect(view.error).toHaveBeenCalledWith(kind === "stale"
      ? "The page changed after this draft was created. Send your request again to get a new draft."
      : "This AI draft has already been handled.");
  });

  it.each([B, undefined])("closes saved preview and pending dialog on switch to %s", async (token) => {
    const { rerender } = mount(); await open();
    fireEvent.click(screen.getByRole("button", { name: "Apply protected plan" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Confirm apply" })).toBeEnabled());
    rerender(<AiChat currentPageId={pageId} pageAccess={token ? bound(token) : undefined} />);
    expect(screen.queryByText("Saved generation preview")).toBeNull();
    expect(screen.queryByTestId("protected-plan")).toBeNull();
    expect(screen.queryByRole("button", { name: "Confirm apply" })).toBeNull();
    expect(api.confirmAiModificationPlan).not.toHaveBeenCalled();
  });

  it("ignores a deferred A saved-draft rejection after B replaces it", async () => {
    let reject!: (reason: unknown) => void;
    vi.mocked(api.getAiGeneration).mockReturnValueOnce(new Promise((_resolve, no) => { reject = no; }));
    const { rerender } = mount();
    await waitFor(() => expect(screen.getByRole("button", { name: "Open saved draft" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Open saved draft" }));
    await screen.findByText("Loading draft...");
    rerender(<AiChat currentPageId={pageId} pageAccess={bound(B)} />);
    await act(async () => { reject({ response: { status: 403 } }); });
    expect(view.error).not.toHaveBeenCalled();
    expect(useAiChatStore.getState().accessDenials).toEqual([]);
    expect(screen.queryByTestId("protected-plan")).toBeNull();
  });
});
