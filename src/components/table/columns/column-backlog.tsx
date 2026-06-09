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
		size: 56,
		header: "ID",
		cell: ({ row }) => (
			<span className='text-[13px] font-medium text-neutral-500'>
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
				<span className='truncate text-[14px] font-medium text-neutral-200' title={row.original.title}>
					{row.original.title}
				</span>
				{row.original.description ? (
					<span className='truncate text-[12px] text-neutral-500' title={row.original.description}>
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
			<PriorityBadge priorityName={row.original.priorityName} />
		),
	},
	{
		accessorKey: "statusName",
		size: 110,
		header: "Status",
		cell: ({ row }) => (
			<StatusBadge statusName={row.original.statusName} />
		),
	},
	{
		accessorKey: "assignees",
		size: 140,
		header: "Assignees",
		meta: { className: "hidden 2xl:table-cell" },
		cell: ({ row }) => {
			const assignees = row.original.assignees ?? [];

			if (!assignees.length) {
				return (
					<span className='text-[13px] text-neutral-500 italic hidden 2xl:inline'>
						Unassigned
					</span>
				);
			}

			return (
				<div className='hidden items-center gap-2 2xl:flex min-w-0'>
					<div className='flex -space-x-1.5 shrink-0'>
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

					<span className='truncate text-[13px] text-neutral-300 flex-1 min-w-0'>
						{getAssigneeName(assignees[0])}
						{assignees.length > 1 ? ` +${assignees.length - 1}` : ""}
					</span>
				</div>
			);
		},
	},
	{
		accessorKey: "estimateMinutes",
		size: 80,
		header: "Est.",
		meta: { className: "hidden xl:table-cell" },
		cell: ({ row }) => (
			<span className='hidden text-[13px] font-medium text-neutral-300 xl:inline'>
				{formatEstimate(row.original.estimateMinutes)}
			</span>
		),
	},
	{
		accessorKey: "dueAt",
		size: 80,
		header: "Due",
		meta: { className: "hidden 2xl:table-cell" },
		cell: ({ row }) => (
			<span className='hidden text-[13px] text-neutral-400 2xl:inline'>
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
