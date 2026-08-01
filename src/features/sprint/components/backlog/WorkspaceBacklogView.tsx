"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useTask } from "@/features/task/hooks/useTask";
import type { TaskPositionContextInput } from "@/services/task/type";
import SprintWorkspaceSection from "../spints/SprintWorkspaceSection";
import TableBacklog from "@/components/table/TableBacklog";

type WorkspaceBacklogViewProps = {
  workspaceId?: string;
  projectId?: string;
};

const WorkspaceBacklogView = ({
  workspaceId,
  projectId,
}: WorkspaceBacklogViewProps) => {
  const [isBacklogOpen, setIsBacklogOpen] = useState(true);
  const [backlogPage, setBacklogPage] = useState(1);
  const [backlogPageSize, setBacklogPageSize] = useState(10);
  const backlogPositionContext: TaskPositionContextInput | undefined = useMemo(
    () =>
      projectId
        ? {
            context: "backlog",
            contextId: projectId,
          }
        : undefined,
    [projectId],
  );
  const backlogFilters = useMemo(
    () =>
      backlogPositionContext
        ? {
            ...backlogPositionContext,
            page: backlogPage,
            pageSize: backlogPageSize,
          }
        : undefined,
    [backlogPage, backlogPageSize, backlogPositionContext],
  );
  const { findTaskBacklog } = useTask(
    workspaceId as string,
    projectId as string,
    backlogFilters,
  );
  const backlogPageData = findTaskBacklog.data;
  const taskBacklog = backlogPageData?.data ?? [];

  return (
    <div className="flex flex-col gap-5">
      <SprintWorkspaceSection
        projectId={projectId as string}
        workspaceId={workspaceId as string}
      />

      <Card className="flex flex-col gap-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm !py-0">
        <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 bg-transparent">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:text-foreground transition-colors"
              onClick={() => setIsBacklogOpen((prev) => !prev)}
            >
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-300",
                  !isBacklogOpen && "-rotate-90",
                )}
              />
            </Button>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-foreground">
                  Công việc backlog
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground">
                {backlogPageData?.total ?? taskBacklog.length} công việc trong backlog
              </p>
            </div>
          </div>
        </div>

        {isBacklogOpen && (
          <div className="relative overflow-auto border-t-0">
            <TableBacklog
              tasks={taskBacklog}
              containerId="backlog"
              showSprint={false}
              positionContext={backlogPositionContext}
              pagination={{
                page: backlogPageData?.page ?? backlogPage,
                pageSize: backlogPageData?.pageSize ?? backlogPageSize,
                total: backlogPageData?.total ?? taskBacklog.length,
                totalPages: backlogPageData?.totalPages ?? 1,
                onPageChange: setBacklogPage,
                onPageSizeChange: (pageSize) => {
                  setBacklogPageSize(pageSize);
                  setBacklogPage(1);
                },
              }}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default WorkspaceBacklogView;
