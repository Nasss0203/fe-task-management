"use client";

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
import type { ColumnDef } from "@tanstack/react-table";
import { Ellipsis } from "lucide-react";
import { useState } from "react";
import TableBacklog from "@/components/table/TableBacklog";
import TaskAssignees from "@/features/task/components/task/TaskAssignees";
import type { SprintItem } from "@/services/sprint/type";
import type { TaskPositionContextInput } from "@/services/task/type";
import { SprintSectionHeader } from "@/features/sprint/components/SprintSectionHeader";

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
	const sprintPositionContext: TaskPositionContextInput = {
		context: "sprint",
		contextId: sprint.id,
	};

	return (
		<Card className='flex flex-col gap-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm !py-0'>
			<SprintSectionHeader
				sprint={sprint}
				status={status}
				projectId={projectId}
				workspaceId={workspaceId}
				open={open}
				onToggle={() => setOpen(!open)}
			/>

			{open && (
				<div className='relative overflow-auto border-t-0'>
					<TableBacklog
						tasks={tasks}
						containerId={containerId}
						positionContext={sprintPositionContext}
					/>
				</div>
			)}
		</Card>
	);
};

export default SprintProjectSection;
