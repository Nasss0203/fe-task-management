"use client";

import PanigationTable from "@/components/panigation/PanigationTable";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { WorkspaceItem } from "@/services/admin/workspace/type";
import type { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
	CalendarDays,
	Clock3,
	Ellipsis,
	Eye,
	RefreshCcw,
} from "lucide-react";
import type { ReactNode } from "react";
import {
	adminMenuContentClass,
	adminMenuItemClass,
	adminMenuSeparatorClass,
} from "../shared/theme";

type Props = {
	workspaces: WorkspaceItem[];
	pagination: PaginationState;
	pageCount: number;
	totalRows: number;
	onPaginationChange: OnChangeFn<PaginationState>;
	onView: (workspace: WorkspaceItem) => void;
	toolbar?: ReactNode;
	isLoading?: boolean;
	skeletonRowCount?: number;
};

const getInitials = (name: string) => {
	const initials = name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((word) => word[0]?.toUpperCase())
		.join("");

	return initials || "W";
};

const formatDate = (value?: string | null) => {
	if (!value) return "Chưa có dữ liệu";

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return "Không hợp lệ";
	}

	return date.toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
};

const formatDateTime = (value?: string | null) => {
	if (!value) return "Chưa có dữ liệu";

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return "Không hợp lệ";
	}

	return date.toLocaleString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

const getWorkspaceStatusClass = (status: WorkspaceItem["status"]) => {
	if (status === "ACTIVE") {
		return "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]";
	}

	return "border-[#FDE68A] bg-[#FFFBEB] text-[#A16207]";
};

const getWorkspaceStatusLabel = (status: WorkspaceItem["status"]) => {
	if (status === "ACTIVE") return "Đang hoạt động";
	return "Đã xóa mềm";
};

function WorkspaceTableSkeletonRows({ rowCount }: { rowCount: number }) {
	return (
		<>
			{Array.from({ length: rowCount }).map((_, index) => (
				<tr
					key={`workspace-table-skeleton-${index}`}
					className='text-sm text-[#1E293B]'
				>
					<td className='px-5 py-2 whitespace-nowrap'>
						<div className='flex items-center gap-3'>
							<Skeleton className='h-8 w-8 rounded-full' />
							<Skeleton className='h-4 w-36' />
						</div>
					</td>
					<td className='px-4 py-2 whitespace-nowrap'>
						<div className='space-y-2'>
							<Skeleton className='h-4 w-32' />
							<Skeleton className='h-3 w-40' />
						</div>
					</td>
					<td className='px-4 py-2 whitespace-nowrap'>
						<Skeleton className='h-7 w-32 rounded-full' />
					</td>
					<td className='px-4 py-2 whitespace-nowrap'>
						<div className='inline-flex items-center gap-2'>
							<Skeleton className='h-4 w-4 rounded-full' />
							<Skeleton className='h-4 w-24' />
						</div>
					</td>
					<td className='px-4 py-2 whitespace-nowrap'>
						<div className='inline-flex items-center gap-2'>
							<Skeleton className='h-4 w-4 rounded-full' />
							<Skeleton className='h-4 w-32' />
						</div>
					</td>
					<td className='px-5 py-2 whitespace-nowrap'>
						<div className='flex justify-end'>
							<Skeleton className='h-8 w-8 rounded-xl' />
						</div>
					</td>
				</tr>
			))}
		</>
	);
}

