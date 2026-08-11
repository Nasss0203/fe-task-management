import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useTask, useUpdateTask, useDeleteTask, useTaskMoveSprint } from "@/features/task/hooks/useTask";
import {
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
  restoreTaskApi,
  bulkUpdateTasksApi,
  moveTaskToSprintApi,
  removeTaskFormSprintApi,
  moveTaskSprintToSprintApi,
} from "@/services/task/task.service";
import { createWrapper } from "../utils/test-utils";
import { FindOneTaskResponse, TASK_KEY, TaskItem } from "@/services/task/type";
import { SPRINT_KEY } from "@/services/sprint/type";

// Mock API service boundary
vi.mock("@/services/task/task.service", () => ({
  createTaskApi: vi.fn(),
  updateTaskApi: vi.fn(),
  deleteTaskApi: vi.fn(),
  restoreTaskApi: vi.fn(),
  bulkUpdateTasksApi: vi.fn(),
  moveTaskToSprintApi: vi.fn(),
  removeTaskFormSprintApi: vi.fn(),
  moveTaskSprintToSprintApi: vi.fn(),
  findAllTaskApi: vi.fn().mockResolvedValue({ data: [] }),
  findAllBacklogTaskApi: vi.fn().mockResolvedValue({ data: [] }),
  findDeletedTasksApi: vi.fn().mockResolvedValue({ data: [] }),
}));

// Mock stores if necessary
vi.mock("@/stores/use-task-filter", () => ({
  useTaskFilterStore: vi.fn().mockReturnValue({}),
}));

