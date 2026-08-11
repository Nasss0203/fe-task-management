"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  ColumnDef,
  PaginationState,
  RowSelectionState,
  Updater,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Ellipsis, GripVertical, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import {
  useTask,
  useTaskPriority,
  useTaskStatus,
} from "@/features/task/hooks/useTask";
import type { TaskItem, TaskPositionContextInput } from "@/services/task/type";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useTableDnd } from "@/components/dnd/backlog-sprint/ProviderSprintDnd";
import TableRowDnd, {
  useSortableRowHandle,
} from "@/components/dnd/backlog-sprint/TableRowSprintDnd";
import { TaskAssigneeCell } from "./columns/column-task";
import { TaskBulkActionBar } from "@/features/task/components/task/TaskBulkActionBar";
import TaskTrashDialog from "@/features/task/components/task/TaskTrashDialog";
import DropdownTaskStatus from "@/components/dropdown/DropdownTaskStatus";
import DropdownTaskPriority from "@/components/dropdown/DropdownTaskPriority";
import { DrawerItemView } from "@/components/drawer/DrawerItemView";
import DropdownTaskContextMenu from "@/components/dropdown/DropdownTaskContextMenu";
import MoveToSprintDialog from "@/components/dialog/MoveToSprintDialog";
import PanigationTable from "@/components/panigation/PanigationTable";

export type TableBacklogPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

type TableBacklogProps = {
  tasks: TaskItem[];
  containerId: string;
  showSprint?: boolean;
  positionContext?: TaskPositionContextInput;
  pagination?: TableBacklogPagination;
};

type getColumnsBacklogProps = {
  showSprint: boolean;
  isDragging: boolean;
  isDndEnabled: boolean;
  taskStatus: {
    id: string;
    name: string;
  }[];
  taskPriority: {
    id: string;
    name: string;
  }[];
  onOpenDetail: (taskId: string) => void;
  workspaceId: string;
  projectId: string;
};

const BACKLOG_GRID_MIN_WIDTH = 860;
const BACKLOG_WITH_SPRINT_GRID_MIN_WIDTH = 1020;

const SelectionIndicator = ({
  checked = false,
  indeterminate = false,
}: {
  checked?: boolean;
  indeterminate?: boolean;
}) => (
  <div className="flex h-4 w-4 items-center justify-center rounded-[4px] border border-border bg-background">
    {checked ? (
      <div className="h-2.5 w-2.5 rounded-[2px] bg-blue-500" />
    ) : indeterminate ? (
      <div className="h-0.5 w-2 rounded-full bg-blue-500" />
    ) : null}
  </div>
);

const getBacklogGridTemplateColumns = (
  showSprint: boolean,
  isDndEnabled: boolean,
) =>
  [
    isDndEnabled ? "36px" : null,
    "48px",
    "minmax(280px, 2fr)",
    showSprint ? "minmax(140px, 1fr)" : null,
    "minmax(140px, 1fr)",
    "minmax(140px, 1fr)",
    "minmax(160px, 1fr)",
    "56px",
  ]
    .filter(Boolean)
    .join(" ");

const DragHandleCell = () => {
  const { attributes, listeners, setActivatorNodeRef, isDragging } =
    useSortableRowHandle();

  return (
    <button
      ref={setActivatorNodeRef}
      type="button"
      aria-label="Kéo thả task"
      className={cn(
        "flex size-7 cursor-grab items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:cursor-grabbing",
        isDragging && "cursor-grabbing text-foreground",
      )}
      style={{ touchAction: "none" }}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="size-4" />
    </button>
  );
};

type TaskItemWithInlineRelations = TaskItem & {
  status?: { name?: string | null } | null;
  priority?: { name?: string | null } | null;
};

const getTaskStatusName = (
  task: TaskItem,
  taskStatus: getColumnsBacklogProps["taskStatus"],
) => {
  const taskWithRelations = task as TaskItemWithInlineRelations;

  return (
    task.statusName ??
    taskWithRelations.status?.name ??
    taskStatus.find((status) => status.id === task.statusId)?.name ??
    ""
  );
};

const getTaskPriorityName = (
  task: TaskItem,
  taskPriority: getColumnsBacklogProps["taskPriority"],
) => {
  const taskWithRelations = task as TaskItemWithInlineRelations;

  return (
    task.priorityName ??
    taskWithRelations.priority?.name ??
    taskPriority.find((priority) => priority.id === task.priorityId)?.name ??
    ""
  );
};

