import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAssign } from "@/features/assign/hooks/useAssign";
import { assignService } from "@/services/assign/assign.service";
import { createWrapper } from "../utils/test-utils";
import { TASK_KEY } from "@/services/task/type";
import { SPRINT_KEY } from "@/services/sprint/type";
import { WORKSPACE_OVERVIEW_KEY } from "@/features/workspace/hooks/useWorkspaceOverview";

vi.mock("@/services/assign/assign.service", () => ({
  assignService: {
    assign: vi.fn(),
    unassign: vi.fn(),
  },
}));

describe("useAssign hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Gọi assignService.assign và invalidate queries", async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useAssign("task-1"), { wrapper });

    vi.mocked(assignService.assign).mockResolvedValueOnce({
      id: "assign-1",
      taskId: "task-1",
      userId: "user-1",
      username: "user-1",
      assignedBy: "user-1",
      assignedByUsername: "user-1",
      assignedAt: new Date(),
    });

    result.current.assign.mutate({
      taskId: "task-1",
      userId: "user-1",
    });

    await waitFor(() => {
      expect(result.current.assign.isSuccess).toBe(true);
    });

    expect(assignService.assign).toHaveBeenCalledWith({
      taskId: "task-1",
      userId: "user-1",
    });

    // Verify invalidations
    expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: [TASK_KEY.TASKS] }));
    expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: [TASK_KEY.TASK_BACKLOG] }));
    expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: [SPRINT_KEY.SPRINTS] }));
    expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: [SPRINT_KEY.SPRINT] }));
    expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: [WORKSPACE_OVERVIEW_KEY] }));
  });

  it("2. Gọi assignService.unassign và invalidate queries", async () => {
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useAssign("task-1"), { wrapper });

    vi.mocked(assignService.unassign).mockResolvedValueOnce(undefined);

    result.current.unassign.mutate("user-2");

    await waitFor(() => {
      expect(result.current.unassign.isSuccess).toBe(true);
    });

    expect(assignService.unassign).toHaveBeenCalledWith("task-1", "user-2");

    // Verify invalidations
    expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: [TASK_KEY.TASKS] }));
  });
});