describe("useTask and related hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useUpdateTask", () => {
    it("1. Gọi updateTaskApi và invalidate queries", async () => {
      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdateTask("ws1", "pj1"), { wrapper });

      vi.mocked(updateTaskApi).mockResolvedValueOnce({ data: { id: "t1" } as any });

      result.current.mutate({
        id: "t1",
        title: "New Title",
        workspaceId: "ws1",
        projectId: "pj1",
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(updateTaskApi).toHaveBeenCalledWith("t1", { title: "New Title" });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [TASK_KEY.TASKS, "ws1", "pj1"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [TASK_KEY.TASK_BACKLOG, "ws1", "pj1"] });
    });

    it("updates the task detail cache optimistically", async () => {
      const { wrapper, queryClient } = createWrapper();
      const task = {
        id: "t1",
        workspaceId: "ws1",
        projectId: "pj1",
        sprintId: null,
        projectSeq: 1,
        title: "Task",
        description: null,
        statusId: "s1",
        statusName: "Todo",
        priorityId: null,
        priorityName: null,
        createdBy: "u1",
        assignees: [],
        startAt: null,
        dueAt: null,
        completedAt: null,
        estimateMinutes: 100,
        position: null,
      };
      let resolveUpdate!: (value: { data: TaskItem }) => void;

      queryClient.setQueryData([TASK_KEY.TASK, "t1"], { data: task });
      vi.mocked(updateTaskApi).mockReturnValueOnce(
        new Promise((resolve) => {
          resolveUpdate = resolve;
        }),
      );

      const { result } = renderHook(() => useUpdateTask("ws1", "pj1"), { wrapper });

      let mutationPromise!: Promise<unknown>;

      act(() => {
        mutationPromise = result.current.mutateAsync({
          id: "t1",
          estimateMinutes: 200,
        });
      });

      await waitFor(() => {
        expect(
          queryClient.getQueryData<FindOneTaskResponse>([TASK_KEY.TASK, "t1"])?.data
            .estimateMinutes,
        ).toBe(200);
      });

      resolveUpdate({
        data: {
          ...task,
          estimateMinutes: 200,
        },
      });

      await mutationPromise;
    });

    it("creates a task detail cache from cached task lists when updating", async () => {
      const { wrapper, queryClient } = createWrapper();
      const task: TaskItem = {
        id: "t1",
        workspaceId: "ws1",
        projectId: "pj1",
        sprintId: null,
        projectSeq: 1,
        title: "Task",
        description: null,
        statusId: "s1",
        statusName: "Todo",
        priorityId: null,
        priorityName: null,
        createdBy: "u1",
        assignees: [],
        startAt: null,
        dueAt: null,
        completedAt: null,
        estimateMinutes: 100,
        position: null,
      };
      let resolveUpdate!: (value: { data: TaskItem }) => void;

      queryClient.setQueryData([TASK_KEY.TASKS, "ws1", "pj1"], {
        data: [task],
      });
      vi.mocked(updateTaskApi).mockReturnValueOnce(
        new Promise((resolve) => {
          resolveUpdate = resolve;
        }),
      );

      const { result } = renderHook(() => useUpdateTask("ws1", "pj1"), { wrapper });

      let mutationPromise!: Promise<unknown>;

      act(() => {
        mutationPromise = result.current.mutateAsync({
          id: "t1",
          estimateMinutes: 240,
        });
      });

      await waitFor(() => {
        expect(
          queryClient.getQueryData<FindOneTaskResponse>([TASK_KEY.TASK, "t1"])?.data
            .estimateMinutes,
        ).toBe(240);
      });

      resolveUpdate({
        data: {
          ...task,
          estimateMinutes: 240,
        },
      });

      await mutationPromise;
    });
  });

  describe("useDeleteTask", () => {
    it("2. Gọi deleteTaskApi và invalidate queries", async () => {
      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useDeleteTask("ws1", "pj1"), { wrapper });

      vi.mocked(deleteTaskApi).mockResolvedValueOnce({ success: true });

      result.current.mutate({ taskId: "t1" });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(deleteTaskApi).toHaveBeenCalledWith({ taskId: "t1", workspaceId: "ws1" });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [TASK_KEY.TASKS, "ws1", "pj1"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [TASK_KEY.TASK_TRASH, "ws1", "pj1"] });
    });
  });

  describe("useTask mutations", () => {
    it("3. createTask gọi api và invalidate", async () => {
      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useTask("ws1", "pj1"), { wrapper });

      vi.mocked(createTaskApi).mockResolvedValueOnce({ data: { id: "t1" } as any });

      result.current.createTask({
        workspaceId: "ws1",
        projectId: "pj1",
        title: "Test task",
        statusId: "s1",
      });

      await waitFor(() => {
        expect(result.current.taskQuery.isSuccess).toBe(true); // wait for initial fetch just to be safe
      });

      await waitFor(() => {
        expect(createTaskApi).toHaveBeenCalled();
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [TASK_KEY.TASKS, "ws1", "pj1"] });
      });
    });

    it("4. restoreTask gọi api và invalidate", async () => {
      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useTask("ws1", "pj1"), { wrapper });

      vi.mocked(restoreTaskApi).mockResolvedValueOnce({ success: true });

      result.current.restoreTask.mutate({ taskId: "t1" });

      await waitFor(() => {
        expect(result.current.restoreTask.isSuccess).toBe(true);
      });

      expect(restoreTaskApi).toHaveBeenCalledWith({ taskId: "t1", workspaceId: "ws1" });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [TASK_KEY.TASK_TRASH, "ws1", "pj1"] });
    });

    it("5. bulkUpdateTasks gọi api và invalidate", async () => {
      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useTask("ws1", "pj1"), { wrapper });

      vi.mocked(bulkUpdateTasksApi).mockResolvedValueOnce({ success: true });

      result.current.bulkUpdateTasks.mutate({ taskIds: ["t1", "t2"], statusId: "s2" });

      await waitFor(() => {
        expect(result.current.bulkUpdateTasks.isSuccess).toBe(true);
      });

      expect(bulkUpdateTasksApi).toHaveBeenCalledWith({
        workspaceId: "ws1",
        projectId: "pj1",
        body: { taskIds: ["t1", "t2"], statusId: "s2" },
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [TASK_KEY.TASK_BACKLOG, "ws1", "pj1"] });
    });

    it("6. bulkMoveToSprint gọi api và invalidate", async () => {
      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useTask("ws1", "pj1"), { wrapper });

      vi.mocked(moveTaskToSprintApi).mockResolvedValue({ success: true });

      result.current.bulkMoveToSprint.mutate({ taskIds: ["t1", "t2"], sprintId: "sp1" });

      await waitFor(() => {
        expect(result.current.bulkMoveToSprint.isSuccess).toBe(true);
      });

      expect(moveTaskToSprintApi).toHaveBeenCalledTimes(2);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [TASK_KEY.TASK_BACKLOG, "ws1", "pj1"] });
    });
  });

  describe("useTaskMoveSprint", () => {
    it("7. taskMoveSprint gọi API và fallback UI (onMutate/onError)", async () => {
      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useTaskMoveSprint({ workspaceId: "ws1", projectId: "pj1" }), { wrapper });

      vi.mocked(moveTaskToSprintApi).mockResolvedValueOnce({ success: true });

      result.current.taskMoveSprint.mutate({ taskId: "t1", sprintId: "sp1" });

      await waitFor(() => {
        expect(result.current.taskMoveSprint.isSuccess).toBe(true);
      });

      expect(moveTaskToSprintApi).toHaveBeenCalledWith({ taskId: "t1", sprintId: "sp1" });
      expect(invalidateSpy).toHaveBeenCalledWith(expect.objectContaining({ queryKey: [SPRINT_KEY.SPRINTS, "ws1", "pj1"] }));
    });

    it("8. removeTaskSprint gọi API và invalidate", async () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useTaskMoveSprint({ workspaceId: "ws1", projectId: "pj1" }), { wrapper });

      vi.mocked(removeTaskFormSprintApi).mockResolvedValueOnce({ success: true });

      result.current.removeTaskSprint.mutate({ taskId: "t1" });

      await waitFor(() => {
        expect(result.current.removeTaskSprint.isSuccess).toBe(true);
      });

      expect(removeTaskFormSprintApi).toHaveBeenCalledWith({ taskId: "t1" });
    });

    it("9. taskSprintToSprint gọi API và invalidate", async () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useTaskMoveSprint({ workspaceId: "ws1", projectId: "pj1" }), { wrapper });

      vi.mocked(moveTaskSprintToSprintApi).mockResolvedValueOnce({ success: true });

      result.current.taskSprintToSprint.mutate({
        taskId: "t1",
        sourceSprintId: "sp1",
        targetSprintId: "sp2",
      });

      await waitFor(() => {
        expect(result.current.taskSprintToSprint.isSuccess).toBe(true);
      });

      expect(moveTaskSprintToSprintApi).toHaveBeenCalledWith({
        taskId: "t1",
        workspaceId: "ws1",
        projectId: "pj1",
        sourceSprintId: "sp1",
        targetSprintId: "sp2",
      });
    });
  });
});
