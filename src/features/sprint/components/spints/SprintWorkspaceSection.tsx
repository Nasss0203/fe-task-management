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
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
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

import { useSprints } from "@/features/sprint/hooks/useSprint";

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
						className="border-border data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
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
							<span className='truncate text-[13px] font-medium text-foreground'>
								{task.title ?? "Untitled task"}
							</span>

							{task.key && (
								<span className='text-[11px] text-muted-foreground'>
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
					<span className='line-clamp-1 text-[13px] text-muted-foreground'>
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
					return <StatusBadge statusName={status?.name} />;
				},
			},
			{
				accessorKey: "priority",
				size: 150,
				header: "Priority",
				cell: ({ row }) => {
					const priority = row.original.priority;
					return <PriorityBadge priorityName={priority?.name} />;
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
							<span className='text-[13px] text-muted-foreground italic'>
								Unassigned
							</span>
						);
					}

					return (
						<span className='line-clamp-1 text-[13px] text-foreground'>
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
									className='size-8 text-muted-foreground hover:hover:text-foreground hover:hover:bg-accent hover:text-accent-foreground transition-colors'
								>
									<MoreHorizontal className='size-4' />
								</Button>
							</DropdownMenuTrigger>

							<DropdownMenuContent align='end' className="bg-popover border-border rounded-xl min-w-[160px]">
								<DropdownMenuItem className="text-xs text-foreground focus:focus:bg-accent focus:text-foreground cursor-pointer">View task</DropdownMenuItem>
								<DropdownMenuItem className="text-xs text-foreground focus:focus:bg-accent focus:text-foreground cursor-pointer">
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
		<Card className='flex flex-col gap-0 overflow-hidden rounded-2xl border-border bg-muted/50 !py-0'>
			<div className='flex items-center justify-between gap-4 border-b border-border bg-muted/50 px-4 py-3'>
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
						className="border-border data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
					/>

					<Button
						variant='ghost'
						size='icon'
						className='size-7 text-muted-foreground hover:hover:bg-accent hover:text-accent-foreground hover:hover:text-foreground transition-colors'
						onClick={() => setIsOpen((prev) => !prev)}
					>
						<ChevronDown
							className={cn("size-4 transition-transform duration-300", !isOpen && "-rotate-90")}
						/>
					</Button>

					<div className='flex flex-col gap-1'>
						<div className='flex items-center gap-2'>
							<span className='text-[14px] font-semibold text-foreground'>
								Sprint tasks
							</span>

							{selectedCount > 0 && (
								<span className='text-[12px] font-medium text-muted-foreground'>
									{selectedCount} selected
								</span>
							)}
						</div>

						<p className='text-[12px] text-muted-foreground'>
							{tasks.length} items added to sprint
						</p>
					</div>
				</div>

				<div className='flex items-center gap-2'>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='ghost'
								size='icon'
								className='size-8 text-muted-foreground hover:hover:bg-accent hover:text-accent-foreground transition-colors'
							>
								<MoreHorizontal className='size-4' />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align='end' className="bg-popover border-border rounded-xl min-w-[160px]">
							<DropdownMenuItem className="text-xs text-foreground focus:focus:bg-accent focus:text-foreground cursor-pointer">Export tasks</DropdownMenuItem>
							<DropdownMenuItem className="text-xs text-foreground focus:focus:bg-accent focus:text-foreground cursor-pointer">Move selected</DropdownMenuItem>
							<DropdownMenuItem className='text-xs text-rose-500 focus:bg-rose-500/10 focus:text-rose-400 cursor-pointer'>
								Clear selected
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{isOpen && (
				<div className='flex flex-col gap-6 p-4'>
					{tasks.length === 0 ? (
						<div className='py-6 text-center text-[13px] font-medium text-muted-foreground'>
							No tasks in this sprint
						</div>
					) : (
						<div className='relative max-h-[520px] min-w-245 overflow-auto rounded-xl border border-border/50 bg-muted/50'>
							<table className='w-full caption-bottom text-sm'>
								<TableHeader>
									{table
										.getHeaderGroups()
										.map((headerGroup) => (
											<TableRow
												key={headerGroup.id}
												className='hover:bg-transparent border-border'
											>
												{headerGroup.headers.map(
													(header) => (
														<TableHead
															key={header.id}
															className='sticky top-0 z-20 h-10 bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground shadow-[inset_0_-1px_0_rgba(255,255,255,0.05)] backdrop-blur-md'
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
											className='h-12 border-border hover:hover:bg-muted/80 transition-colors'
											data-state={
												row.getIsSelected() &&
												"selected"
											}
										>
											{row
												.getVisibleCells()
												.map((cell) => (
													<TableCell key={cell.id} className="py-2">
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