const getColumnsBacklog = ({
  showSprint,
  isDragging,
  isDndEnabled,
  taskPriority,
  taskStatus,
  onOpenDetail,
  workspaceId,
  projectId,
}: getColumnsBacklogProps): ColumnDef<TaskItem>[] => [
  ...(isDndEnabled
    ? [
        {
          id: "drag",
          size: 36,
          header: "",
          cell: () => <DragHandleCell />,
          enableSorting: false,
          enableHiding: false,
        } satisfies ColumnDef<TaskItem>,
      ]
    : []),
  {
    id: "select",
    size: 48,
    header: ({ table }) => (
      isDragging ? (
        <SelectionIndicator
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={
            !table.getIsAllPageRowsSelected() && table.getIsSomePageRowsSelected()
          }
        />
      ) : (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="border-border data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
        />
      )
    ),
    cell: ({ row }) => (
      isDragging ? (
        <SelectionIndicator checked={row.getIsSelected()} />
      ) : (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select task"
          className="border-border data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
        />
      )
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    size: 360,
    header: "Task",
    cell: ({ row }) => {
      const task = row.original;

      return (
        <div className="flex min-w-0 flex-col py-1">
          <span
            className="truncate text-[14px] font-medium text-foreground cursor-pointer hover:underline"
            title={row.original.title ?? "Untitled"}
            onClick={() => onOpenDetail(row.original.id)}
          >
            {task.title || (
              <span className="text-muted-foreground italic">Untitled</span>
            )}
          </span>

          <span className="text-xs text-muted-foreground">
            TM-{task.projectSeq}
          </span>
        </div>
      );
    },
  },
  ...(showSprint
    ? [
        {
          accessorKey: "sprintName",
          size: 160,
          header: "Sprint",
          cell: ({ row }) => (
            <span className="text-sm text-muted-foreground">
              {row.original.sprintName ?? "-"}
            </span>
          ),
        } satisfies ColumnDef<TaskItem>,
      ]
    : []),
  {
    accessorKey: "statusName",
    size: 160,
    header: "Status",
    cell: ({ row }) => {
      const task = row.original;

      return (
        <div className="-ml-2">
          <DropdownTaskStatus
            taskId={task.id}
            projectId={projectId}
            workspaceId={workspaceId}
            statusName={getTaskStatusName(task, taskStatus)}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "priorityName",
    size: 160,
    header: "Priority",
    cell: ({ row }) => {
      const task = row.original;

      return (
        <div className="-ml-2">
          <DropdownTaskPriority
            taskId={task.id}
            projectId={projectId}
            workspaceId={workspaceId}
            priorityName={getTaskPriorityName(task, taskPriority)}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "assignees",
    size: 160,
    header: "Assignee",
    cell: ({ row }) => (
      <TaskAssigneeCell
        taskId={row.original.id}
        workspaceId={workspaceId}
        projectId={projectId}
        assignees={row.original.assignees}
      />
    ),
  },
  {
    id: "actions",
    size: 48,
    header: "",
    cell: ({ row }) => (
      <DropdownTaskContextMenu
        taskId={row.original.id}
        workspaceId={workspaceId}
        projectId={projectId}
        onOpenDetail={() => onOpenDetail(row.original.id)}
      >
        <Button variant="ghost" size="icon" className="size-8">
          <Ellipsis className="size-4" />
        </Button>
      </DropdownTaskContextMenu>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

const TableBacklog = ({
  tasks,
  containerId,
  showSprint = false,
  positionContext,
  pagination: serverPagination,
}: TableBacklogProps) => {
  const { currentProjectId, currentWorkspaceId } = useProjectSelectionStore();
  const workspaceId = currentWorkspaceId as string;
  const projectId = currentProjectId as string;

  const [localPagination, setLocalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [taskTrashOpen, setTaskTrashOpen] = useState(false);
  const [activeDrawerTaskId, setActiveDrawerTaskId] = useState<string | null>(
    null,
  );
  const [moveToSprintOpen, setMoveToSprintOpen] = useState(false);

  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [quickAddTitle, setQuickAddTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const {
    items,
    isDragging,
    isEnabled: isDndEnabled,
  } = useTableDnd();
  const { bulkUpdateTasks, bulkMoveToSprint, createTask } = useTask(
    workspaceId,
    projectId,
  );
  const { data: taskStatusData } = useTaskStatus(workspaceId, projectId);
  const { data: taskPriorityData } = useTaskPriority(workspaceId, projectId);

  const taskStatus = useMemo(
    () => taskStatusData?.data ?? [],
    [taskStatusData?.data],
  );
  const taskPriority = useMemo(
    () => taskPriorityData?.data ?? [],
    [taskPriorityData?.data],
  );

  const columns = useMemo(
    () =>
      getColumnsBacklog({
        showSprint,
        isDragging,
        isDndEnabled,
        taskStatus,
        taskPriority,
        workspaceId,
        projectId,
        onOpenDetail: setActiveDrawerTaskId,
      }),
    [
      showSprint,
      isDragging,
      isDndEnabled,
      taskStatus,
      taskPriority,
      workspaceId,
      projectId,
    ],
  );

  const pagination = serverPagination
    ? {
        pageIndex: Math.max(serverPagination.page - 1, 0),
        pageSize: serverPagination.pageSize,
      }
    : localPagination;

  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    if (!serverPagination) {
      setLocalPagination(updater);
      return;
    }

    const next = typeof updater === "function" ? updater(pagination) : updater;

    if (next.pageSize !== serverPagination.pageSize) {
      serverPagination.onPageSizeChange(next.pageSize);
      return;
    }

    const nextPage = next.pageIndex + 1;

    if (nextPage !== serverPagination.page) {
      serverPagination.onPageChange(nextPage);
    }
  };

  const table = useReactTable({
    data: tasks,
    columns,

    getRowId: (row) => row.id,
    enableRowSelection: true,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: serverPagination
      ? undefined
      : getPaginationRowModel(),
    manualPagination: Boolean(serverPagination),
    pageCount: serverPagination
      ? Math.max(serverPagination.totalPages, 1)
      : undefined,

    onPaginationChange: handlePaginationChange,
    onRowSelectionChange: setRowSelection,

    state: {
      pagination,
      rowSelection,
    },
  });

  const selectedTasks = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

  const selectedTaskIds = selectedTasks.map((task) => task.id);

  const selectedCount = selectedTaskIds.length;

  const activeDrawerTask = useMemo(() => {
    return tasks.find((t) => t.id === activeDrawerTaskId) || null;
  }, [tasks, activeDrawerTaskId]);

  const handleQuickAdd = async () => {
    if (!quickAddTitle.trim() || !taskStatus.length) {
      setIsQuickAdding(false);
      setQuickAddTitle("");
      return;
    }

    setIsCreating(true);
    try {
      await createTask({
        title: quickAddTitle.trim(),
        statusId: taskStatus[0].id,
        workspaceId,
        projectId,
        startAt: null,
        dueAt: null,
        ...(positionContext ? { positionContext } : {}),
      });
      setQuickAddTitle("");
    } catch (error) {
      console.error("Failed to create task", error);
    } finally {
      setIsCreating(false);
    }
  };

  const { setNodeRef, isOver } = useDroppable({
    id: containerId,
    data: {
      containerId,
      type: "task-table",
    },
  });
  const gridTemplateColumns = getBacklogGridTemplateColumns(
    showSprint,
    isDndEnabled,
  );
  const baseMinWidth = showSprint
    ? BACKLOG_WITH_SPRINT_GRID_MIN_WIDTH
    : BACKLOG_GRID_MIN_WIDTH;
  const minWidth = isDndEnabled ? baseMinWidth : baseMinWidth - 36;
  const tableRows = table.getRowModel().rows;
  const tableRowsById = useMemo(
    () => new Map(tableRows.map((row) => [row.original.id, row])),
    [tableRows],
  );
  const pagedTaskIds = useMemo(
    () => tableRows.map((row) => row.original.id),
    [tableRows],
  );
  const displayIds = isDndEnabled
    ? (items[containerId] ?? pagedTaskIds)
    : pagedTaskIds;

  return (
    <>
      <div
        className={cn("border-t-0", isOver && "ring-1 ring-sky-400/60")}
      >
        <div className="relative max-h-[520px] overflow-auto">
          <div role="table" className="w-full text-sm" style={{ minWidth }}>
            <div
              role="rowgroup"
              className="sticky top-0 z-20 bg-muted/30 backdrop-blur-md"
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <div
                  key={headerGroup.id}
                  role="row"
                  className="grid h-12 border-b border-border"
                  style={{ gridTemplateColumns }}
                >
                  {headerGroup.headers.map((header) => (
                    <div
                      key={header.id}
                      role="columnheader"
                      className="flex h-12 min-w-0 items-center whitespace-nowrap px-3 text-xs font-semibold text-muted-foreground shadow-[inset_0_-1px_0_rgba(255,255,255,0.05)]"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div
              ref={setNodeRef}
              role="rowgroup"
              className={cn("min-h-20", isOver && "bg-sky-500/5")}
            >
              {displayIds.length ? (
                isDndEnabled ? (
                  <SortableContext
                    items={displayIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {displayIds.map((taskId, index) => {
                      const row = tableRowsById.get(taskId);

                      if (row) {
                        return (
                          <TableRowDnd
                            key={row.id}
                            row={row}
                            index={index}
                            containerId={containerId}
                            gridTemplateColumns={gridTemplateColumns}
                          />
                        );
                      }

                      // Render a placeholder if the row data is not yet available during cross-container dragging.
                      return (
                        <div
                          key={`placeholder-${taskId}`}
                          role="row"
                          className="grid min-h-14 border-b border-border/70 bg-muted/20 opacity-50"
                          style={{ gridTemplateColumns }}
                        >
                          <div role="cell" style={{ gridColumn: "1 / -1" }} />
                        </div>
                      );
                    })}
                  </SortableContext>
                ) : (
                  displayIds.map((taskId) => {
                    const row = tableRowsById.get(taskId);

                    if (!row) {
                      return null;
                    }

                    return (
                      <div
                        key={row.id}
                        role="row"
                        className="grid min-h-14 border-b border-border/70 bg-background transition-colors duration-150 hover:bg-muted/35 data-[state=selected]:bg-muted"
                        data-state={row.getIsSelected() && "selected"}
                        style={{ gridTemplateColumns }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <div
                            key={cell.id}
                            role="cell"
                            className="flex min-w-0 items-center whitespace-nowrap px-3 py-2 text-sm text-foreground"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })
                )
              ) : (
                <div
                  role="row"
                  className="grid border-b border-border/70"
                  style={{ gridTemplateColumns }}
                >
                  <div
                    role="cell"
                    className="flex h-20 items-center justify-center text-sm text-muted-foreground"
                    style={{ gridColumn: "1 / -1" }}
                  >
                    Thả task vào đây
                  </div>
                </div>
              )}
              {containerId === "backlog" && (
                <div
                  role="row"
                  className="grid border-b-0"
                  style={{ gridTemplateColumns }}
                >
                  <div
                    role="cell"
                    className="min-w-0"
                    style={{ gridColumn: "1 / -1" }}
                  >
                    {isQuickAdding ? (
                      <div className="flex w-full items-center gap-2 p-2 px-4">
                        <Plus className="size-4 text-muted-foreground" />
                        <input
                          autoFocus
                          type="text"
                          value={quickAddTitle}
                          onChange={(e) => setQuickAddTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleQuickAdd();
                            } else if (e.key === "Escape") {
                              setIsQuickAdding(false);
                              setQuickAddTitle("");
                            }
                          }}
                          onBlur={() => {
                            if (!quickAddTitle.trim()) {
                              setIsQuickAdding(false);
                            }
                          }}
                          disabled={isCreating}
                          placeholder="Nhập tên nhiệm vụ..."
                          className="flex-1 bg-transparent text-[13px] font-medium outline-none placeholder:text-muted-foreground/50 disabled:opacity-50"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsQuickAdding(true)}
                        className="flex w-full items-center gap-2 p-3 px-4 text-[13px] font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all cursor-pointer text-left outline-none"
                      >
                        <Plus className="size-4" />
                        nhiệm vụ mới
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <PanigationTable table={table} totalRows={serverPagination?.total} />

      <TaskBulkActionBar
        selectedCount={selectedCount}
        totalCount={tasks.length}
        selectedTaskIds={selectedTaskIds}
        taskStatus={taskStatus}
        isChangeStatusPending={bulkUpdateTasks.isPending}
        onSelectAll={() => table.toggleAllRowsSelected(true)}
        onClear={() => table.resetRowSelection()}
        onMoveToSprint={() => {
          setMoveToSprintOpen(true);
        }}
        onAssign={() => {
          console.log("assign", selectedTaskIds);
        }}
        onSubmitChangeStatus={async ({
          taskIds,
          statusId,
          sendNotification,
        }) => {
          await bulkUpdateTasks.mutateAsync({
            taskIds,
            statusId,
            sendNotification,
          });

          table.resetRowSelection();
        }}
        onDelete={() => {
          setTaskTrashOpen(true);
        }}
      />

      <MoveToSprintDialog
        open={moveToSprintOpen}
        onOpenChange={setMoveToSprintOpen}
        workspaceId={workspaceId}
        projectId={projectId}
        isPending={bulkMoveToSprint.isPending}
        onConfirm={async (sprintId) => {
          await bulkMoveToSprint.mutateAsync({
            taskIds: selectedTaskIds,
            sprintId,
          });
          table.resetRowSelection();
        }}
      />

      <TaskTrashDialog
        tasks={selectedTasks}
        workspaceId={workspaceId}
        projectId={projectId}
        open={taskTrashOpen}
        onOpenChange={setTaskTrashOpen}
        onDeleted={() => {
          table.resetRowSelection();
        }}
      />

      {activeDrawerTask ? (
        <DrawerItemView
          open={!!activeDrawerTask}
          onOpenChange={(open) => {
            if (!open) {
              setActiveDrawerTaskId(null);
            }
          }}
          task={activeDrawerTask}
        />
      ) : null}
    </>
  );
};

export default TableBacklog;
