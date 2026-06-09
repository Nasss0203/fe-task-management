"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, Ellipsis } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";
import { SprintItem } from "@/services/sprint/type";
import { useState } from "react";
import { CompleteSprintDialog } from "../dialog/CompleteSprintDialog";
import { StartSprintDialog } from "../dialog/DialogStartSprint";
import TableBacklog from "../table/TableBacklog";
import TaskAssignees from "../task/TaskAssignees";

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

enum SprintStatus {
	PLANNED = "PLANNED",
	ACTIVE = "ACTIVE",
	COMPLETED = "COMPLETED",
	CANCELLED = "CANCELLED",
}

type SprintProjectSectionProps = {
	sprint: SprintItem;
	containerId: string;
	status: SprintStatus;
	projectId: string;
	workspaceId: string;
};

const SprintProjectSection = ({
	sprint,
	containerId,
	status,
	projectId,
	workspaceId,
}: SprintProjectSectionProps) => {
	const tasks = sprint.tasks ?? [];
	const [open, setOpen] = useState<boolean>(true);
	const handleOpenTable = () => {
		setOpen(!open);
	};
	return (
		<Card className='overflow-hidden py-0! flex flex-col gap-0 rounded-2xl border-neutral-800 bg-neutral-950/20'>
			<div className='flex items-center justify-between gap-4 border-b border-neutral-800 bg-neutral-900/40 px-4 py-3'>
				<div className='flex items-center gap-3'>
					<Button
						variant='ghost'
						size='icon'
						className='size-7 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition-colors'
						onClick={handleOpenTable}
					>
						<ChevronDown
							className={cn(
								"size-4 transition-transform duration-300",
								!open && "-rotate-90",
							)}
						/>
					</Button>

					<div className='flex flex-col gap-1'>
						<div className='flex items-center gap-2'>
							<span className='text-[14px] font-semibold text-neutral-100'>
								{sprint.name}
							</span>
							<span className='text-[12px] font-medium text-neutral-500'>
								({tasks.length} work items)
							</span>
						</div>
					</div>
				</div>

				{status === SprintStatus.PLANNED ? (
					<StartSprintDialog
						defaultSprintName={sprint.name}
						projectId={projectId}
						sprintId={sprint.id}
						workspaceId={workspaceId}
						workItemCount={tasks?.length ?? 0}
					></StartSprintDialog>
				) : status === SprintStatus.ACTIVE ? (
					<CompleteSprintDialog
						defaultSprintName={sprint.name}
						projectId={projectId}
						sprintId={sprint.id}
						workspaceId={workspaceId}
						completedWorkItemCount={
							tasks?.filter(
								(task: any) => task.status?.isDone === true,
							).length ?? 0
						}
						openWorkItemCount={
							tasks?.filter(
								(task: any) => task.status?.isDone !== true,
							).length ?? 0
						}
					/>
				) : null}
			</div>

			{open ? (
				<div className='flex flex-col gap-6 p-4'>
					<div className='overflow-x-auto rounded-xl border border-neutral-800/50 bg-neutral-950/30'>
						<TableBacklog tasks={tasks} containerId={containerId} />
					</div>
				</div>
			) : null}
		</Card>
	);
};

export default SprintProjectSection;
