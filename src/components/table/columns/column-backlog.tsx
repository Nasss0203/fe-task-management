"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { TaskItem } from "@/services/task/type";
import { ColumnDef } from "@tanstack/react-table";
import { GripVertical, MoreHorizontal } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";

const getAssigneeName = (assignee: TaskItem["assignees"][number]) => {
	return (
		assignee.fullName?.trim() ||
		assignee.username?.trim() ||
		"Unnamed"
	);
};

const getInitials = (name: string) => {
	return name
		.split(" ")
		.filter(Boolean)
		.map((word) => word[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
};

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

export const columnsBacklog: ColumnDef<TaskItem>[] = [
	{
		id: "drag",
		size: 36,
		header: "",
		cell: () => (
			<GripVertical
				size={14}
				className='cursor-grab text-neutral-600 hover:text-neutral-400 transition-colors'
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
				className="border-neutral-700 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label='Select task'
				className="border-neutral-700 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "projectSeq",
		size: 80,
		header: "ID",
		cell: ({ row }) => (
			<span className='text-[13px] font-medium text-neutral-500'>
				{row.original.projectSeq ? `#${row.original.projectSeq}` : "-"}
			</span>
		),
	},
	{
		accessorKey: "title",
		size: 320,
		header: "Task",
		cell: ({ row }) => (
			<div className='flex min-w-0 flex-col py-1'>
				<span className='truncate text-[14px] font-medium text-neutral-200'>
					{row.original.title}
				</span>
				{row.original.description ? (
					<span className='truncate text-[12px] text-neutral-500'>
						{row.original.description}
					</span>
				) : null}
			</div>
		),
	},
	{
		accessorKey: "priorityName",
		size: 120,
		header: "Priority",
		cell: ({ row }) => (
			<PriorityBadge priorityName={row.original.priorityName} />
		),
	},
	{
		accessorKey: "statusName",
		size: 130,
		header: "Status",
		cell: ({ row }) => (
			<StatusBadge statusName={row.original.statusName} />
		),
	},
	{
		accessorKey: "assignees",
		size: 190,
		header: "Assignees",
		cell: ({ row }) => {
			const assignees = row.original.assignees ?? [];

			if (!assignees.length) {
				return (
					<span className='text-[13px] text-neutral-500 italic'>
						Unassigned
					</span>
				);
			}

			return (
				<div className='flex items-center gap-2'>
					<div className='flex -space-x-1.5'>
						{assignees.slice(0, 3).map((assignee) => {
							const name = getAssigneeName(assignee);

							return (
								<div
									key={assignee.userId}
									className='flex size-6 items-center justify-center rounded-full border border-neutral-900 bg-neutral-800 text-[10px] font-semibold text-neutral-300 shadow-sm'
									title={name}
								>
									{getInitials(name)}
								</div>
							);
						})}
					</div>

					<span className='max-w-[100px] truncate text-[13px] text-neutral-300'>
						{getAssigneeName(assignees[0])}
						{assignees.length > 1 ? ` +${assignees.length - 1}` : ""}
					</span>
				</div>
			);
		},
	},
	{
		accessorKey: "estimateMinutes",
		size: 90,
		header: "Estimate",
		cell: ({ row }) => (
			<span className='text-[13px] font-medium text-neutral-300'>
				{formatEstimate(row.original.estimateMinutes)}
			</span>
		),
	},
	{
		accessorKey: "dueAt",
		size: 110,
		header: "Due",
		cell: ({ row }) => (
			<span className='text-[13px] text-neutral-400'>
				{formatDate(row.original.dueAt)}
			</span>
		),
	},
	{
		id: "actions",
		size: 44,
		header: "",
		cell: () => (
			<button className='rounded-md p-1.5 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-100 transition-colors'>
				<MoreHorizontal size={14} />
			</button>
		),
		enableSorting: false,
		enableHiding: false,
	},
];
