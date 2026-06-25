import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createWrapper } from "../../utils/test-utils";
import BacklogSection from "@/features/sprint/components/backlog/BacklogSection";
import { createSprintApi } from "@/services/sprint/sprint.service";
import { toast } from "sonner";
import { useTask } from "@/features/task/hooks/useTask";

vi.mock("@/components/table/TableBacklog", () => ({
  __esModule: true,
  default: () => <div data-testid="table-backlog-mock" />
}));

// Mock API
vi.mock("@/services/sprint/sprint.service", () => ({
  createSprintApi: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/features/task/hooks/useTask", () => ({
  useTask: vi.fn(),
}));

describe("Create Sprint Integration Flow", () => {
  const defaultProps = {
    workspaceId: "workspace-1",
    projectId: "project-1",
    containerId: "container-1",
    context: "project" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useTask).mockReturnValue({
      findTaskBacklog: {
        data: { data: [] },
        isLoading: false,
      },
    } as any);
  });

  it("1. Click Create sprint thành công", async () => {
    const user = userEvent.setup();
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    vi.mocked(createSprintApi).mockResolvedValueOnce({ data: { id: "new-sprint" } });

    render(<BacklogSection {...defaultProps} />, { wrapper });

    const createButton = await screen.findByRole("button", { name: "Create sprint" });
    await user.click(createButton);

    await waitFor(() => {
      expect(createSprintApi).toHaveBeenCalledWith({
        workspaceId: "workspace-1",
        projectId: "project-1",
      });
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(["sprints"]),
        })
      );
    });
  });

  it("2. Click Create sprint thất bại: Báo lỗi", async () => {
    const user = userEvent.setup();
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(createSprintApi).mockRejectedValueOnce({
      response: { data: { message: "Server error creating sprint" } }
    });

    render(<BacklogSection {...defaultProps} />, { wrapper });

    const createButton = await screen.findByRole("button", { name: "Create sprint" });
    await user.click(createButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Server error creating sprint");
    });

    expect(invalidateSpy).not.toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });
});
