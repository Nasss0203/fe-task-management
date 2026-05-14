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

import { SprintItem } from "@/services/sprint/type";
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

type SprintProjectSectionProps = {
	sprint: any;
	containerId: string;
};

const SprintProjectSection = ({
	sprint,
	containerId,
}: SprintProjectSectionProps) => {
	const tasks = sprint.tasks ?? [];

	return (
		<Card className='overflow-hidden py-0! flex flex-col gap-1 rounded-none'>
			<div className='flex items-center justify-between gap-4 border-b bg-muted/30 px-3 py-3'>
				<div className='flex items-center gap-3'>
					<Button variant='ghost' size='icon' className='size-7'>
						<ChevronDown className='size-4 text-muted-foreground' />
					</Button>

					<div className='flex flex-col gap-1'>
						<div className='flex items-center gap-2'>
							<span className='text-sm font-semibold'>
								{sprint.name}
							</span>
							<span className='text-sm text-muted-foreground'>
								({tasks.length} work items)
							</span>
						</div>
					</div>
				</div>
			</div>

			<div className='overflow-x-auto px-1'>
				<TableBacklog tasks={tasks} containerId={containerId} />
			</div>
		</Card>
	);
};

export default SprintProjectSection;
