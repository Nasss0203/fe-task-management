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
import DropdownTaskStatus from "@/components/dropdown/DropdownTaskStatus";
import DropdownTaskPriority from "@/components/dropdown/DropdownTaskPriority";
import { TaskNameCell, TaskAssigneeCell } from "@/components/table/columns/column-task";
import DropdownTaskContextMenu from "@/components/dropdown/DropdownTaskContextMenu";
import { DrawerItemView } from "@/components/drawer/DrawerItemView";
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
import type { TaskItem } from "@/services/task/type";

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
	statusName?: string | null;
	priorityName?: string | null;
	assignees?: {
		id?: string;
		fullName?: string | null;
		username?: string | null;
		avatarUrl?: string | null;
	}[];
	projectId: string;
	workspaceId: string;
};

const SprintWorkspaceSection = ({
	projectId,
	workspaceId,
}: SprintTaskTableProps) => {
	const [isOpen, setIsOpen] = useState(true);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [activeDrawerTaskId, setActiveDrawerTaskId] = useState<string | null>(null);

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
				projectId: sprint.projectId || task.projectId,
				workspaceId: sprint.workspaceId || task.workspaceId,
			})),
		);
	}, [sprints]);

	const activeDrawerTask = useMemo(() => {
		if (!activeDrawerTaskId) return null;
		return tasks.find((t) => t.id === activeDrawerTaskId) as unknown as TaskItem;
	}, [activeDrawerTaskId, tasks]);

	const columns = useMemo<ColumnDef<SprintWorkspaceTask>[]>(
		() => [
			{
				id: "select",
				size: 42,
				header: ({ table }) => (
					<Checkbox
						checked={
							table.getIsAllPageRowsSelected() ||
							(table.getIsSomePageRowsSelected() &&
								"indeterminate")
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
						<div className='flex min-w-0 flex-col gap-0.5 w-full'>
							<div className="w-full">
								<TaskNameCell
									taskId={task.id}
									workspaceId={workspaceId!}
									projectId={projectId!}
									initialTitle={task.title}
								/>
							</div>

							{task.key && (
								<span className='text-[11px] text-muted-foreground ml-1'>
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
					<span className='line-clamp-1 text-[13px] text-muted-foreground ml-2'>
						{row.original.sprintName}
					</span>
				),
			},
			{
				accessorKey: "status",
				size: 150,
				header: "Status",
				cell: ({ row }) => {
					return (
						<DropdownTaskStatus
							taskId={row.original.id}
							projectId={projectId!}
							workspaceId={workspaceId!}
							statusName={row.original.statusName ?? ""}
						/>
					);
				},
			},
			{
				accessorKey: "priority",
				size: 150,
				header: "Priority",
				cell: ({ row }) => {
					return (
						<DropdownTaskPriority
							taskId={row.original.id}
							projectId={projectId!}
							workspaceId={workspaceId!}
							priorityName={row.original.priorityName ?? null}
						/>
					);
				},
			},
			{
				accessorKey: "assignees",
				size: 160,
				header: "Assignee",
				cell: ({ row }) => {
					return (
						<div className="-ml-2">
							<TaskAssigneeCell
								taskId={row.original.id}
								workspaceId={workspaceId!}
								projectId={projectId!}
								assignees={row.original.assignees}
							/>
						</div>
					);
				},
			},
			{
				id: "actions",
				size: 48,
				header: "",
				cell: ({ row }) => (
					<div className='flex justify-end'>
						<DropdownTaskContextMenu
							taskId={row.original.id}
							workspaceId={workspaceId!}
							projectId={projectId!}
							onOpenDetail={() => setActiveDrawerTaskId(row.original.id)}
						>
							<Button
								variant='ghost'
								size='icon'
								className='size-8 text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground transition-colors'
							>
								<MoreHorizontal className='size-4' />
							</Button>
						</DropdownTaskContextMenu>
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
		<>
			<Card className='flex flex-col gap-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm !py-0'>
				<div className='flex items-center justify-between gap-4 border-b border-border px-4 py-3 bg-transparent'>
					<div className='flex items-center gap-3'>


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
					<div className='relative overflow-auto border-t-0'>
						{tasks.length === 0 ? (
							<div className='py-6 text-center text-[13px] font-medium text-muted-foreground'>
								No tasks in this sprint
							</div>
						) : (
							<div className='relative max-h-[520px] min-w-245 overflow-auto'>
								<table className='w-full caption-bottom text-sm'>
									<TableHeader>
										{table
											.getHeaderGroups()
											.map((headerGroup) => (
												<TableRow
													key={headerGroup.id}
													className='h-12 hover:bg-transparent border-b border-border bg-muted/30 hover:bg-muted/30'
												>
													{headerGroup.headers.map(
														(header) => (
															<TableHead
																key={header.id}
																className='sticky top-0 z-20 h-10 bg-muted/30 whitespace-nowrap px-3 text-xs font-semibold text-muted-foreground shadow-[inset_0_-1px_0_rgba(255,255,255,0.05)] backdrop-blur-md'
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
												className='h-14 border-b border-border/70 transition-colors hover:bg-muted/35 data-[state=selected]:bg-muted'
												data-state={
													row.getIsSelected() &&
													"selected"
												}
											>
												{row
													.getVisibleCells()
													.map((cell) => (
														<TableCell key={cell.id} className="whitespace-nowrap px-3 py-2 text-sm text-foreground">
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

			{activeDrawerTask ? (
				<DrawerItemView
					open={!!activeDrawerTaskId}
					onOpenChange={(open) => !open && setActiveDrawerTaskId(null)}
					task={activeDrawerTask}
				/>
			) : null}
		</>
	);
};

export default SprintWorkspaceSection;
