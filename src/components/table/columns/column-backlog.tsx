"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { TaskItem } from "@/services/task/type";
import { ColumnDef } from "@tanstack/react-table";
import { GripVertical, MoreHorizontal } from "lucide-react";

const priorityClassName = (priorityName?: string | null) => {
	const priority = priorityName?.trim().toLowerCase();

	if (priority === "high" || priority === "cao") {
		return "border-red-500/20 bg-red-500/10 text-red-400";
	}

	if (
		priority === "medium" ||
		priority === "normal" ||
		priority === "trung bình"
	) {
		return "border-orange-500/20 bg-orange-500/10 text-orange-400";
	}

	if (priority === "low" || priority === "thấp") {
		return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
	}

	return "border-slate-500/20 bg-slate-500/10 text-slate-300";
};

const statusClassName = (statusName?: string | null) => {
	const status = statusName?.trim().toLowerCase();

	if (status === "done" || status === "hoàn tất") {
		return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
	}

	if (
		status === "in progress" ||
		status === "progress" ||
		status === "đang thực hiện"
	) {
		return "border-sky-500/20 bg-sky-500/10 text-sky-400";
	}

	if (status === "todo" || status === "to do" || status === "chưa bắt đầu") {
		return "border-slate-500/20 bg-slate-500/10 text-slate-300";
	}

	return "border-zinc-500/20 bg-zinc-500/10 text-zinc-300";
};

const getAssigneeName = (assignee: TaskItem["assignees"][number]) => {
	return (
		assignee.fullName?.trim() ||
		assignee.username?.trim() ||
		"Chưa đặt tên"
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

	return new Intl.DateTimeFormat("vi-VN", {
		day: "2-digit",
		month: "2-digit",
	}).format(date);
};

export const columnsBacklog: ColumnDef<TaskItem>[] = [
	{
		id: "drag",
		size: 36,
		header: "",
		cell: () => (
			<GripVertical
				size={15}
				className='cursor-grab text-muted-foreground'
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
				aria-label='Chọn tất cả'
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label='Chọn công việc'
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
			<span className='text-sm font-medium text-muted-foreground'>
				{row.original.projectSeq ? `#${row.original.projectSeq}` : "-"}
			</span>
		),
	},
	{
		accessorKey: "title",
		size: 320,
		header: "Công việc",
		cell: ({ row }) => (
			<div className='flex min-w-0 flex-col'>
				<span className='truncate font-medium text-foreground'>
					{row.original.title}
				</span>
				{row.original.description ? (
					<span className='truncate text-xs text-muted-foreground'>
						{row.original.description}
					</span>
				) : null}
			</div>
		),
	},
	{
		accessorKey: "priorityName",
		size: 120,
		header: "Ưu tiên",
		cell: ({ row }) => (
			<span
				className={cn(
					"inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
					priorityClassName(row.original.priorityName),
				)}
			>
				{row.original.priorityName ?? "None"}
			</span>
		),
	},
	{
		accessorKey: "statusName",
		size: 130,
		header: "Trạng thái",
		cell: ({ row }) => (
			<span
				className={cn(
					"inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
					statusClassName(row.original.statusName),
				)}
			>
				{row.original.statusName ?? "None"}
			</span>
		),
	},
	{
		accessorKey: "assignees",
		size: 190,
		header: "Người phụ trách",
		cell: ({ row }) => {
			const assignees = row.original.assignees ?? [];

			if (!assignees.length) {
				return (
					<span className='text-sm text-muted-foreground'>
						Chưa giao
					</span>
				);
			}

			return (
				<div className='flex items-center gap-2'>
					<div className='flex -space-x-2'>
						{assignees.slice(0, 3).map((assignee) => {
							const name = getAssigneeName(assignee);

							return (
								<div
									key={assignee.userId}
									className='flex size-7 items-center justify-center rounded-full border border-[#171717] bg-muted text-[11px] font-semibold text-muted-foreground'
									title={name}
								>
									{getInitials(name)}
								</div>
							);
						})}
					</div>

					<span className='max-w-28 truncate text-sm'>
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
		header: "Ước tính",
		cell: ({ row }) => (
			<span className='font-medium'>
				{formatEstimate(row.original.estimateMinutes)}
			</span>
		),
	},
	{
		accessorKey: "dueAt",
		size: 110,
		header: "Hạn",
		cell: ({ row }) => (
			<span className='text-sm text-muted-foreground'>
				{formatDate(row.original.dueAt)}
			</span>
		),
	},
	{
		id: "actions",
		size: 44,
		header: "",
		cell: () => (
			<button className='rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground'>
				<MoreHorizontal size={16} />
			</button>
		),
		enableSorting: false,
		enableHiding: false,
	},
];
