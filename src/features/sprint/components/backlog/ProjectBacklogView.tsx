"use client";

import { useSprints } from "@/features/sprint/hooks/useSprint";
import {
	useReorderTaskPosition,
	useTask,
	useTaskMoveSprint,
} from "@/features/task/hooks/useTask";
import type { TaskItem, TaskPositionContextInput } from "@/services/task/type";
import { useMemo, useState } from "react";
import { ProviderSprintDnd } from "@/components/dnd/backlog-sprint/ProviderSprintDnd";
import SprintProjectSection from "../spints/SprintProjectSection";
import BacklogSection from "./BacklogSection";

type ProjectBacklogViewProps = {
  workspaceId: string;
  projectId: string;
};

const ProjectBacklogView = ({
  workspaceId,
  projectId,
}: ProjectBacklogViewProps) => {
  const { sprintsQuery } = useSprints({ workspaceId, projectId });
  const sprints = useMemo(
    () => sprintsQuery.data?.data ?? [],
    [sprintsQuery.data?.data],
  );
  const [backlogPage, setBacklogPage] = useState(1);
  const [backlogPageSize, setBacklogPageSize] = useState(10);

  const backlogPositionContext = useMemo<TaskPositionContextInput>(
    () => ({
      context: "backlog",
      contextId: projectId,
    }),
    [projectId],
  );
  const backlogFilters = useMemo(
    () => ({
      ...backlogPositionContext,
      page: backlogPage,
      pageSize: backlogPageSize,
    }),
    [backlogPage, backlogPageSize, backlogPositionContext],
  );
  const { findTaskBacklog } = useTask(workspaceId, projectId, backlogFilters);
  const backlogPageData = findTaskBacklog.data;
  const backlogTasks = useMemo(
    () => backlogPageData?.data ?? [],
    [backlogPageData?.data],
  );
  const taskLookup = useMemo(() => {
    const allTasks = new Map<string, TaskItem>();

    for (const sprint of sprints) {
      for (const task of sprint.tasks ?? []) {
        allTasks.set(task.id, task);
      }
    }

    for (const task of backlogTasks) {
      allTasks.set(task.id, task);
    }

    return allTasks;
  }, [backlogTasks, sprints]);

  const initialItems = useMemo(() => {
    const items: Record<string, string[]> = { backlog: [] };

    // Khởi tạo từng sprint container
    for (const sprint of sprints) {
      items[`sprint:${sprint.id}`] = (sprint.tasks ?? []).map(
        (task) => task.id,
      );
    }

    // Phân loại task vào đúng container
    for (const task of backlogTasks) {
      items.backlog.push(task.id);
    }

    return items;
  }, [backlogTasks, sprints]);

  const { taskMoveSprint, removeTaskSprint, taskSprintToSprint } =
    useTaskMoveSprint({
      workspaceId,
      projectId,
    });
  const reorderTaskPosition = useReorderTaskPosition({
    workspaceId,
    projectId,
  });

  const SPRINT_PREFIX = "sprint:";
  const BACKLOG_ID = "backlog";

  const getSprintId = (containerId: string) => {
    if (!containerId.startsWith(SPRINT_PREFIX)) return null;

    return containerId.replace(SPRINT_PREFIX, "");
  };

  const getPositionContext = (
    containerId: string,
  ): TaskPositionContextInput | null => {
    if (containerId === BACKLOG_ID) {
      return {
        context: "backlog",
        contextId: projectId,
      };
    }

    const sprintId = getSprintId(containerId);

    return sprintId
      ? {
          context: "sprint",
          contextId: sprintId,
        }
      : null;
  };

  const handleTaskMove = async ({
    taskId,
    fromContainerId,
    toContainerId,
    previousTaskId,
    nextTaskId,
  }: {
    taskId: string;
    fromContainerId: string;
    toContainerId: string;
    previousTaskId: string | null;
    nextTaskId: string | null;
  }) => {
    const sourceSprintId = getSprintId(fromContainerId);
    const targetSprintId = getSprintId(toContainerId);
    const targetContext = getPositionContext(toContainerId);

    const isMoveToBacklog = toContainerId === BACKLOG_ID;
    const isMoveFromBacklog = fromContainerId === BACKLOG_ID;

    if (fromContainerId !== toContainerId) {
      if (sourceSprintId && isMoveToBacklog) {
        await removeTaskSprint.mutateAsync({ taskId });
      }

      if (isMoveFromBacklog && targetSprintId) {
        await taskMoveSprint.mutateAsync({
          taskId,
          sprintId: targetSprintId,
        });
      }

      if (sourceSprintId && targetSprintId) {
        await taskSprintToSprint.mutateAsync({
          taskId,
          sourceSprintId,
          targetSprintId,
        });
      }
    }

    if (targetContext) {
      await reorderTaskPosition.mutateAsync({
        taskId,
        ...targetContext,
        previousTaskId,
        nextTaskId,
      });
    }
  };
  return (
    <div className="flex flex-col gap-5">
      <ProviderSprintDnd
        onTaskMove={handleTaskMove}
        initialItems={initialItems}
        isMutating={
          taskMoveSprint.isPending ||
          removeTaskSprint.isPending ||
          taskSprintToSprint.isPending ||
          reorderTaskPosition.isPending
        }
        renderDragOverlay={(activeTaskId) => {
          const task = taskLookup.get(activeTaskId);

          if (!task) {
            return (
              <div className="min-w-[320px] rounded-xl border border-border/80 bg-background/95 px-4 py-3 shadow-2xl backdrop-blur-sm">
                <div className="text-sm font-medium text-foreground">
                  Dragging task
                </div>
              </div>
            );
          }

          return (
            <div className="min-w-[320px] rounded-xl border border-border/80 bg-background/95 px-4 py-3 shadow-2xl backdrop-blur-sm">
              <div className="truncate text-sm font-semibold text-foreground">
                {task.title || "Untitled"}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                TM-{task.projectSeq ?? "-"}
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{task.statusName ?? "No status"}</span>
                <span>•</span>
                <span>{task.priorityName ?? "No priority"}</span>
              </div>
            </div>
          );
        }}
      >
        <div className="flex flex-col gap-5">
          {sprints.map((sprint) => (
            <SprintProjectSection
              key={sprint.id}
              sprint={sprint}
              projectId={projectId as string}
              workspaceId={workspaceId as string}
              status={sprint.status}
              containerId={`sprint:${sprint.id}`}
            />
          ))}

          <BacklogSection
            containerId="backlog"
            context="project"
            projectId={projectId as string}
            workspaceId={workspaceId as string}
            filters={backlogFilters}
            tasks={backlogTasks}
            totalCount={backlogPageData?.total}
            pagination={{
              page: backlogPageData?.page ?? backlogPage,
              pageSize: backlogPageData?.pageSize ?? backlogPageSize,
              total: backlogPageData?.total ?? backlogTasks.length,
              totalPages: backlogPageData?.totalPages ?? 1,
              onPageChange: setBacklogPage,
              onPageSizeChange: (pageSize) => {
                setBacklogPageSize(pageSize);
                setBacklogPage(1);
              },
            }}
          />
        </div>
      </ProviderSprintDnd>
    </div>
  );
};

export default ProjectBacklogView;
