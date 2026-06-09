import DropdownTaskStatus from "@/components/dropdown/DropdownTaskStatus";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { PriorityBadge } from "@/components/shared/priority-badge";

type TaskItem = {
	id: string;
	title: string;
	assigneeName: string | null;
	priorityName: string | null;
	statusName: string;
	estimateMinutes: number | null;
};

type UseBacklogColumnsParams = {
	projectId?: string;
	workspaceId?: string;
};

function formatEstimate(minutes: number | null) {
	if (!minutes) return "—";
	if (minutes < 60) return `${minutes}m`;

	const hour = Math.floor(minutes / 60);
	const remain = minutes % 60;

	if (!remain) return `${hour}h`;
	return `${hour}h ${remain}m`;
}

export const useBacklogColumns = ({
	projectId,
	workspaceId,
}: UseBacklogColumnsParams) => {
	const columns = React.useMemo<ColumnDef<TaskItem>[]>(
		() => [
			{
				accessorKey: "title",
				id: "title",
				size: 260,
				header: "Task Name",
				cell: ({ row }) => (
					<div className='text-[13px] font-medium text-neutral-200 truncate'>
						{row.original.title}
					</div>
				),
			},
			{
				accessorKey: "assigneeName",
				id: "assigneeName",
				size: 180,
				header: "Assignee",
				cell: ({ row }) => (
					<div className='text-[13px] text-neutral-500 truncate'>
						{row.original.assigneeName || "Unassigned"}
					</div>
				),
			},
			{
				accessorKey: "priorityName",
				id: "priorityName",
				size: 140,
				header: "Priority",
				cell: ({ row }) => (
					<PriorityBadge priorityName={row.original.priorityName} />
				),
			},
			{
				accessorKey: "statusName",
				id: "statusName",
				size: 160,
				header: "Status",
				cell: ({ row }) => (
					<DropdownTaskStatus
						taskId={row.original.id}
						projectId={projectId as string}
						workspaceId={workspaceId as string}
						statusName={row.original.statusName}
					/>
				),
			},
			{
				accessorKey: "estimateMinutes",
				id: "estimateMinutes",
				size: 140,
				header: "Estimate",
				cell: ({ row }) => (
					<div className='text-[13px] text-neutral-400'>
						{formatEstimate(row.original.estimateMinutes)}
					</div>
				),
			},
		],
		[projectId, workspaceId],
	);

	return columns;
};
