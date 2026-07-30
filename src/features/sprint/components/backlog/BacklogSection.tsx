"use client";

import { ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useSprints } from "@/features/sprint/hooks/useSprint";
import { useTask } from "@/features/task/hooks/useTask";
import type { TaskPositionContextInput } from "@/services/task/type";
import { useMemo, useState } from "react";
import TableBacklog from "@/components/table/TableBacklog";
import type { BacklogRenderContext } from "./types";
import { cn } from "@/lib/utils";
import { usePermission } from "@/features/permission/hooks/usePermission";
import { PERMISSIONS } from "@/constants/permissions";
import type { FindBacklogTasksFilters, TaskItem } from "@/services/task/type";
import type { TableBacklogPagination } from "@/components/table/TableBacklog";

type BacklogSectionProps = {
  context?: BacklogRenderContext;
  workspaceId: string;
  projectId: string;
  containerId: string;
  filters?: FindBacklogTasksFilters;
  pagination?: TableBacklogPagination;
  tasks?: TaskItem[];
  totalCount?: number;
};

const BacklogSection = ({
  context = "project",
  projectId,
  workspaceId,
  containerId,
  filters,
  pagination,
  tasks,
  totalCount,
}: BacklogSectionProps) => {
  const { can } = usePermission(workspaceId);
  const [open, setOpen] = useState<boolean>(true);
  const isProjectContext = context === "project";
  const backlogPositionContext = useMemo<TaskPositionContextInput>(
    () => ({
      context: "backlog",
      contextId: projectId,
    }),
    [projectId],
  );
  const { findTaskBacklog } = useTask(
    workspaceId,
    projectId,
    filters ?? backlogPositionContext,
  );
  const taskBacklog = tasks ?? findTaskBacklog.data?.data ?? [];
  const backlogTotal =
    totalCount ?? findTaskBacklog.data?.total ?? taskBacklog.length;

  const { createSprint } = useSprints({
    projectId,
    workspaceId,
  });

  const handleCreateSprint = () => {
    if (!workspaceId || !projectId) return;

    createSprint.mutate({
      workspaceId,
      projectId,
    });
  };

  const handleOpenTable = () => {
    setOpen(!open);
  };

  return (
    <Card className="flex flex-col gap-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm !py-0">
      <div className="flex items-center justify-between gap-4 border-b border-border bg-transparent px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:hover:bg-accent hover:text-accent-foreground hover:hover:text-foreground transition-colors"
            onClick={handleOpenTable}
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-300",
                !open && "-rotate-90",
              )}
            />
          </Button>

          <div className="flex items-center gap-2.5">
            <span className="text-[14px] font-semibold text-foreground">
              Backlog
            </span>
            <span className="text-[12px] font-medium text-muted-foreground">
              {backlogTotal} công việc
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isProjectContext && can(PERMISSIONS.SPRINT_CREATE) && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg border-border bg-background text-[12px] font-medium hover:hover:bg-accent hover:text-accent-foreground hover:border-neutral-600 transition-all hover:text-foreground"
              onClick={handleCreateSprint}
            >
              {createSprint.isPending ? "Đang tạo..." : "Tạo sprint"}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="bg-popover border-border rounded-xl min-w-[160px]"
            >
              <DropdownMenuItem className="text-xs text-foreground focus:focus:bg-accent focus:text-foreground cursor-pointer">
                Thu gọn
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs text-foreground focus:focus:bg-accent focus:text-foreground cursor-pointer">
                Xuất công việc
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {open && (
        <div className="relative overflow-auto border-t-0">
          <TableBacklog
            tasks={taskBacklog}
            containerId={containerId}
            positionContext={backlogPositionContext}
            pagination={pagination}
          />
        </div>
      )}
    </Card>
  );
};
export default BacklogSection;
