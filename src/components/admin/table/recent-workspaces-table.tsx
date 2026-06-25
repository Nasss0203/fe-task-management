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
		<div className='rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5'>
			<div className='mb-4 flex items-start justify-between gap-4'>
				<div>
					<h2 className='text-lg font-semibold text-white'>
						Workspace gần đây
					</h2>
					<p className='text-sm text-neutral-400'>
						Workspace mới tạo hoặc vừa cập nhật.
					</p>
				</div>
			</div>

			<div className='mb-4 grid gap-3 md:grid-cols-[1fr_160px_180px_auto_auto]'>
				<div className='flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/70 px-3'>
					<Search className='h-4 w-4 text-neutral-500' />
					<input
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder='Tìm workspace hoặc slug...'
						className='h-10 w-full bg-transparent text-sm text-white outline-none placeholder:text-neutral-500'
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								handleApplyFilter();
							}
						}}
					/>
				</div>

				<Select value={plan || "all"} onValueChange={(val) => setPlan(val === "all" ? "" : (val as PlanTypeWorkspace))}>
					<SelectTrigger className="h-10 rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 text-sm text-white outline-none">
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
					className='h-10 rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 text-sm text-white outline-none'
				/>

				<button
					type='button'
					onClick={handleApplyFilter}
					className='h-10 rounded-xl bg-white px-4 text-sm font-medium text-black hover:bg-neutral-200'
				>
					Lọc
				</button>

				<button
					type='button'
					onClick={handleResetFilter}
					className='flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-800 px-4 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-white'
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
