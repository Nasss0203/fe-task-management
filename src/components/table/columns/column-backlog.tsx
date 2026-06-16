"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { TaskItem } from "@/services/task/type";
import { ColumnDef } from "@tanstack/react-table";
import { GripVertical, MoreHorizontal } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import DropdownTaskStatus from "@/components/dropdown/DropdownTaskStatus";
import DropdownTaskPriority from "@/components/dropdown/DropdownTaskPriority";
import DropdownTaskContextMenu from "@/components/dropdown/DropdownTaskContextMenu";
import { TaskAssigneeCell } from "./column-task";

const formatEstimate = (minutes?: number | null) => {
	if (!minutes) return "-";

	if (minutes < 60) {
		return `${minutes}m`;
	}

	const hours = minutes / 60;

	return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
};

const formatDate = (value?: string | null) => {
	if (!value) return "-";

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return "-";
	}

	return new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "short",
	}).format(date);
};

type getColumnsBacklogProps = {
	onOpenDetail?: (taskId: string) => void;
	workspaceId: string;
	projectId: string;
};

export const getColumnsBacklog = ({
	onOpenDetail,
	workspaceId,
	projectId,
}: getColumnsBacklogProps): ColumnDef<TaskItem>[] => [
	{
		id: "drag",
		size: 36,
		header: "",
		cell: () => (
			<GripVertical
				size={14}
				className='cursor-grab text-neutral-600 hover:hover:text-muted-foreground transition-colors'
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		id: "select",
		size: 42,
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
				className="border-border data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label='Select task'
				className="border-border data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "projectSeq",
		size: 56,
		header: "ID",
		cell: ({ row }) => (
			<span className='text-[13px] font-medium text-muted-foreground'>
				{row.original.projectSeq ? `#${row.original.projectSeq}` : "-"}
			</span>
		),
	},
	{
		accessorKey: "title",
		size: 280,
		header: "Task",
		cell: ({ row }) => (
			<div className='flex min-w-0 flex-col py-1'>
				<span className='truncate text-[14px] font-medium text-foreground cursor-pointer hover:underline' title={row.original.title} onClick={() => onOpenDetail?.(row.original.id)}>
					{row.original.title}
				</span>
				{row.original.description ? (
					<span className='truncate text-[12px] text-muted-foreground' title={row.original.description}>
						{row.original.description}
					</span>
				) : null}
			</div>
		),
	},
	{
		accessorKey: "priorityName",
		size: 110,
		header: "Priority",
		cell: ({ row }) => (
			<DropdownTaskPriority
				workspaceId={row.original.workspaceId}
				projectId={row.original.projectId}
				taskId={row.original.id}
				priorityName={row.original.priorityName}
			/>
		),
	},
	{
		accessorKey: "statusName",
		size: 110,
		header: "Status",
		cell: ({ row }) => (
			<DropdownTaskStatus
				workspaceId={row.original.workspaceId}
				projectId={row.original.projectId}
				taskId={row.original.id}
				statusName={row.original.statusName ?? ""}
			/>
		),
	},
	{
		accessorKey: "assignees",
		size: 140,
		header: "Assignees",
		cell: ({ row }) => {
			return (
				<div className='-ml-2'>
					<TaskAssigneeCell
						taskId={row.original.id}
						workspaceId={workspaceId}
						projectId={projectId}
						assignees={row.original.assignees}
					/>
				</div>
			);
		},
	},
	{
		accessorKey: "estimateMinutes",
		size: 80,
		header: "Est.",
		cell: ({ row }) => (
			<span className='text-[13px] font-medium text-foreground'>
				{formatEstimate(row.original.estimateMinutes)}
			</span>
		),
	},
	{
		accessorKey: "dueAt",
		size: 80,
		header: "Due",
		cell: ({ row }) => (
			<span className='text-[13px] text-muted-foreground'>
				{formatDate(row.original.dueAt)}
			</span>
		),
	},
	{
		id: "actions",
		size: 44,
		header: "",
		cell: ({ row }) => (
			<DropdownTaskContextMenu
				taskId={row.original.id}
				workspaceId={row.original.workspaceId}
				projectId={row.original.projectId}
				onOpenDetail={() => onOpenDetail?.(row.original.id)}
			>
				<button className='rounded-md p-1.5 text-muted-foreground hover:hover:bg-accent hover:text-accent-foreground hover:hover:text-foreground transition-colors'>
					<MoreHorizontal size={14} />
				</button>
			</DropdownTaskContextMenu>
		),
		enableSorting: false,
		enableHiding: false,
	},
];
