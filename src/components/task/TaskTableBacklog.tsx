"use client";

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

import type { TaskItem } from "@/services/task/type";
import PanigationTable from "../panigation/PanigationTable";
import TaskAssignees from "./TaskAssignees";
import { TaskBulkActionBar } from "./TaskBulkActionBar";

type TaskTableProps = {
	tasks: TaskItem[];
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

			return (
				<Select value={task.statusId}>
					<SelectTrigger className='h-8 w-32.5'>
						<SelectValue placeholder='No status' />
					</SelectTrigger>

					<SelectContent>
						<SelectItem value={task.statusId}>
							{task.statusName ?? "No status"}
						</SelectItem>
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
		cell: ({ row }) => <TaskAssignees assignees={row.original.assignees} />,
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

const TaskTableBacklog = ({ tasks, showSprint = false }: TaskTableProps) => {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

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

	if (!tasks.length) {
		return (
			<div className='rounded-md border px-4 py-8 text-center text-sm text-muted-foreground'>
				Không có task.
			</div>
		);
	}

	return (
		<>
			<div className='rounded-md border'>
				<div className='relative max-h-[600px] overflow-auto rounded-md'>
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

						<TableBody>
							{table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									className='h-14'
									data-state={
										row.getIsSelected() && "selected"
									}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</table>
				</div>

				<PanigationTable table={table} />
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

export default TaskTableBacklog;
