"use client";

import PanigationTable from "@/components/panigation/PanigationTable";
import { DataTable } from "@/components/table/data-table";
import { recentWorkspacesColumns } from "@/components/table/recent-workspaces-columns";
import type {
	AdminFindAllWorkspaceQuery,
	PlanTypeWorkspace,
	WorkspaceItem,
} from "@/services/admin/dashboard/type";
import type { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Search, X } from "lucide-react";
import { useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";


type Props = {
	items: WorkspaceItem[];
	query: AdminFindAllWorkspaceQuery;
	pagination: PaginationState;
	pageCount: number;
	totalRows: number;
	onPaginationChange: OnChangeFn<PaginationState>;
	onQueryChange: (query: AdminFindAllWorkspaceQuery) => void;
};

export function RecentWorkspacesTable({
	items,
	query,
	pagination,
	pageCount,
	totalRows,
	onPaginationChange,
	onQueryChange,
}: Props) {
	const [search, setSearch] = useState(query.search ?? "");
	const [plan, setPlan] = useState<PlanTypeWorkspace | "">(query.plan ?? "");
	const [createdAt, setCreatedAt] = useState(query.createdAt ?? "");
	const table = useReactTable({
		data: items,
		columns: recentWorkspacesColumns,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		onPaginationChange,
		pageCount,
		state: {
			pagination,
		},
	});

	const handleApplyFilter = () => {
		onQueryChange({
			search: search.trim() || undefined,
			plan: plan || undefined,
			createdAt: createdAt || undefined,
			page: 1,
			pageSize: pagination.pageSize,
		});
	};

	const handleResetFilter = () => {
		setSearch("");
		setPlan("");
		setCreatedAt("");
		onQueryChange({
			page: 1,
			pageSize: pagination.pageSize,
		});
	};

	return (
		<div className='rounded-2xl border border-border bg-white p-5 shadow-sm'>
			<div className='mb-4 flex items-start justify-between gap-4'>
				<div>
					<h2 className='text-lg font-semibold text-[#0F172A]'>
						Workspace gần đây
					</h2>
					<p className='text-sm text-[#64748B]'>
						Workspace mới tạo hoặc vừa cập nhật.
					</p>
				</div>
			</div>

			<div className='mb-4 grid gap-3 md:grid-cols-[1fr_160px_180px_auto_auto]'>
				<div className='flex items-center gap-2 rounded-xl border border-input bg-white px-3'>
					<Search className='h-4 w-4 text-[#64748B]' />
					<input
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder='Tìm workspace hoặc slug...'
						className='h-10 w-full bg-transparent text-sm text-[#1E293B] outline-none placeholder:text-[#94A3B8]'
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								handleApplyFilter();
							}
						}}
					/>
				</div>

				<Select value={plan || "all"} onValueChange={(val) => setPlan(val === "all" ? "" : (val as PlanTypeWorkspace))}>
					<SelectTrigger className="h-10 rounded-xl border border-input bg-white px-3 text-sm text-[#1E293B] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
						<SelectValue placeholder="Tất cả gói" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>Tất cả gói</SelectItem>
						<SelectItem value="free">Free</SelectItem>
						<SelectItem value="pro">Pro</SelectItem>
					</SelectContent>
				</Select>

				<input
					type='date'
					value={createdAt}
					onChange={(event) => setCreatedAt(event.target.value)}
					className='h-10 rounded-xl border border-input bg-white px-3 text-sm text-[#1E293B] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'
				/>

				<button
					type='button'
					onClick={handleApplyFilter}
					className='h-10 rounded-xl bg-[#2563EB] px-4 text-sm font-medium text-white hover:bg-[#1D4ED8]'
				>
					Lọc
				</button>

				<button
					type='button'
					onClick={handleResetFilter}
					className='flex h-10 items-center justify-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-4 text-sm text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
				>
					<X className='h-4 w-4' />
					Đặt lại
				</button>
			</div>

			<DataTable columns={recentWorkspacesColumns} data={items} />

			<PanigationTable
				table={table}
				totalRows={totalRows}
				itemLabel='workspace'
			/>
		</div>
	);
}
