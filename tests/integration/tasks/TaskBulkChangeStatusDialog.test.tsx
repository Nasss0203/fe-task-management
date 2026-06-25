import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createWrapper } from "../../utils/test-utils";
import { TaskBulkChangeStatusDialog } from "@/features/task/components/task/TaskBulkChangeStatusDialog";

describe("TaskBulkChangeStatusDialog Integration", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    taskIds: ["task-1", "task-2"],
    taskStatus: [
      { id: "status-1", name: "To Do" },
      { id: "status-2", name: "In Progress" },
    ],
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Render đúng dialog và danh sách status", async () => {
    const user = userEvent.setup();
    const { wrapper } = createWrapper();
    render(<TaskBulkChangeStatusDialog {...defaultProps} />, { wrapper });

    expect(screen.getByText("Change status")).toBeInTheDocument();
    
    // Open select dropdown
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("2. Không cho submit nếu chưa chọn status", async () => {
    const user = userEvent.setup();
    const { wrapper } = createWrapper();
    render(<TaskBulkChangeStatusDialog {...defaultProps} />, { wrapper });

    const submitBtn = screen.getByRole("button", { name: "Submit" });
    await user.click(submitBtn);

    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("3. Submit thành công khi đã chọn status", async () => {
    const user = userEvent.setup();
    const { wrapper } = createWrapper();
    render(<TaskBulkChangeStatusDialog {...defaultProps} />, { wrapper });

    // Open select dropdown
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    
    // Select status
    const item = screen.getByText("In Progress");
    await user.click(item);

    // Click submit
    const submitBtn = screen.getByRole("button", { name: "Submit" });
    await user.click(submitBtn);

    expect(defaultProps.onSubmit).toHaveBeenCalledWith({
      taskIds: ["task-1", "task-2"],
      statusId: "status-2",
      sendNotification: false,
    });
  });

  it("4. Hủy bỏ thay đổi khi click Cancel", async () => {
    const user = userEvent.setup();
    const { wrapper } = createWrapper();
    render(<TaskBulkChangeStatusDialog {...defaultProps} />, { wrapper });

    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelBtn);

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });
});
