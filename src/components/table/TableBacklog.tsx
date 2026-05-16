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

import type { TaskItem } from "@/services/task/type";
import { useTableDnd } from "../dnd/backlog-sprint/ProviderSprintDnd";
import TableRowDnd from "../dnd/backlog-sprint/TableRowSprintDnd";
import TaskAssignees from "../task/TaskAssignees";
import { TaskBulkActionBar } from "../task/TaskBulkActionBar";

type TableBacklogProps = {
	tasks: TaskItem[];
	containerId: string;
	showSprint?: boolean;
};

const getColumnsBacklog = (showSprint: boolean): ColumnDef<TaskItem>[] => [
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
			const value = task.statusId ?? "none";

			return (
				<Select value={value}>
					<SelectTrigger className='h-8 w-32.5'>
						<SelectValue placeholder='No status' />
					</SelectTrigger>

					<SelectContent>
						{task.statusId ? (
							<SelectItem value={task.statusId}>
								{task.statusName ?? "No status"}
							</SelectItem>
						) : (
							<SelectItem value='none'>No status</SelectItem>
						)}
					</SelectContent>
				</Select>
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
				<Select value={task.priorityId ?? "none"}>
					<SelectTrigger className='h-8 w-32.5'>
						<SelectValue placeholder='No priority' />
					</SelectTrigger>

					<SelectContent>
						<SelectItem value='none'>No priority</SelectItem>

						{task.priorityId && (
							<SelectItem value={task.priorityId}>
								{task.priorityName ?? "No priority"}
							</SelectItem>
						)}
					</SelectContent>
				</Select>
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
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const { items } = useTableDnd();
	const taskIds = items[containerId] ?? [];

	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	const columns = useMemo(() => getColumnsBacklog(showSprint), [showSprint]);

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

	const selectedRows = table.getSelectedRowModel().rows;
	const selectedTasks = selectedRows.map((row) => row.original);
	const selectedCount = selectedRows.length;

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
				onSelectAll={() => table.toggleAllRowsSelected(true)}
				onClear={() => table.resetRowSelection()}
				onMoveToSprint={() => {
					const taskIds = selectedTasks.map((task) => task.id);
					console.log("move to sprint", taskIds);
				}}
				onAssign={() => {
					const taskIds = selectedTasks.map((task) => task.id);
					console.log("assign", taskIds);
				}}
				onChangeStatus={() => {
					const taskIds = selectedTasks.map((task) => task.id);
					console.log("change status", taskIds);
				}}
				onDelete={() => {
					const taskIds = selectedTasks.map((task) => task.id);
					console.log("delete", taskIds);
				}}
			/>
		</>
	);
};

export default TableBacklog;
