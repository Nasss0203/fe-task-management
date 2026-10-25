import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getAiGeneration } from "@/entities/ai-assistant/api/ai-assistant.api";
import { AiModificationActionDialog } from "@/widgets/ai-chat/ui/AiModificationActionDialog";
import { foundationGeneration } from "../unit/ai-foundation.fixtures";
import { askResponses, generationId, pageId, workspaceId } from "../unit/ai-ask.fixtures";
vi.mock("@/entities/ai-assistant/api/ai-assistant.api", () => ({ getAiGeneration: vi.fn() }));
vi.mock("@/entities/page/model/page.queries", () => ({
  usePage: (id?: string, enabled = true) => ({ data: id && enabled ? { id, title: "Release Plan" } : undefined, isPending: false }),
}));
afterEach(() => { cleanup(); vi.resetAllMocks(); });
const action = { kind: "apply" as const, generationId, pageId };
const generation = { ...foundationGeneration, capability: "GENERATE_PAGE_MODIFICATION_PLAN" as const, output_data: askResponses.plan.planning.plan };
describe("FIX07 dialog token verification", () => {
  it("GET uses token; switching/removing it hides old verified output before revalidation", async () => {
    vi.mocked(getAiGeneration).mockResolvedValueOnce(generation).mockReturnValue(new Promise(() => {}));
    const props = { action, workspaceId, pending: false, onClose: vi.fn(), onConfirm: vi.fn() };
    const { rerender } = render(<AiModificationActionDialog {...props} shareToken="secret-A" />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Confirm apply" })).toBeEnabled());
    expect(getAiGeneration).toHaveBeenCalledWith(generationId, expect.any(AbortSignal), "secret-A");
    rerender(<AiModificationActionDialog {...props} shareToken="secret-B" />);
    expect(screen.getByRole("button", { name: "Confirm apply" })).toBeDisabled();
    expect(screen.queryByText(generation.output_data.summary)).toBeNull();
    expect(getAiGeneration).toHaveBeenLastCalledWith(generationId, expect.any(AbortSignal), "secret-B");
    rerender(<AiModificationActionDialog {...props} />);
    expect(screen.getByRole("button", { name: "Confirm apply" })).toBeDisabled();
    expect(screen.queryByText(generation.output_data.summary)).toBeNull();
  });
  it("cancelled A rejection cannot call B denial callback", async () => {
    let reject!: (reason: unknown) => void;
    vi.mocked(getAiGeneration).mockReturnValueOnce(new Promise((_yes, no) => { reject = no; })).mockResolvedValue(generation);
    const onAccessError = vi.fn();
    const props = { action, workspaceId, pending: false, onClose: vi.fn(), onConfirm: vi.fn(), onAccessError };
    const { rerender } = render(<AiModificationActionDialog {...props} shareToken="secret-A" />);
    rerender(<AiModificationActionDialog {...props} shareToken="secret-B" />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Confirm apply" })).toBeEnabled());
    await act(async () => { reject({ response: { status: 403 } }); });
    expect(onAccessError).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Confirm apply" })).toBeEnabled();
  });
});
