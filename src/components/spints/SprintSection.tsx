"use client";

import {
	ColumnDef,
	RowSelectionState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Ellipsis, MoreHorizontal, Play } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

import { SprintItem } from "@/services/sprint/type";
import TaskAssignees from "../task/TaskAssignees";
import { TaskBulkActionBar } from "../task/TaskBulkActionBar";

type SprintTaskItem = NonNullable<SprintItem["tasks"]>[number];

const formatDate = (date?: string | Date | null) => {
	if (!date) return "Chưa có";

	return new Date(date).toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
};

type SprintSectionProps = {
	sprint: SprintItem;
};

const getSprintTaskColumns = (): ColumnDef<SprintTaskItem>[] => [
	{
		id: "select",
		size: 48,
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllRowsSelected() ||
					(table.getIsSomeRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) =>
					table.toggleAllRowsSelected(!!value)
				}
				aria-label='Select all tasks in sprint'
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label='Select task'
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
						TM-{task.projectSeq ?? "-"}
					</span>
				</div>
			);
		},
	},
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

const SprintSection = ({ sprint }: SprintSectionProps) => {
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [isOpen, setIsOpen] = useState(true);

	const isActive = sprint.status === "ACTIVE";
	const isCompleted = sprint.status === "COMPLETED";

	const queryTask = useMemo(() => sprint.tasks ?? [], [sprint.tasks]);

	const columns = useMemo(() => getSprintTaskColumns(), []);

	const table = useReactTable({
		data: queryTask,
		columns,

		getRowId: (row) => `${sprint.id}-${row.id}`,
		enableRowSelection: true,

		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),

		onRowSelectionChange: setRowSelection,

		state: {
			rowSelection,
		},
	});

	const selectedRows = table.getSelectedRowModel().rows;
	const selectedTasks = selectedRows.map((row) => row.original);
	const selectedCount = selectedRows.length;

	return (
		<>
			<Card className='flex flex-col gap-1 overflow-hidden rounded-none !py-0'>
				<div className='flex items-center justify-between gap-4 border-b bg-muted/30 px-5 py-3'>
					<div className='flex items-center gap-3'>
						<Checkbox
							checked={
								table.getIsAllRowsSelected() ||
								(table.getIsSomeRowsSelected() &&
									"indeterminate")
							}
							onCheckedChange={(value) =>
								table.toggleAllRowsSelected(!!value)
							}
							disabled={queryTask.length === 0}
							aria-label='Select all sprint tasks'
						/>

						<Button
							variant='ghost'
							size='icon'
							className='size-7'
							onClick={() => setIsOpen((prev) => !prev)}
						>
							<ChevronDown
								className={`size-4 text-muted-foreground transition-transform ${
									isOpen ? "" : "-rotate-90"
								}`}
							/>
						</Button>

						<div className='flex flex-col gap-1'>
							<div className='flex items-center gap-2'>
								<span className='text-sm font-semibold'>
									{sprint.name}
								</span>
							</div>

							<p className='text-xs text-muted-foreground'>
								{queryTask.length} work items ·{" "}
								{formatDate(sprint.startAt)} -{" "}
								{formatDate(sprint.endAt)}
							</p>
						</div>
					</div>

					<div className='flex items-center gap-2'>
						{!isActive && !isCompleted && (
							<Button
								variant='outline'
								size='sm'
								className='gap-2'
							>
								<Play className='size-3.5' />
								Start sprint
							</Button>
						)}

						{isActive && (
							<Button variant='outline' size='sm'>
								Complete sprint
							</Button>
						)}

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant='ghost'
									size='icon'
									className='size-8'
								>
									<MoreHorizontal className='size-4' />
								</Button>
							</DropdownMenuTrigger>

							<DropdownMenuContent align='end'>
								<DropdownMenuItem>Edit sprint</DropdownMenuItem>
								<DropdownMenuItem>Move tasks</DropdownMenuItem>
								<DropdownMenuItem className='text-destructive'>
									Delete sprint
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				{isOpen && (
					<div className='overflow-x-auto p-0 px-1'>
						{queryTask.length === 0 ? (
							<div className='py-3 text-center text-sm font-medium text-muted-foreground'>
								Chưa có task
							</div>
						) : (
							<div className='relative max-h-[520px] min-w-215 overflow-auto border'>
								<table className='w-full caption-bottom text-sm'>
									<TableHeader>
										{table
											.getHeaderGroups()
											.map((headerGroup) => (
												<TableRow
													key={headerGroup.id}
													className='hover:bg-transparent'
												>
													{headerGroup.headers.map(
														(header) => (
															<TableHead
																key={header.id}
																className='sticky top-0 z-20 h-10 bg-background shadow-[inset_0_-1px_0_hsl(var(--border))]'
																style={{
																	width: header.getSize(),
																	minWidth:
																		header.getSize(),
																}}
															>
																{header.isPlaceholder
																	? null
																	: flexRender(
																			header
																				.column
																				.columnDef
																				.header,
																			header.getContext(),
																		)}
															</TableHead>
														),
													)}
												</TableRow>
											))}
									</TableHeader>

									<TableBody>
										{table.getRowModel().rows.map((row) => (
											<TableRow
												key={row.id}
												className='h-14'
												data-state={
													row.getIsSelected() &&
													"selected"
												}
											>
												{row
													.getVisibleCells()
													.map((cell) => (
														<TableCell
															key={cell.id}
														>
															{flexRender(
																cell.column
																	.columnDef
																	.cell,
																cell.getContext(),
															)}
														</TableCell>
													))}
											</TableRow>
										))}
									</TableBody>
								</table>
							</div>
						)}
					</div>
				)}
			</Card>

			<TaskBulkActionBar
				selectedCount={selectedCount}
				totalCount={queryTask.length}
				onSelectAll={() => table.toggleAllRowsSelected(true)}
				onClear={() => table.resetRowSelection()}
				onMoveToSprint={() => {
					const taskIds = selectedTasks.map((task) => task.id);
					console.log("move sprint tasks", taskIds);
				}}
				onAssign={() => {
					const taskIds = selectedTasks.map((task) => task.id);
					console.log("assign sprint tasks", taskIds);
				}}
				onChangeStatus={() => {
					const taskIds = selectedTasks.map((task) => task.id);
					console.log("change status sprint tasks", taskIds);
				}}
				onDelete={() => {
					const taskIds = selectedTasks.map((task) => task.id);
					console.log("delete sprint tasks", taskIds);
				}}
			/>
		</>
	);
};

export default SprintSection;
