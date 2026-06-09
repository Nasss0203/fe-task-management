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
import { Ellipsis } from "lucide-react";
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
import { useTableDnd } from "../dnd/backlog-sprint/ProviderSprintDnd";
import TableRowDnd from "../dnd/backlog-sprint/TableRowSprintDnd";
import TaskAssignees from "../task/TaskAssignees";
import { TaskBulkActionBar } from "../task/TaskBulkActionBar";
import TaskTrashDialog from "../task/TaskTrashDialog";
import DropdownTaskStatus from "@/components/dropdown/DropdownTaskStatus";
import DropdownTaskPriority from "@/components/dropdown/DropdownTaskPriority";

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
	workspaceId: string;
	projectId: string;
};

const getColumnsBacklog = ({
	showSprint,
	taskPriority,
	taskStatus,
	onChangePriority,
	onChangeStatus,
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
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label='Select row'
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
				<div className='flex min-w-0 flex-col'>
					<span className='truncate font-medium text-foreground'>
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
			<TaskAssignees assignees={row.original.assignees ?? []} />
		),
	},
	{
		id: "actions",
		size: 48,
		header: "",
		cell: () => (
			<Button variant='ghost' size='icon' className='size-8'>
				<Ellipsis className='size-4' />
			</Button>
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

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [taskTrashOpen, setTaskTrashOpen] = useState(false);

	const { items } = useTableDnd();
	const { bulkUpdateTasks, updateTask } = useTask(workspaceId, projectId);
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
					"rounded-md border",
					isDropTarget && "ring-1 ring-sky-400/60",
				)}
			>
				<div className='relative max-h-150 overflow-auto rounded-md'>
					<table className='w-full caption-bottom text-sm'>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow
									key={headerGroup.id}
									className='hover:bg-transparent'
								>
									{headerGroup.headers.map((header) => (
										<TableHead
											key={header.id}
											className='sticky top-0 z-20 h-10 bg-background shadow-[inset_0_-1px_0_hsl(var(--border))]'
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
					console.log("move to sprint", selectedTaskIds);
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
		</>
	);
};

export default TableBacklog;
