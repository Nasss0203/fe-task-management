import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AiConversation, AiGeneration } from "@/entities/ai-assistant/model/ai-assistant.types";
import {
  aiHistorySelectionKey,
  saveSelectedAiConversation,
  useSelectedAiConversation,
} from "@/widgets/ai-chat/model/ai-history-selection";
import { AiChatHistory } from "@/widgets/ai-chat/ui/AiChatHistory";

const conversation: AiConversation = {
  id: "conversation-1",
  workspace_id: "workspace-1",
  scope: "PAGE",
  page_id: "page-1",
  title: "Page AI History",
  status: "ACTIVE",
  created_at: "2026-10-17T08:00:00.000Z",
  updated_at: "2026-10-17T08:00:00.000Z",
};

describe("Phase 4 Chat History UI and refresh selection", () => {
  beforeEach(() => localStorage.clear());

  it("restores only the selected conversation ID after a component remount (F5 simulation)", () => {
    const key = aiHistorySelectionKey("user-1", "workspace-1", "page-1");
    const initial = renderHook(() => useSelectedAiConversation(key));
    expect(initial.result.current).toBeNull();

    act(() => saveSelectedAiConversation(key, conversation.id));
    expect(initial.result.current).toBe(conversation.id);
    initial.unmount();

    const reloaded = renderHook(() => useSelectedAiConversation(key));
    expect(reloaded.result.current).toBe(conversation.id);
    act(() => saveSelectedAiConversation(key, null));
    expect(reloaded.result.current).toBeNull();
    reloaded.unmount();
  });

  it("selects a saved conversation and loads additional history/drafts", () => {
    const onSelectConversation = vi.fn();
    const onLoadConversations = vi.fn();
    const onLoadGenerations = vi.fn();
    const onOpenGeneration = vi.fn();
    const generation = {
      id: "generation-1",
      conversation_id: conversation.id,
      capability: "GENERATE_PAGE_MODIFICATION_PLAN",
      status: "COMPLETED",
    } as AiGeneration;

    render(
      <AiChatHistory
        conversations={[conversation]}
        generations={[generation]}
        selectedConversationId={conversation.id}
        loading={false}
        error={false}
        hasMoreConversations
        hasMoreGenerations
        loadingMoreConversations={false}
        loadingMoreGenerations={false}
        disabled={false}
        onSelectConversation={onSelectConversation}
        onNewChat={vi.fn()}
        onLoadConversations={onLoadConversations}
        onLoadGenerations={onLoadGenerations}
        onOpenGeneration={onOpenGeneration}
      />,
    );
    fireEvent.click(screen.getByText(/Chat history/));
    fireEvent.click(screen.getByRole("button", { name: /Page AI History/ }));
    expect(onSelectConversation).toHaveBeenCalledWith(conversation.id);
    fireEvent.click(screen.getByRole("button", { name: "Load more conversations" }));
    expect(onLoadConversations).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Load more drafts" }));
    expect(onLoadGenerations).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: /Page modification/ }));
    expect(onOpenGeneration).toHaveBeenCalledWith(generation.id);
  });
});
