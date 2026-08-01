import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SprintSectionHeader } from "@/features/sprint/components/SprintSectionHeader";
import { startSprintApi } from "@/services/sprint/sprint.service";
import { createWrapper } from "../../utils/test-utils";
import { toast } from "sonner";
import { SPRINT_KEY } from "@/services/sprint/type";

vi.mock("@/services/sprint/sprint.service", () => ({
  startSprintApi: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ slug: "workspace1" }),
  usePathname: () => "/dashboard/workspace1/projects/pj1",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

vi.mock("@/features/permission/components/RequirePermission", () => ({
  RequirePermission: ({ children }: any) => <>{children}</>,
}));

global.HTMLElement.prototype.hasPointerCapture = vi.fn();
global.HTMLElement.prototype.releasePointerCapture = vi.fn();

describe("Start Sprint Integration Flow", () => {
  const defaultProps = {
    sprint: { id: "sp1", name: "Alpha Sprint", tasks: [] } as any,
    status: "PLANNED",
    projectId: "pj1",
    workspaceId: "ws1",
    open: true,
    onToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Hiển thị dialog Start Sprint và Submit thành công", async () => {
    const user = userEvent.setup();
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    vi.mocked(startSprintApi).mockResolvedValueOnce({ success: true });

    render(<SprintSectionHeader {...defaultProps} />, { wrapper });

    // "Start sprint" is a button rendered directly
    const startButton = await screen.findByRole("button", { name: "Start sprint" });
    await user.click(startButton);

    // Dialog should appear
    const dialogTitle = await screen.findByRole("heading", { name: /Start sprint/i });
    expect(dialogTitle).toBeInTheDocument();

    // Wait a bit to ensure dialog is fully open and interactive before clicking submit, otherwise Radix UI might ignore it
    // Actually, testing-library can click it. Let's find the submit button inside the dialog
    // Start sprint dialog has multiple buttons (Cancel, Start sprint). The submit button is likely "Start" or "Start sprint"
    const submitButton = await screen.findByRole("button", { name: "Start" });
    await user.click(submitButton);

    // Check API called
    await waitFor(() => {
      expect(startSprintApi).toHaveBeenCalledWith(expect.objectContaining({
        workspaceId: "ws1",
        projectId: "pj1",
        sprintId: "sp1",
      }));
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [SPRINT_KEY.SPRINTS] });
  });

  it("2. Start thất bại: Hiện lỗi và dialog không đóng", async () => {
    const user = userEvent.setup();
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(startSprintApi).mockRejectedValueOnce({
      response: { data: { message: "Server error starting sprint" } }
    });

    render(<SprintSectionHeader {...defaultProps} />, { wrapper });

    const startButton = await screen.findByRole("button", { name: "Start sprint" });
    await user.click(startButton);

    const submitButton = await screen.findByRole("button", { name: "Start" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Không thể bắt đầu sprint.");
    });

    expect(invalidateSpy).not.toHaveBeenCalled();
    expect(screen.getAllByRole("heading", { name: /Start sprint/i }).length).toBeGreaterThan(0);
    
    consoleErrorSpy.mockRestore();
  });
});
