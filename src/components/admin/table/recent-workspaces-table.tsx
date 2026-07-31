"use client";

import PanigationTable from "@/components/panigation/PanigationTable";
import { DataTable } from "@/components/table/data-table";
import { recentWorkspacesColumns } from "@/components/table/recent-workspaces-columns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
	AdminFindAllWorkspaceQuery,
	PlanTypeWorkspace,
	WorkspaceItem,
} from "@/services/admin/dashboard/type";
import type { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
	CalendarDays,
	RotateCcw,
	Search,
	SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";
import {
	adminActionButtonClass,
	adminFieldLabelClass,
} from "../shared/theme";

type Props = {
	items: WorkspaceItem[];
	query: AdminFindAllWorkspaceQuery;
	pagination: PaginationState;
	pageCount: number;
	totalRows: number;
	onPaginationChange: OnChangeFn<PaginationState>;
	onQueryChange: (query: AdminFindAllWorkspaceQuery) => void;
	isLoading?: boolean;
	skeletonRowCount?: number;
};

const selectClass =
	"h-10 w-full rounded-xl border border-input bg-white px-3 text-sm text-foreground outline-none hover:border-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15";

const formatDate = (date?: Date) => {
	if (!date) return "Tất cả ngày tạo";

	return date.toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
};

const toDateFilter = (date: Date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
};

export function RecentWorkspacesTable({
	items,
	query,
	pagination,
	pageCount,
	totalRows,
	onPaginationChange,
	onQueryChange,
	isLoading = false,
	skeletonRowCount = pagination.pageSize,
}: Props) {
	const [search, setSearch] = useState(query.search ?? "");
	const [plan, setPlan] = useState<PlanTypeWorkspace | "">(query.plan ?? "");
	const [createdAt, setCreatedAt] = useState(query.createdAt ?? "");
	const selectedDate = createdAt
		? new Date(`${createdAt}T00:00:00`)
		: undefined;
	const hasActiveFilter = Boolean(plan || createdAt);
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

	const updateQuery = (
		nextSearch: string,
		nextPlan: PlanTypeWorkspace | "",
		nextCreatedAt: string,
	) => {
		onQueryChange({
			search: nextSearch.trim() || undefined,
			plan: nextPlan || undefined,
			createdAt: nextCreatedAt || undefined,
			page: 1,
			pageSize: pagination.pageSize,
		});
	};

	const handleSearchChange = (value: string) => {
		setSearch(value);
		updateQuery(value, plan, createdAt);
	};

	const handlePlanChange = (value: string) => {
		const nextPlan = value === "all" ? "" : (value as PlanTypeWorkspace);
		setPlan(nextPlan);
		updateQuery(search, nextPlan, createdAt);
	};

	const handleCreatedAtChange = (date?: Date) => {
		const nextCreatedAt = date ? toDateFilter(date) : "";
		setCreatedAt(nextCreatedAt);
		updateQuery(search, plan, nextCreatedAt);
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
			<div className='mb-4 flex flex-col gap-3 lg:flex-row lg:items-center'>
				<div className='shrink-0'>
					<h2 className='text-lg font-semibold text-foreground'>
						Workspace gần đây
					</h2>
					<p className='text-sm text-muted-foreground'>
						Workspace mới tạo hoặc vừa cập nhật.
					</p>
				</div>

				<div className='flex w-full items-center gap-3 lg:max-w-xl'>
				<InputGroup className='h-10 w-full max-w-xl rounded-xl border border-input bg-white text-foreground shadow-sm'>
					<InputGroupInput
						value={search}
						onChange={(event) => handleSearchChange(event.target.value)}
						placeholder='Tìm workspace hoặc slug...'
						className='text-foreground placeholder:text-muted-foreground'
					/>
					<InputGroupAddon>
						<Search className='size-4 text-muted-foreground' />
					</InputGroupAddon>
				</InputGroup>

				<Popover>
					<PopoverTrigger asChild>
						<Button
							type='button'
							variant='outline'
							size='icon'
							aria-label='Mở bộ lọc workspace gần đây'
							className={cn(
								"size-10 rounded-xl border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0F172A]",
								hasActiveFilter &&
									"border-primary/20 bg-primary/10 text-primary",
							)}
						>
							<SlidersHorizontal />
						</Button>
					</PopoverTrigger>

					<PopoverContent
						align='end'
						className='w-[calc(100vw-2rem)] rounded-2xl border border-border bg-white p-4 text-foreground shadow-xl sm:w-[380px]'
					>
						<div className='flex flex-col gap-4'>
							<div>
								<p className='text-sm font-semibold text-foreground'>
									Bộ lọc workspace gần đây
								</p>
								<p className='mt-1 text-xs text-muted-foreground'>
									Lọc theo gói dịch vụ và ngày tạo.
								</p>
							</div>

							<div className='flex flex-col gap-2'>
								<label className={adminFieldLabelClass}>Gói dịch vụ</label>
								<Select value={plan || "all"} onValueChange={handlePlanChange}>
									<SelectTrigger className={selectClass}>
										<SelectValue placeholder='Tất cả gói' />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectItem value='all'>Tất cả gói</SelectItem>
											<SelectItem value='free'>Free</SelectItem>
											<SelectItem value='pro'>Pro</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>

							<div className='flex flex-col gap-2'>
								<label className={adminFieldLabelClass}>Ngày tạo</label>
								<div className='rounded-xl border border-border bg-muted/40 p-2'>
									<div className='mb-2 flex items-center justify-between rounded-lg border border-border bg-white px-3 py-2 text-sm'>
										<div className='flex items-center gap-2 text-foreground'>
											<CalendarDays className='size-4 text-muted-foreground' />
											{formatDate(selectedDate)}
										</div>

										{selectedDate ? (
											<button
												type='button'
												onClick={() => handleCreatedAtChange(undefined)}
												className='text-xs text-muted-foreground hover:text-foreground'
											>
												Xóa
											</button>
										) : null}
									</div>

									<Calendar
										mode='single'
										selected={selectedDate}
										onSelect={handleCreatedAtChange}
										className='w-full rounded-lg border border-border bg-white p-3
											[&_.rdp-months]:w-full
											[&_.rdp-month]:w-full
											[&_.rdp-table]:w-full
											[&_.rdp-caption]:w-full
											[&_.rdp-head_row]:grid
											[&_.rdp-head_row]:grid-cols-7
											[&_.rdp-row]:grid
											[&_.rdp-row]:grid-cols-7
											[&_.rdp-cell]:flex
											[&_.rdp-cell]:justify-center
											[&_.rdp-head_cell]:text-center'
										captionLayout='dropdown'
									/>
								</div>
							</div>

							<Button
								type='button'
								variant='outline'
								onClick={handleResetFilter}
								className={cn("w-full", adminActionButtonClass)}
							>
								<RotateCcw data-icon='inline-start' />
								Đặt lại bộ lọc
							</Button>
						</div>
					</PopoverContent>
				</Popover>
				</div>
			</div>

			<DataTable
				columns={recentWorkspacesColumns}
				data={items}
				isLoading={isLoading}
				skeletonRowCount={skeletonRowCount}
			/>

			<PanigationTable
				table={table}
				totalRows={totalRows}
				itemLabel='workspace'
			/>
		</div>
	);
}
