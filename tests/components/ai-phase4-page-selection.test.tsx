import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AiMessageItem } from "@/widgets/ai-chat/ui/AiMessageItem";
import type { AiChatMessage } from "@/widgets/ai-chat/model/types";

describe("Phase 4 Page resolution UI", () => {
  it("lists all authorized candidates and sends the exact selected ID", () => {
    const onSelectPageCandidate = vi.fn();
    const message: AiChatMessage = {
      id: "assistant-1",
      role: "assistant",
      content: "Choose a page",
      capability: "GENERATE_PAGE_MODIFICATION_PLAN",
      createdAt: "2026-10-18T12:00:00Z",
      pageSelection: {
        workspaceId: "workspace-1",
        instruction: "Thêm checklist vào page Release 2.0",
        candidates: [
          { pageId: "page-a", workspaceId: "workspace-1", title: "Release 2.0", parentPageId: null, teamspaceId: null },
          { pageId: "page-b", workspaceId: "workspace-1", title: "Release 2.0", parentPageId: "parent-b", teamspaceId: null },
        ],
      },
    };
    render(<AiMessageItem message={message} onSelectPageCandidate={onSelectPageCandidate}
      onConfirmAiModificationPlan={vi.fn()} onConfirmPageComposition={vi.fn()} onDiscardGeneration={vi.fn()} />);
    expect(screen.getAllByRole("button", { name: "Select" })).toHaveLength(2);
    fireEvent.click(screen.getAllByRole("button", { name: "Select" })[1]);
    expect(onSelectPageCandidate).toHaveBeenCalledWith("assistant-1", "page-b");
  });
});
