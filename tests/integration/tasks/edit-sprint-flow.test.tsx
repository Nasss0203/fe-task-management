import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SprintSectionHeader } from "@/features/sprint/components/SprintSectionHeader";
import { updateSprintApi } from "@/services/sprint/sprint.service";
import { createWrapper } from "../../utils/test-utils";
import { toast } from "sonner";
import { SPRINT_KEY } from "@/services/sprint/type";
import { TASK_KEY } from "@/services/task/type";

vi.mock("@/services/sprint/sprint.service", () => ({
  updateSprintApi: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ slug: "workspace1" }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

vi.mock("@/features/permission/components/RequirePermission", () => ({
  RequirePermission: ({ children }: any) => <>{children}</>,
}));

global.HTMLElement.prototype.hasPointerCapture = vi.fn();
global.HTMLElement.prototype.releasePointerCapture = vi.fn();

describe("Edit Sprint Integration Flow", () => {
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

  it("1. Hiển thị dialog Edit Sprint từ Dropdown và Submit thành công", async () => {
    const user = userEvent.setup();
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    vi.mocked(updateSprintApi).mockResolvedValueOnce({ success: true });

    render(<SprintSectionHeader {...defaultProps} />, { wrapper });

    // Open dropdown
    const menuButtons = screen.getAllByRole("button");
    const dropdownTrigger = menuButtons[menuButtons.length - 1];
    await user.click(dropdownTrigger);

    // Click Edit sprint option
    const editOption = await screen.findByRole("menuitem", { name: /Edit sprint/i });
    fireEvent.click(editOption);

    // Dialog should appear
    const dialogTitle = await screen.findByRole("heading", { name: /Edit sprint/i });
    expect(dialogTitle).toBeInTheDocument();

    const submitButton = await screen.findByRole("button", { name: "Update sprint" });
    await user.click(submitButton);

    // Check API called
    await waitFor(() => {
      expect(updateSprintApi).toHaveBeenCalledWith(expect.objectContaining({
        workspaceId: "ws1",
        projectId: "pj1",
        sprintId: "sp1",
      }));
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [SPRINT_KEY.SPRINTS] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [TASK_KEY.TASK_BACKLOG] });
  });

  it("2. Edit thất bại: Hiện lỗi và dialog không đóng", async () => {
    const user = userEvent.setup();
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(updateSprintApi).mockRejectedValueOnce({
      response: { data: { message: "Server error updating sprint" } }
    });

    render(<SprintSectionHeader {...defaultProps} />, { wrapper });

    const menuButtons = screen.getAllByRole("button");
    const dropdownTrigger = menuButtons[menuButtons.length - 1];
    await user.click(dropdownTrigger);

    const editOption = await screen.findByRole("menuitem", { name: /Edit sprint/i });
    fireEvent.click(editOption);

    const submitButton = await screen.findByRole("button", { name: "Update sprint" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Không thể cập nhật sprint.");
    });

    expect(invalidateSpy).not.toHaveBeenCalled();
    expect(screen.getAllByRole("heading", { name: /Edit sprint/i }).length).toBeGreaterThan(0);
    
    consoleErrorSpy.mockRestore();
  });
});
