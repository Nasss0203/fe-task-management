import DropdownTaskStatus from "@/components/dropdown/DropdownTaskStatus";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";

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

function getPriorityClass(priority: string | null) {
	switch (priority?.toLowerCase()) {
		case "high":
			return "bg-red-500/15 text-red-600 border-red-500/20";
		case "medium":
			return "bg-amber-500/15 text-amber-600 border-amber-500/20";
		case "low":
			return "bg-sky-500/15 text-sky-600 border-sky-500/20";
		default:
			return "bg-slate-500/15 text-slate-600 border-slate-500/20";
	}
}

function formatEstimate(minutes: number | null) {
	if (!minutes) return "—";
	if (minutes < 60) return `${minutes} phút`;

	const hour = Math.floor(minutes / 60);
	const remain = minutes % 60;

	if (!remain) return `${hour} giờ`;
	return `${hour} giờ ${remain} phút`;
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
				header: "Tên công việc",
				cell: ({ row }) => (
					<div className='font-medium text-foreground'>
						{row.original.title}
					</div>
				),
			},
			{
				accessorKey: "assigneeName",
				id: "assigneeName",
				size: 180,
				header: "Người được giao",
				cell: ({ row }) => (
					<div className='text-muted-foreground'>
						{row.original.assigneeName || "Chưa giao"}
					</div>
				),
			},
			{
				accessorKey: "priorityName",
				id: "priorityName",
				size: 140,
				header: "Ưu tiên",
				cell: ({ row }) => (
					<span
						className={cn(
							"inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
							getPriorityClass(row.original.priorityName),
						)}
					>
						{row.original.priorityName || "Chưa có"}
					</span>
				),
			},
			{
				accessorKey: "statusName",
				id: "statusName",
				size: 160,
				header: "Trạng thái",
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
				header: "Ước tính",
				cell: ({ row }) => (
					<div className='text-muted-foreground'>
						{formatEstimate(row.original.estimateMinutes)}
					</div>
				),
			},
		],
		[projectId, workspaceId],
	);

	return columns;
};