export function WorkspaceManagementTable({
	workspaces,
	pagination,
	pageCount,
	totalRows,
	onPaginationChange,
	onView,
	toolbar,
	isLoading = false,
	skeletonRowCount = pagination.pageSize,
}: Props) {
	const table = useReactTable({
		data: workspaces,
		columns: [],
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		onPaginationChange,
		pageCount,
		state: {
			pagination,
		},
	});

	return (
		<div className='overflow-hidden rounded-2xl border border-border bg-white shadow-sm'>
			<div className='flex flex-col gap-3 border-b border-border px-4 py-4 sm:px-5 lg:flex-row lg:items-center'>
				<div className='shrink-0'>
					<h2 className='text-sm font-semibold text-[#0F172A]'>
						Danh sách workspace
					</h2>
					<p className='text-xs text-[#64748B]'>
						{totalRows} workspace theo bộ lọc hiện tại
					</p>
				</div>
				{toolbar ? <div className='w-full lg:max-w-xl'>{toolbar}</div> : null}
			</div>

			{isLoading || workspaces.length ? (
				<>
				<div className='overflow-x-auto px-4 sm:px-5'>
				<table className='w-full min-w-[820px] border-collapse'>
					<thead className='sticky top-0 z-10 bg-[#F8FAFC]'>
						<tr className='border-b border-border text-left text-xs uppercase tracking-[0.12em] text-[#475569]'>
							<th className='px-5 py-3 font-medium whitespace-nowrap'>Workspace</th>
							<th className='px-4 py-3 font-medium whitespace-nowrap'>Owner</th>
							<th className='px-4 py-3 font-medium whitespace-nowrap'>Trạng thái</th>
							<th className='px-4 py-3 font-medium whitespace-nowrap'>Ngày tạo</th>
							<th className='px-4 py-3 font-medium whitespace-nowrap'>Cập nhật</th>
							<th className='px-5 py-3 text-right font-medium whitespace-nowrap'>
								Actions
							</th>
						</tr>
					</thead>

					<tbody className='divide-y divide-[#EEF2F6]'>
						{isLoading ? (
							<WorkspaceTableSkeletonRows rowCount={skeletonRowCount} />
						) : (
							table.getRowModel().rows.map((row) => {
							const workspace = row.original;

							return (
								<tr
									key={workspace.id}
									className='text-sm text-[#1E293B] transition hover:bg-[#F8FAFC]'
								>
									<td className='px-5 py-2 whitespace-nowrap'>
										<div className='flex items-center gap-3'>
											<div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#BFDBFE] bg-[#EFF6FF] text-xs font-semibold text-[#2563EB]'>
												{getInitials(workspace.name)}
											</div>

											<div className='min-w-0 flex-1'>
												<p className='truncate font-medium text-[#0F172A] text-xs sm:text-sm max-w-[140px]' title={workspace.name}>
													{workspace.name}
												</p>
											</div>
										</div>
									</td>

									<td className='px-4 py-2 whitespace-nowrap'>
										<div className='space-y-0.5 min-w-0 max-w-[160px]'>
											<p className='font-medium text-[#0F172A] text-xs sm:text-sm truncate' title={workspace.ownerName ?? ""}>
												{workspace.ownerName ??
													"Chưa có owner"}
											</p>
											<p className='text-xs text-[#64748B] truncate' title={workspace.ownerEmail ?? ""}>
												{workspace.ownerEmail ?? "-"}
											</p>
										</div>
									</td>

									<td className='px-4 py-2 whitespace-nowrap'>
										<span
											className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getWorkspaceStatusClass(
												workspace.status,
											)}`}
										>
											{getWorkspaceStatusLabel(
												workspace.status,
											)}
										</span>
									</td>

									<td className='px-4 py-2 text-[#334155] text-xs sm:text-sm whitespace-nowrap'>
										<div className='inline-flex items-center gap-2'>
											<CalendarDays className='h-4 w-4 text-[#64748B]' />
											{formatDate(workspace.createdAt)}
										</div>
									</td>

									<td className='px-4 py-2 text-[#334155] text-xs sm:text-sm whitespace-nowrap'>
										<div className='inline-flex items-center gap-2'>
											<Clock3 className='h-4 w-4 text-[#64748B]' />
											{formatDateTime(
												workspace.updatedAt,
											)}
										</div>
									</td>

									<td className='px-5 py-2 whitespace-nowrap'>
										<div className='flex justify-end'>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<button className='inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#CBD5E1] bg-white text-[#475569] transition hover:bg-[#F8FAFC] hover:text-[#0F172A]'>
														<Ellipsis className='h-4 w-4' />
													</button>
												</DropdownMenuTrigger>

												<DropdownMenuContent
													align='end'
													className={`w-60 ${adminMenuContentClass}`}
												>
													<DropdownMenuItem
														onClick={() =>
															onView(workspace)
														}
														className={adminMenuItemClass}
													>
														<Eye className='mr-2 h-4 w-4' />
														Xem chi tiết
													</DropdownMenuItem>

													{workspace.status ===
														"DELETED" && (
														<>
															<DropdownMenuSeparator
																className={adminMenuSeparatorClass}
															/>

															<DropdownMenuItem
																disabled
																className={`${adminMenuItemClass} cursor-not-allowed opacity-50`}
															>
																<RefreshCcw className='mr-2 h-4 w-4' />
																Chưa có API restore
															</DropdownMenuItem>
														</>
													)}
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
									</td>
								</tr>
							);
						})
						)}
					</tbody>
				</table>
				</div>

				<div className='px-4 sm:px-5'>
					<PanigationTable
						table={table}
						totalRows={totalRows}
						itemLabel='workspace'
					/>
				</div>
				</>
			) : (
				<div className='p-10 text-center'>
					<p className='text-sm text-[#64748B]'>
						Không tìm thấy workspace phù hợp.
					</p>
				</div>
			)}
		</div>
	);
}
