import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SprintSectionHeader } from "@/features/sprint/components/SprintSectionHeader";
import { cancelSprintApi, deleteSprintApi } from "@/services/sprint/sprint.service";
import { createWrapper } from "../../utils/test-utils";
import { toast } from "sonner";
import { SPRINT_KEY } from "@/services/sprint/type";
import { TASK_KEY } from "@/services/task/type";

// Mock Service Boundary
vi.mock("@/services/sprint/sprint.service", () => ({
  cancelSprintApi: vi.fn(),
  deleteSprintApi: vi.fn(),
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
  RequirePermission: ({ children }: any) => {
    return <>{children}</>;
  },
}));

// Polyfills
global.HTMLElement.prototype.hasPointerCapture = vi.fn();
global.HTMLElement.prototype.releasePointerCapture = vi.fn();

describe("Cancel Sprint Integration Flow", () => {
  const defaultProps = {
    sprint: { id: "sp1", name: "Alpha Sprint", tasks: [] } as any,
    status: "ACTIVE",
    projectId: "pj1",
    workspaceId: "ws1",
    open: true,
    onToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Hiển thị dialog Cancel Sprint từ Dropdown và Submit thành công", async () => {
    const user = userEvent.setup();
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    vi.mocked(cancelSprintApi).mockResolvedValueOnce({ success: true });

    render(<SprintSectionHeader {...defaultProps} />, { wrapper });

    // Open dropdown
    const menuButtons = screen.getAllByRole("button");
    const dropdownTrigger = menuButtons[menuButtons.length - 1];
    await user.click(dropdownTrigger);

    // Click Cancel sprint option
    const cancelOption = await screen.findByRole("menuitem", { name: /Hủy sprint/i });
    fireEvent.click(cancelOption);

    // Dialog should appear
    const dialogTitle = await screen.findByRole("heading", { name: /Hủy sprint/i });
    expect(dialogTitle).toBeInTheDocument();
    
    // Check warning text contains sprint name
    expect(screen.getAllByText(/Alpha Sprint/).length).toBeGreaterThan(1);

    // Confirm cancel
    const confirmButton = await screen.findByRole("button", { name: "Hủy sprint" });
    await user.click(confirmButton);

    // Check API called
    await waitFor(() => {
      expect(cancelSprintApi).toHaveBeenCalledWith({
        workspaceId: "ws1",
        projectId: "pj1",
        sprintId: "sp1",
      });
    });

    // Check Delete is NOT called
    expect(deleteSprintApi).not.toHaveBeenCalled();

    // Check Invalidations
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [SPRINT_KEY.SPRINTS] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [TASK_KEY.TASK_BACKLOG] });
  });

  it("2. Cancel thất bại: Hiện lỗi, dialog không đóng, không invalidate cache", async () => {
    const user = userEvent.setup();
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(cancelSprintApi).mockRejectedValueOnce({
      response: { data: { message: "Server error" } }
    });

    render(<SprintSectionHeader {...defaultProps} />, { wrapper });

    const menuButtons = screen.getAllByRole("button");
    const dropdownTrigger = menuButtons[menuButtons.length - 1];
    await user.click(dropdownTrigger);

    const cancelOption = await screen.findByRole("menuitem", { name: /Hủy sprint/i });
    fireEvent.click(cancelOption);

    const confirmButton = await screen.findByRole("button", { name: "Hủy sprint" });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(cancelSprintApi).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("Không thể hủy sprint.");
    });

    // Cache not invalidated
    expect(invalidateSpy).not.toHaveBeenCalled();

    // Dialog remains open (title still visible)
    expect(screen.getAllByRole("heading", { name: /Hủy sprint/i }).length).toBeGreaterThan(0);
    
    consoleErrorSpy.mockRestore();
  });
});
