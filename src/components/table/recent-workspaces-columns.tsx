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
				<div className='font-medium text-[#0F172A]'>
					{row.original.name}
				</div>
				<div className='mt-1 max-w-75 truncate text-xs text-muted-foreground'>
					{row.original.slug}
				</div>
			</div>
		),
	},
	{
		accessorKey: "owner",
		header: "Owner",
		cell: ({ row }) => {
			const ownerName = row.original.ownerName ?? row.original.owner;
			const ownerEmail = row.original.ownerEmail;

			if (!ownerName && !ownerEmail) {
				return <span className='text-neutral-500'>Chưa có owner</span>;
			}

			return (
				<div className='space-y-1'>
					<p className='font-medium text-[#0F172A]'>
						{ownerName ?? "Chưa có owner"}
					</p>
					{ownerEmail && (
						<p className='text-xs text-[#64748B]'>
							{ownerEmail}
						</p>
					)}
				</div>
			);
		},

	},
	{
		accessorKey: "membersCount",
		header: "Thành viên",
		cell: ({ row }) => (
			<span className='text-foreground'>
				{row.original.membersCount}
			</span>
		),
	},
	{
		accessorKey: "projectsCount",
		header: "Project",
		cell: ({ row }) => (
			<span className='text-foreground'>
				{row.original.projectsCount}
			</span>
		),
	},
	{
		accessorKey: "tasksCount",
		header: "Task",
		cell: ({ row }) => (
			<span className='text-foreground'>{row.original.tasksCount}</span>
		),
	},
	{
		accessorKey: "plan",
		header: "Gói",
		cell: ({ row }) => (
			<span className='rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium uppercase text-foreground'>
				{row.original.plan}
			</span>
		),
	},
	{
		accessorKey: "createdAt",
		header: "Ngày tạo",
		cell: ({ row }) => (
			<span className='text-muted-foreground'>
				{formatDate(row.original.createdAt)}
			</span>
		),
	},
];
