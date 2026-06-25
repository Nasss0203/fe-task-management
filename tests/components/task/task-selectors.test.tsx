import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskStatusSelect from "@/features/task/components/task/TaskStatusSelect";
import TaskPrioritySelect from "@/features/task/components/task/TaskPrioritySelect";
import { createWrapper } from "../../utils/test-utils";

describe("TaskStatusSelect & TaskPrioritySelect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("TaskStatusSelect", () => {
    const mockOnChange = vi.fn();
    const statuses = [
      { id: "s1", name: "To Do" },
      { id: "s2", name: "In Progress" }
    ];

    it("1. Render dropdown và hiển thị status được chọn", () => {
      const { wrapper } = createWrapper();
      render(<TaskStatusSelect statuses={statuses} value="s1" onChange={mockOnChange} />, { wrapper });

      expect(screen.getByText("To Do")).toBeInTheDocument();
    });

    it("2. Gọi onChange khi chọn status mới", async () => {
      const user = userEvent.setup();
      const { wrapper } = createWrapper();
      render(<TaskStatusSelect statuses={statuses} value="s1" onChange={mockOnChange} />, { wrapper });

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      const item = screen.getByText("In Progress");
      await user.click(item);

      expect(mockOnChange).toHaveBeenCalledWith("s2");
    });
  });

  describe("TaskPrioritySelect", () => {
    const mockOnChange = vi.fn();
    const priorities = [
      { id: "p1", name: "High" },
      { id: "p2", name: "Low" }
    ];

    it("1. Render dropdown và hiển thị priority được chọn", () => {
      const { wrapper } = createWrapper();
      render(<TaskPrioritySelect priorities={priorities} value="p1" onChange={mockOnChange} />, { wrapper });

      expect(screen.getByText("High")).toBeInTheDocument();
    });

    it("2. Gọi onChange khi chọn priority mới", async () => {
      const user = userEvent.setup();
      const { wrapper } = createWrapper();
      render(<TaskPrioritySelect priorities={priorities} value="p1" onChange={mockOnChange} />, { wrapper });

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      const item = screen.getByText("Low");
      await user.click(item);

      expect(mockOnChange).toHaveBeenCalledWith("p2");
    });

    it("3. Pass 'none' khi value là null", async () => {
      const user = userEvent.setup();
      const { wrapper } = createWrapper();
      const prioritiesWithNone = [...priorities, { id: null, name: "None" }];
      
      render(<TaskPrioritySelect priorities={prioritiesWithNone} value={null} onChange={mockOnChange} />, { wrapper });

      expect(screen.getByText("None")).toBeInTheDocument();

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      const itemHigh = screen.getByText("High");
      await user.click(itemHigh);

      expect(mockOnChange).toHaveBeenCalledWith("p1");
    });
  });
});
