"use client";

import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	RowSelectionState,
	useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { getTaskStatusStyle } from "@/lib/task-status-style";
import { cn } from "@/lib/utils";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { useSprints } from "@/hooks/use-sprint";

type SprintTaskTableProps = {
	workspaceId?: string;
	projectId?: string;
};

type SprintWorkspaceTask = {
	id: string;
	key?: string;
	title?: string;
	sprintId: string;
	sprintName: string;
	status?: {
		name?: string;
		color?: string;
	} | null;
	priority?: {
		name?: string;
		color?: string;
	} | null;
	assignees?: {
		id?: string;
		fullName?: string | null;
		username?: string | null;
		avatarUrl?: string | null;
	}[];
};

const SprintWorkspaceSection = ({
	projectId,
	workspaceId,
}: SprintTaskTableProps) => {
	const [isOpen, setIsOpen] = useState(true);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	const { sprintsQuery } = useSprints({ workspaceId, projectId });
	const sprints = useMemo(
		() => sprintsQuery.data?.data ?? [],
		[sprintsQuery.data?.data],
	);

	const tasks = useMemo<SprintWorkspaceTask[]>(() => {
		return sprints.flatMap((sprint) =>
			(sprint.tasks ?? []).map((task) => ({
				...task,
				sprintId: sprint.id,
				sprintName: sprint.name,
			})),
		);
	}, [sprints]);

	const columns = useMemo<ColumnDef<SprintWorkspaceTask>[]>(
		() => [
			{
				id: "select",
				size: 42,
				header: "",
				cell: ({ row }) => (
					<Checkbox
						checked={row.getIsSelected()}
						onCheckedChange={(value) => row.toggleSelected(!!value)}
						aria-label='Select sprint task'
					/>
				),
			},
			{
				accessorKey: "title",
				size: 360,
				header: "Task",
				cell: ({ row }) => {
					const task = row.original;

					return (
						<div className='flex min-w-0 flex-col gap-1'>
							<span className='truncate text-sm font-medium'>
								{task.title ?? "Untitled task"}
							</span>

							{task.key && (
								<span className='text-xs text-muted-foreground'>
									{task.key}
								</span>
							)}
						</div>
					);
				},
			},
			{
				accessorKey: "sprintName",
				size: 150,
				header: "Sprint",
				cell: ({ row }) => (
					<span className='line-clamp-1 text-sm text-muted-foreground'>
						{row.original.sprintName}
					</span>
				),
			},
			{
				accessorKey: "status",
				size: 150,
				header: "Status",
				cell: ({ row }) => {
					const status = row.original.status;
					const statusStyle = getTaskStatusStyle(status?.name);

					return (
						<span
							className={cn(
								"inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
								statusStyle.badge,
							)}
						>
							<span
								className={cn(
									"size-2 rounded-full",
									statusStyle.dot,
								)}
							/>
							{status?.name ?? "No status"}
						</span>
					);
				},
			},
			{
				accessorKey: "priority",
				size: 150,
				header: "Priority",
				cell: ({ row }) => {
					const priority = row.original.priority;

					return (
						<span className='inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground'>
							<span
								className='size-2 rounded-full bg-muted-foreground'
								style={{
									backgroundColor:
										priority?.color ?? undefined,
								}}
							/>
							{priority?.name ?? "No priority"}
						</span>
					);
				},
			},
			{
				accessorKey: "assignees",
				size: 160,
				header: "Assignee",
				cell: ({ row }) => {
					const assignees = row.original.assignees ?? [];

					if (assignees.length === 0) {
						return (
							<span className='text-sm text-muted-foreground'>
								Unassigned
							</span>
						);
					}

					return (
						<span className='line-clamp-1 text-sm text-muted-foreground'>
							{assignees
								.map(
									(assignee) =>
										assignee.fullName ??
										assignee.username ??
										"Unknown",
								)
								.join(", ")}
						</span>
					);
				},
			},
			{
				id: "actions",
				size: 48,
				header: "",
				cell: () => (
					<div className='flex justify-end'>
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
								<DropdownMenuItem>View task</DropdownMenuItem>
								<DropdownMenuItem>
									Move to backlog
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				),
			},
		],
		[],
	);

	const table = useReactTable({
		data: tasks,
		columns,

		getRowId: (row) => `SP-${row.id}`,
		enableRowSelection: true,

		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),

		onRowSelectionChange: setRowSelection,

		state: {
			rowSelection,
		},
	});

	const selectedCount = table.getSelectedRowModel().rows.length;

	return (
		<Card className='flex flex-col gap-1 overflow-hidden rounded-none !py-0'>
			<div className='flex items-center justify-between gap-4 border-b bg-muted/30 px-5 py-3'>
				<div className='flex items-center gap-3'>
					<Checkbox
						checked={
							table.getIsAllRowsSelected() ||
							(table.getIsSomeRowsSelected() && "indeterminate")
						}
						onCheckedChange={(value) =>
							table.toggleAllRowsSelected(!!value)
						}
						disabled={tasks.length === 0}
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
								Sprint tasks
							</span>

							{selectedCount > 0 && (
								<span className='text-xs text-muted-foreground'>
									{selectedCount} selected
								</span>
							)}
						</div>

						<p className='text-xs text-muted-foreground'>
							{tasks.length} work items đã được đưa vào sprint
						</p>
					</div>
				</div>

				<div className='flex items-center gap-2'>
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
							<DropdownMenuItem>Export tasks</DropdownMenuItem>
							<DropdownMenuItem>Move selected</DropdownMenuItem>
							<DropdownMenuItem className='text-destructive'>
								Clear selected
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{isOpen && (
				<div className='overflow-x-auto p-0 px-1'>
					{tasks.length === 0 ? (
						<div className='py-3 text-center text-sm font-medium text-muted-foreground'>
							Chưa có task trong sprint
						</div>
					) : (
						<div className='relative max-h-[520px] min-w-245 overflow-auto border'>
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
															className='sticky top-0 z-20 h-10 bg-background text-xs font-medium uppercase tracking-wide text-muted-foreground shadow-[inset_0_-1px_0_hsl(var(--border))]'
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
													<TableCell key={cell.id}>
														{flexRender(
															cell.column
																.columnDef.cell,
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
	);
};

export default SprintWorkspaceSection;
