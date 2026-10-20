import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AiGeneration } from "@/entities/ai-assistant/model/ai-assistant.types";
import { getAiGeneration } from "@/entities/ai-assistant/api/ai-assistant.api";
import { AiModificationActionDialog } from "@/widgets/ai-chat/ui/AiModificationActionDialog";

vi.mock("@/entities/ai-assistant/api/ai-assistant.api", () => ({ getAiGeneration: vi.fn() }));

const action = { kind: "apply" as const, generationId: "gen-1", pageId: "page-1" };
const valid = {
  id: "gen-1", workspace_id: "workspace-1", status: "COMPLETED",
  capability: "GENERATE_PAGE_MODIFICATION_PLAN",
  output_data: {
    schemaVersion: 1, type: "AI_MODIFICATION_PLAN", pageId: "page-1",
    status: "PLAN_READY", summary: "Add a QA heading",
    operations: [{ type: "INSERT_BLOCKS", blocks: [{ type: "TEXT", content: { text: "QA" } }] }],
  },
} as AiGeneration;

describe("Phase 5.3 action confirmation dialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAiGeneration).mockResolvedValue(valid);
  });

  it("must verify generation before allowing a separate confirmation click", async () => {
    const onConfirm = vi.fn();
    render(<AiModificationActionDialog action={action} workspaceId="workspace-1"
      pending={false} onClose={vi.fn()} onConfirm={onConfirm} />);
    expect(screen.getByRole("button", { name: "Confirm apply" }).hasAttribute("disabled")).toBe(true);
    await waitFor(() => expect(screen.getByRole("button", { name: "Confirm apply" }).hasAttribute("disabled")).toBe(false));
    expect(screen.getByText("Add a QA heading")).toBeTruthy();
    expect(screen.getByText(/1 operations/)).toBeTruthy();
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Confirm apply" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("blocks a draft from another workspace", async () => {
    const onConfirm = vi.fn();
    render(<AiModificationActionDialog action={action} workspaceId="workspace-2"
      pending={false} onClose={vi.fn()} onConfirm={onConfirm} />);
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Confirm apply" }).hasAttribute("disabled")).toBe(true);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("does not allow a duplicate confirmation while pending", async () => {
    render(<AiModificationActionDialog action={action} workspaceId="workspace-1"
      pending onClose={vi.fn()} onConfirm={vi.fn()} />);
    await screen.findByText("Add a QA heading");
    expect(screen.getByRole("button", { name: "Confirm apply" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Cancel" }).hasAttribute("disabled")).toBe(true);
  });
});
