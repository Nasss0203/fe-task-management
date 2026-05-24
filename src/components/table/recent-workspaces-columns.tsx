"use client";

import { WorkspaceItem } from "@/services/admin/dashboard/type";
import type { ColumnDef } from "@tanstack/react-table";

const formatDate = (value?: string) => {
	if (!value) return "-";

	return new Date(value).toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
};

export const recentWorkspacesColumns: ColumnDef<WorkspaceItem>[] = [
	{
		accessorKey: "name",
		header: "Workspace",
		cell: ({ row }) => (
			<div>
				<div className='font-medium text-white'>
					{row.original.name}
				</div>
				<div className='mt-1 max-w-75 truncate text-xs text-neutral-500'>
					{row.original.slug}
				</div>
			</div>
		),
	},
	{
		accessorKey: "owner",
		header: "Owner",
		cell: ({ row }) => (
			<span className='text-neutral-400'>
				{row.original.owner ?? "-"}
			</span>
		),
	},
	{
		accessorKey: "membersCount",
		header: "Members",
		cell: ({ row }) => (
			<span className='text-neutral-200'>
				{row.original.membersCount}
			</span>
		),
	},
	{
		accessorKey: "projectsCount",
		header: "Projects",
		cell: ({ row }) => (
			<span className='text-neutral-200'>
				{row.original.projectsCount}
			</span>
		),
	},
	{
		accessorKey: "tasksCount",
		header: "Tasks",
		cell: ({ row }) => (
			<span className='text-neutral-200'>{row.original.tasksCount}</span>
		),
	},
	{
		accessorKey: "plan",
		header: "Plan",
		cell: ({ row }) => (
			<span className='rounded-full border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-xs font-medium uppercase text-neutral-200'>
				{row.original.plan}
			</span>
		),
	},
	{
		accessorKey: "createdAt",
		header: "Created",
		cell: ({ row }) => (
			<span className='text-neutral-400'>
				{formatDate(row.original.createdAt)}
			</span>
		),
	},
];
