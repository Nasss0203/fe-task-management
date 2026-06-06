"use client";

import PanigationTable from "@/components/panigation/PanigationTable";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
	PlanTypeWorkspace,
	WorkspaceItem,
} from "@/services/admin/workspace/type";
import type { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
	CalendarDays,
	Clock3,
	Ellipsis,
	Eye,
	RefreshCcw,
	ShieldCheck,
} from "lucide-react";

type Props = {
	workspaces: WorkspaceItem[];
	pagination: PaginationState;
	pageCount: number;
	totalRows: number;
	onPaginationChange: OnChangeFn<PaginationState>;
	onView: (workspace: WorkspaceItem) => void;
	onChangePlan: (workspaceId: string, plan: PlanTypeWorkspace) => void;
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
		return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
	}

	return "border-amber-500/20 bg-amber-500/10 text-amber-400";
};

const getWorkspaceStatusLabel = (status: WorkspaceItem["status"]) => {
	if (status === "ACTIVE") return "Đang hoạt động";
	return "Đã xóa mềm";
};

const getWorkspacePlanClass = (plan: WorkspaceItem["plan"]) => {
	if (plan === "pro") {
		return "border-sky-500/20 bg-sky-500/10 text-sky-400";
	}

	return "border-white/10 bg-white/5 text-neutral-300";
};

const getWorkspacePlanLabel = (plan: WorkspaceItem["plan"]) => {
	if (plan === "pro") return "Pro";
	return "Free";
};

export function WorkspaceManagementTable({
	workspaces,
	pagination,
	pageCount,
	totalRows,
	onPaginationChange,
	onView,
	onChangePlan,
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

	if (!workspaces.length) {
		return (
			<div className='rounded-2xl border border-white/10 bg-[#0b0b0b] p-10 text-center'>
				<p className='text-sm text-neutral-400'>
					Không tìm thấy workspace phù hợp.
				</p>
			</div>
		);
	}

	return (
		<div className='overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]'>
			<div className='flex flex-col gap-1 border-b border-white/10 px-4 py-4 sm:px-5'>
				<h2 className='text-sm font-semibold text-white'>
					Danh sách workspace
				</h2>
				<p className='text-xs text-neutral-500'>
					{totalRows} workspace theo bộ lọc hiện tại
				</p>
			</div>

			<div className='overflow-x-auto'>
				<table className='w-full min-w-[1180px] border-collapse'>
					<thead className='sticky top-0 z-10 bg-[#0b0b0b]'>
						<tr className='border-b border-white/10 text-left text-xs uppercase tracking-[0.12em] text-neutral-500'>
							<th className='px-5 py-3 font-medium'>Workspace</th>
							<th className='px-4 py-3 font-medium'>Owner</th>
							<th className='px-4 py-3 font-medium'>Gói</th>
							<th className='px-4 py-3 font-medium'>Trạng thái</th>
							<th className='px-4 py-3 font-medium'>Thống kê</th>
							<th className='px-4 py-3 font-medium'>Ngày tạo</th>
							<th className='px-4 py-3 font-medium'>Cập nhật</th>
							<th className='px-5 py-3 text-right font-medium'>
								Actions
							</th>
						</tr>
					</thead>

					<tbody className='divide-y divide-white/5'>
						{table.getRowModel().rows.map((row) => {
							const workspace = row.original;
							const nextPlan: PlanTypeWorkspace =
								workspace.plan === "pro" ? "free" : "pro";

							return (
								<tr
									key={workspace.id}
									className='text-sm text-neutral-200 transition hover:bg-white/[0.03]'
								>
									<td className='px-5 py-4'>
										<div className='flex items-center gap-3'>
											<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#171717] text-sm font-semibold text-white'>
												{getInitials(workspace.name)}
											</div>

											<div className='min-w-0 space-y-0.5'>
												<p className='truncate font-medium text-white'>
													{workspace.name}
												</p>
												<p className='truncate text-xs text-neutral-500'>
													/{workspace.slug}
												</p>
											</div>
										</div>
									</td>

									<td className='px-4 py-4'>
										<div className='space-y-0.5'>
											<p className='font-medium text-white'>
												{workspace.ownerName ??
													"Chưa có owner"}
											</p>
											<p className='text-xs text-neutral-500'>
												{workspace.ownerEmail ?? "-"}
											</p>
										</div>
									</td>

									<td className='px-4 py-4'>
										<span
											className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getWorkspacePlanClass(
												workspace.plan,
											)}`}
										>
											{getWorkspacePlanLabel(
												workspace.plan,
											)}
										</span>
									</td>

									<td className='px-4 py-4'>
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

									<td className='px-4 py-4'>
										<div className='grid grid-cols-2 gap-1.5 text-xs text-neutral-400'>
											<span>{workspace.membersCount} member</span>
											<span>{workspace.projectsCount} project</span>
											<span>{workspace.boardsCount} board</span>
											<span>{workspace.tasksCount} task</span>
										</div>
									</td>

									<td className='px-4 py-4 text-neutral-300'>
										<div className='inline-flex items-center gap-2'>
											<CalendarDays className='h-4 w-4 text-neutral-500' />
											{formatDate(workspace.createdAt)}
										</div>
									</td>

									<td className='px-4 py-4 text-neutral-300'>
										<div className='inline-flex items-center gap-2'>
											<Clock3 className='h-4 w-4 text-neutral-500' />
											{formatDateTime(
												workspace.updatedAt,
											)}
										</div>
									</td>

									<td className='px-5 py-4'>
										<div className='flex justify-end'>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<button className='inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#171717] text-neutral-300 transition hover:bg-white/5 hover:text-white'>
														<Ellipsis className='h-4 w-4' />
													</button>
												</DropdownMenuTrigger>

												<DropdownMenuContent
													align='end'
													className='w-60 rounded-2xl border border-white/10 bg-[#0f0f0f] p-2 text-white'
												>
													<DropdownMenuItem
														onClick={() =>
															onView(workspace)
														}
														className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
													>
														<Eye className='mr-2 h-4 w-4' />
														Xem chi tiết
													</DropdownMenuItem>

													{workspace.status !==
														"DELETED" && (
														<>
															<DropdownMenuSeparator className='my-1 bg-white/10' />

															<DropdownMenuItem
																onClick={() =>
																	onChangePlan(
																		workspace.id,
																		nextPlan,
																	)
																}
																className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
															>
																<ShieldCheck className='mr-2 h-4 w-4' />
																{workspace.plan ===
																"pro"
																	? "Chuyển về Free"
																	: "Nâng lên Pro"}
															</DropdownMenuItem>
														</>
													)}

													{workspace.status ===
														"DELETED" && (
														<>
															<DropdownMenuSeparator className='my-1 bg-white/10' />

															<DropdownMenuItem
																disabled
																className='cursor-not-allowed rounded-xl px-3 py-2 text-sm opacity-50'
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
						})}
					</tbody>
				</table>
			</div>

			<PanigationTable
				table={table}
				totalRows={totalRows}
				itemLabel='workspace'
			/>
		</div>
	);
}
