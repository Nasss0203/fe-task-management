"use client";

import { useDroppable } from "@dnd-kit/react";
import {
	ColumnDef,
	PaginationState,
	RowSelectionState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Ellipsis, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { useTask, useTaskPriority, useTaskStatus } from "@/features/task/hooks/useTask";
import type { TaskItem } from "@/services/task/type";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useTableDnd } from "@/components/dnd/backlog-sprint/ProviderSprintDnd";
import TableRowDnd from "@/components/dnd/backlog-sprint/TableRowSprintDnd";
import { TaskAssigneeCell } from "./columns/column-task";
import { TaskBulkActionBar } from "@/features/task/components/task/TaskBulkActionBar";
import TaskTrashDialog from "@/features/task/components/task/TaskTrashDialog";
import DropdownTaskStatus from "@/components/dropdown/DropdownTaskStatus";
import DropdownTaskPriority from "@/components/dropdown/DropdownTaskPriority";
import { DrawerItemView } from "@/components/drawer/DrawerItemView";
import DropdownTaskContextMenu from "@/components/dropdown/DropdownTaskContextMenu";
import MoveToSprintDialog from "@/components/dialog/MoveToSprintDialog";
import DialogAddTask from "@/components/dialog/DialogAddTask";
import { useUser } from "@/features/auth/hooks/useUser";

type TableBacklogProps = {
	tasks: TaskItem[];
	containerId: string;
	showSprint?: boolean;
};

type getColumnsBacklogProps = {
	showSprint: boolean;
	taskStatus: {
		id: string;
		name: string;
	}[];
	taskPriority: {
		id: string;
		name: string;
	}[];
	onChangeStatus: (taskId: string, statusId: string) => void;
	onChangePriority: (taskId: string, priorityId: string | null) => void;
	onOpenDetail: (taskId: string) => void;
	workspaceId: string;
	projectId: string;
};

const getColumnsBacklog = ({
	showSprint,
	taskPriority,
	taskStatus,
	onChangePriority,
	onChangeStatus,
	onOpenDetail,
	workspaceId,
	projectId,
}: getColumnsBacklogProps): ColumnDef<TaskItem>[] => [
	{
		id: "select",
		size: 48,
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) =>
					table.toggleAllPageRowsSelected(!!value)
				}
				aria-label='Select all'
				className="border-border data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label='Select task'
				className="border-border data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
			/>
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
				<div className='flex min-w-0 flex-col py-1'>
					<span className='truncate text-[14px] font-medium text-foreground cursor-pointer hover:underline' title={row.original.title} onClick={() => onOpenDetail(row.original.id)}>
						{task.title}
					</span>

					<span className='text-xs text-muted-foreground'>
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
						<span className='text-sm text-muted-foreground'>
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
						statusName={task.statusName ?? (task as any).status?.name ?? taskStatus.find((s) => s.id === task.statusId)?.name ?? ""}
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
						priorityName={task.priorityName ?? (task as any).priority?.name ?? taskPriority.find((p) => p.id === task.priorityId)?.name ?? ""}
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
				<Button variant='ghost' size='icon' className='size-8'>
					<Ellipsis className='size-4' />
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
}: TableBacklogProps) => {
	const { currentProjectId, currentWorkspaceId } = useProjectSelectionStore();
	const workspaceId = currentWorkspaceId as string;
	const projectId = currentProjectId as string;
	const { user } = useUser();

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [taskTrashOpen, setTaskTrashOpen] = useState(false);
	const [activeDrawerTaskId, setActiveDrawerTaskId] = useState<string | null>(null);
	const [moveToSprintOpen, setMoveToSprintOpen] = useState(false);
	
	const [isQuickAdding, setIsQuickAdding] = useState(false);
	const [quickAddTitle, setQuickAddTitle] = useState("");
	const [isCreating, setIsCreating] = useState(false);

	const { items } = useTableDnd();
	const { updateTask, bulkUpdateTasks, bulkMoveToSprint, createTask } = useTask(
		workspaceId,
		projectId,
	);
	const { data: taskStatusData } = useTaskStatus(workspaceId, projectId);
	const { data: taskPriorityData } = useTaskPriority(workspaceId, projectId);

	const taskIds = items[containerId] ?? [];
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
				taskStatus,
				taskPriority,
				workspaceId,
				projectId,
				onOpenDetail: setActiveDrawerTaskId,
				onChangeStatus: async (taskId, statusId) => {
					await updateTask.mutateAsync({
						id: taskId,
						workspaceId,
						projectId,
						statusId,
					});
				},
				onChangePriority: async (taskId, priorityId) => {
					await updateTask.mutateAsync({
						id: taskId,
						workspaceId,
						projectId,
						priorityId,
					});
				},
			}),
		[
			showSprint,
			taskStatus,
			taskPriority,
			updateTask,
			workspaceId,
			projectId,
			containerId,
		],
	);
	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable({
		data: tasks,
		columns,

		getRowId: (row) => row.id,
		enableRowSelection: true,

		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),

		onPaginationChange: setPagination,
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
				createdBy: user?.id || "",
			});
			setQuickAddTitle("");
		} catch (error) {
			console.error("Failed to create task", error);
		} finally {
			setIsCreating(false);
		}
	};

	const { ref, isDropTarget } = useDroppable({
		id: containerId,
		type: "task-table",
		accept: ["item"],
		data: {
			containerId,
		},
	});

	return (
		<>
			<div
				className={cn(
					"border-t-0",
					isDropTarget && "ring-1 ring-sky-400/60",
				)}
			>
				<div className='relative max-h-[520px] overflow-auto'>
					<table className='w-full caption-bottom text-sm'>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow
									key={headerGroup.id}
									className='h-12 hover:bg-transparent border-b border-border bg-muted/30'
								>
									{headerGroup.headers.map((header) => (
										<TableHead
											key={header.id}
											className='sticky top-0 z-20 h-10 bg-muted/30 whitespace-nowrap px-3 text-xs font-semibold text-muted-foreground shadow-[inset_0_-1px_0_rgba(255,255,255,0.05)] backdrop-blur-md'
											style={{
												width: header.getSize(),
												minWidth: header.getSize(),
											}}
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef
															.header,
														header.getContext(),
													)}
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>

						<TableBody
							ref={ref}
							className={cn(
								"min-h-20",
								isDropTarget && "bg-sky-500/5",
							)}
						>
							{table.getRowModel().rows.length ? (
								table.getRowModel().rows.map((row) => {
									const index = taskIds.indexOf(
										row.original.id,
									);
									return (
										<TableRowDnd
											key={row.id}
											row={row}
											index={index >= 0 ? index : 0}
											containerId={containerId}
										/>
									);
								})
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className='h-20 text-center text-sm text-muted-foreground'
									>
										Thả task vào đây
									</TableCell>
								</TableRow>
							)}
							{containerId === "backlog" && (
								<TableRow className="border-b-0 hover:bg-transparent">
									<TableCell colSpan={columns.length} className="p-0 border-0 border-b-0">
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
												className='flex w-full items-center gap-2 p-3 px-4 text-[13px] font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-all cursor-pointer text-left outline-none'
											>
												<Plus className='size-4' />
												nhiệm vụ mới
											</button>
										)}
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</table>
				</div>
			</div>

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
