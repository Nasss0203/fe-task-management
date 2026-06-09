"use client";
import { useMember } from "@/features/member/hooks/useMember";
import {
	useTask,
	useTaskPriority,
	useTaskStatus,
} from "@/features/task/hooks/useTask";
import { useDebounced } from "@/hooks/useDebounce";
import type { TaskItem } from "@/services/task/type";
import {
	getCoreRowModel,
	getSortedRowModel,
	PaginationState,
	useReactTable,
} from "@tanstack/react-table";
import { Filter, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import PanigationTable from "../panigation/PanigationTable";
import BacklogTable from "../table/BacklogTable";
import { columnsBacklog } from "../table/columns/column-backlog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

const ALL_FILTER_VALUE = "all";

type BacklogSprintProps = {
	workspaceId: string;
	projectId: string;
};

type WorkspaceMemberItem = {
	user_id: string;
	full_name: string;
	email?: string;
	avatar_url?: string | null;
};

const getAssigneeName = (assignee: TaskItem["assignees"][number]) => {
	return (
		assignee.fullName?.trim() || assignee.username?.trim() || "Chưa đặt tên"
	);
};

const BacklogSprint = ({ projectId, workspaceId }: BacklogSprintProps) => {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounced(search, 400);
	const [statusFilter, setStatusFilter] = useState(ALL_FILTER_VALUE);
	const [priorityFilter, setPriorityFilter] = useState(ALL_FILTER_VALUE);
	const [assigneeFilter, setAssigneeFilter] = useState(ALL_FILTER_VALUE);

	const backlogFilters = useMemo(
		() => ({
			...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
			...(statusFilter !== ALL_FILTER_VALUE && {
				statusId: statusFilter,
			}),
			...(priorityFilter !== ALL_FILTER_VALUE && {
				priorityId: priorityFilter,
			}),
			...(assigneeFilter !== ALL_FILTER_VALUE && {
				assigneeId: assigneeFilter,
			}),
			page: pagination.pageIndex + 1,
			pageSize: pagination.pageSize,
		}),
		[
			debouncedSearch,
			statusFilter,
			priorityFilter,
			assigneeFilter,
			pagination.pageIndex,
			pagination.pageSize,
		],
	);
	const { findTaskBacklog } = useTask(workspaceId, projectId, backlogFilters);
	const { findAllMember } = useMember({ workspaceId });
	const { data: taskStatusData } = useTaskStatus(workspaceId, projectId);
	const { data: taskPriorityData } = useTaskPriority(workspaceId, projectId);
	const taskBacklog = useMemo(() => {
		const backlogData = findTaskBacklog.data?.data;
		return Array.isArray(backlogData) ? backlogData : [];
	}, [findTaskBacklog.data?.data]);
	const totalPages = findTaskBacklog.data?.totalPages ?? 1;

	const resetPage = () => {
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	};

	const updateSearch = (value: string) => {
		setSearch(value);
		resetPage();
	};

	const updateStatusFilter = (value: string) => {
		setStatusFilter(value);
		resetPage();
	};

	const updatePriorityFilter = (value: string) => {
		setPriorityFilter(value);
		resetPage();
	};

	const updateAssigneeFilter = (value: string) => {
		setAssigneeFilter(value);
		resetPage();
	};

	const statusOptions = useMemo(
		() =>
			(taskStatusData?.data ?? []).map((status) => ({
				value: status.id,
				label: status.name,
			})),
		[taskStatusData?.data],
	);

	const priorityOptions = useMemo(
		() =>
			(taskPriorityData?.data ?? []).map((priority) => ({
				value: priority.id,
				label: priority.name,
			})),
		[taskPriorityData?.data],
	);

	const assigneeOptions = useMemo(() => {
		const members = (findAllMember.data?.data ??
			[]) as WorkspaceMemberItem[];
		const memberOptions = members.map((member) => ({
			value: member.user_id,
			label: member.full_name || member.email || "Chưa đặt tên",
		}));
		const backlogAssigneeOptions = taskBacklog?.flatMap((task) =>
			(task.assignees ?? []).map((assignee) => ({
				value: assignee.userId,
				label: getAssigneeName(assignee),
			})),
		);

		return Array.from(
			new Map(
				[...memberOptions, ...backlogAssigneeOptions].map(
					(assignee) => [assignee.value, assignee] as const,
				),
			).values(),
		).sort((a, b) => a.label.localeCompare(b.label));
	}, [findAllMember.data?.data, taskBacklog]);

	const activeFilters = [
		search.trim()
			? {
					label: `Tìm: ${search.trim()}`,
					onRemove: () => updateSearch(""),
				}
			: null,
		statusFilter !== ALL_FILTER_VALUE
			? {
					label: `Trạng thái: ${
						statusOptions.find(
							(option) => option.value === statusFilter,
						)?.label ?? statusFilter
					}`,
					onRemove: () => updateStatusFilter(ALL_FILTER_VALUE),
				}
			: null,
		priorityFilter !== ALL_FILTER_VALUE
			? {
					label: `Ưu tiên: ${
						priorityOptions.find(
							(option) => option.value === priorityFilter,
						)?.label ?? priorityFilter
					}`,
					onRemove: () => updatePriorityFilter(ALL_FILTER_VALUE),
				}
			: null,
		assigneeFilter !== ALL_FILTER_VALUE
			? {
					label: `Phụ trách: ${
						assigneeOptions.find(
							(option) => option.value === assigneeFilter,
						)?.label ?? assigneeFilter
					}`,
					onRemove: () => updateAssigneeFilter(ALL_FILTER_VALUE),
				}
			: null,
	].filter(Boolean) as Array<{ label: string; onRemove: () => void }>;

	const resetFilters = () => {
		updateSearch("");
		setStatusFilter(ALL_FILTER_VALUE);
		setPriorityFilter(ALL_FILTER_VALUE);
		setAssigneeFilter(ALL_FILTER_VALUE);
		resetPage();
	};

	const table = useReactTable({
		data: taskBacklog,
		columns: columnsBacklog,
		getRowId: (row) => row.id,
		manualPagination: true,
		pageCount: Math.max(totalPages, 1),
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onPaginationChange: setPagination,
		state: {
			pagination,
		},
	});

	return (
		<section className='flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#171717] shadow-sm'>
			<div className='shrink-0 border-b border-[#2a2a2a] p-4'>
				<div className='flex items-start justify-between gap-3'>
					<div className='min-w-0'>
						<h3 className='text-base font-bold text-white'>
							Backlog
						</h3>
						<p className='mt-1 text-xs font-medium text-slate-400'>
							Chọn công việc để thêm vào sprint
						</p>
					</div>

					<Button className='h-9 shrink-0 bg-blue-600 text-white hover:bg-blue-500'>
						<Plus size={15} />
						Thêm công việc
					</Button>
				</div>

				<div className='mt-4 flex flex-col gap-3'>
					<div className='flex flex-wrap items-center gap-2'>
						<div className='relative min-w-[220px] flex-1'>
							<Search
								size={15}
								className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500'
							/>
							<Input
								value={search}
								onChange={(e) => updateSearch(e.target.value)}
								placeholder='Tìm theo ID hoặc tên công việc'
								className='h-9 border-[#333333] bg-[#101010] pl-9 text-sm text-slate-100 placeholder:text-slate-500'
							/>
						</div>

						<div className='flex flex-wrap items-center gap-2'>
							<div className='w-[140px] shrink-0'>
								<FilterSelect
									value={statusFilter}
									onChange={updateStatusFilter}
									placeholder='Trạng thái'
									options={statusOptions}
								/>
							</div>
							<div className='w-[140px] shrink-0'>
								<FilterSelect
									value={priorityFilter}
									onChange={updatePriorityFilter}
									placeholder='Ưu tiên'
									options={priorityOptions}
								/>
							</div>
							<div className='w-[160px] shrink-0'>
								<FilterSelect
									value={assigneeFilter}
									onChange={updateAssigneeFilter}
									placeholder='Người phụ trách'
									options={assigneeOptions}
								/>
							</div>
							<Button
								variant='outline'
								size='icon'
								className='relative h-9 w-10 shrink-0 border-[#333333] bg-[#101010] text-slate-300 hover:bg-[#202020] hover:text-white'
								title='Bộ lọc'
							>
								<Filter size={15} />
								{activeFilters.length > 0 && (
									<span className='absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white'>
										{activeFilters.length}
									</span>
								)}
							</Button>
						</div>
					</div>

					{activeFilters.length > 0 && (
						<div className='flex flex-wrap items-center gap-2'>
							{activeFilters.map((filter) => (
								<button
									key={filter.label}
									type='button'
									onClick={filter.onRemove}
									className='inline-flex h-7 items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-2.5 text-xs font-semibold text-blue-200 transition hover:border-blue-400/40 hover:bg-blue-500/15'
								>
									{filter.label}
									<X size={12} />
								</button>
							))}

							<Button
								type='button'
								variant='ghost'
								size='xs'
								className='text-xs text-slate-400 hover:text-white'
								onClick={resetFilters}
							>
								Xóa lọc
							</Button>
						</div>
					)}
				</div>
			</div>

			<BacklogTable
				table={table}
				emptyText={
					findTaskBacklog.isLoading
						? "Đang tải backlog..."
						: "Không có công việc trong backlog."
				}
				className='h-full rounded-none border-0'
			/>

			<PanigationTable table={table} />
		</section>
	);
};

export default BacklogSprint;

function FilterSelect({
	value,
	onChange,
	placeholder,
	options,
}: {
	value: string;
	onChange: (value: string) => void;
	placeholder: string;
	options: readonly (string | { value: string; label: string })[];
}) {
	return (
		<Select value={value} onValueChange={onChange}>
			<SelectTrigger className='h-9 w-full min-w-0 border-[#333333] bg-[#101010] text-sm font-medium text-slate-200 shadow-none hover:bg-[#1d1d1d] focus:ring-blue-500/20'>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>

			<SelectContent
				position='popper'
				className='border-[#333333] bg-[#101010] text-slate-100'
			>
				<SelectItem value={ALL_FILTER_VALUE}>{placeholder}</SelectItem>
				{options.map((option) => {
					const optionValue =
						typeof option === "string" ? option : option.value;
					const label =
						typeof option === "string" ? option : option.label;

					return (
						<SelectItem key={optionValue} value={optionValue}>
							{label}
						</SelectItem>
					);
				})}
			</SelectContent>
		</Select>
	);
}
