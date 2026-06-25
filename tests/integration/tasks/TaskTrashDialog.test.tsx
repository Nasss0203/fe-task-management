import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createWrapper } from "../../utils/test-utils";
import TaskTrashDialog from "@/features/task/components/task/TaskTrashDialog";
import { useTask } from "@/features/task/hooks/useTask";
import { toast } from "sonner";

// Mock dependencies
vi.mock("@/features/task/hooks/useTask");
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("TaskTrashDialog Integration", () => {
  const defaultProps = {
    workspaceId: "ws-1",
    projectId: "proj-1",
    open: true,
    onOpenChange: vi.fn(),
    onDeleted: vi.fn(),
    tasks: [{ id: "task-1", title: "Test Task" } as any],
  };

  const mockDeleteTask = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useTask).mockReturnValue({
      deleteTask: {
        mutateAsync: mockDeleteTask,
        isPending: false,
      },
    } as any);
  });

  it("1. Render dialog với 1 task", () => {
    const { wrapper } = createWrapper();
    render(<TaskTrashDialog {...defaultProps} />, { wrapper });

    expect(screen.getByText("Chuyển task vào Thùng rác?")).toBeInTheDocument();
    expect(screen.getByText(/Test Task/)).toBeInTheDocument();
  });

  it("2. Delete thành công và đóng dialog", async () => {
    const user = userEvent.setup();
    const { wrapper } = createWrapper();
    mockDeleteTask.mockResolvedValueOnce({ success: true });

    render(<TaskTrashDialog {...defaultProps} />, { wrapper });

    const confirmButton = screen.getByRole("button", { name: "Chuyển vào Thùng rác" });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledWith({ taskId: "task-1" });
    });

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    expect(defaultProps.onDeleted).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Task đã được chuyển vào thùng rác.");
  });

  it("3. Xử lý lỗi khi delete thất bại", async () => {
    const user = userEvent.setup();
    const { wrapper } = createWrapper();
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mockDeleteTask.mockRejectedValueOnce(new Error("Failed to delete"));

    render(<TaskTrashDialog {...defaultProps} />, { wrapper });

    const confirmButton = screen.getByRole("button", { name: "Chuyển vào Thùng rác" });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Không thể chuyển task vào thùng rác.");
    });

    expect(defaultProps.onOpenChange).not.toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });

  it("4. Delete nhiều tasks thành công", async () => {
    const user = userEvent.setup();
    const { wrapper } = createWrapper();
    const multipleTasksProps = {
      ...defaultProps,
      tasks: [
        { id: "task-1", title: "Task 1" } as any,
        { id: "task-2", title: "Task 2" } as any,
      ]
    };

    mockDeleteTask.mockResolvedValue({ success: true });

    render(<TaskTrashDialog {...multipleTasksProps} />, { wrapper });

    expect(screen.getByText(/2 task/)).toBeInTheDocument();

    const confirmButton = screen.getByRole("button", { name: "Chuyển vào Thùng rác" });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledTimes(2);
      expect(mockDeleteTask).toHaveBeenCalledWith({ taskId: "task-1" });
      expect(mockDeleteTask).toHaveBeenCalledWith({ taskId: "task-2" });
    });

    expect(toast.success).toHaveBeenCalledWith("2 task đã được chuyển vào thùng rác.");
  });
});
