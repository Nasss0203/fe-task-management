import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AiMessageItem } from "@/widgets/ai-chat/ui/AiMessageItem";
import type { AiChatMessage } from "@/widgets/ai-chat/model/types";

vi.mock("@/entities/page/model/page.queries", () => ({
  usePagesByWorkspace: (_workspaceId?: string, enabled = true) => ({ data: enabled ? [{ id: "parent-b", title: "Dự án B" }] : undefined }),
}));
vi.mock("@/entities/teamspace/model/teamspace.queries", () => ({
  useTeamspaces: (_workspaceId: string, enabled = true) => ({ data: enabled ? [{ id: "team-c", name: "Marketing" }] : undefined }),
}));

const candidate = (pageId: string, parentPageId: string | null, teamspaceId: string | null) =>
  ({ pageId, workspaceId: "workspace-1", title: "Release 2.0", parentPageId, teamspaceId });

function renderCandidates(onSelectPageCandidate = vi.fn()) {
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
        candidate("page-a", null, null),
        candidate("page-b", "parent-b", null),
        candidate("page-c", "unknown-parent", "team-c"),
      ],
    },
  };
  return render(<AiMessageItem message={message} onSelectPageCandidate={onSelectPageCandidate}
    onConfirmAiModificationPlan={vi.fn()} onConfirmPageComposition={vi.fn()} onDiscardGeneration={vi.fn()} />);
}

describe("Phase 4 Page resolution UI", () => {
  it("lists all authorized candidates and sends the exact selected ID", () => {
    const onSelectPageCandidate = vi.fn();
    renderCandidates(onSelectPageCandidate);
    expect(screen.getAllByRole("button", { name: "Select" })).toHaveLength(3);
    fireEvent.click(screen.getAllByRole("button", { name: "Select" })[1]);
    expect(onSelectPageCandidate).toHaveBeenCalledWith("assistant-1", "page-b");
  });

  it("tells same-named Pages apart by parent and teamspace names, never raw IDs", () => {
    const { container } = renderCandidates();
    expect(screen.getByText("Top-level page")).toBeTruthy();
    expect(screen.getByText("Inside “Dự án B”")).toBeTruthy();
    expect(screen.getByText("Subpage · Marketing")).toBeTruthy();
    expect(container.innerHTML).not.toMatch(/parent-b|unknown-parent|team-c|page-a/);
  });
});
