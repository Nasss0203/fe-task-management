"use client";

import PanigationTable from "@/components/panigation/PanigationTable";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminUser } from "@/services/admin/user/type";
import type { OnChangeFn, PaginationState } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
	Clock3,
	Crown,
	Ellipsis,
	Eye,
	Lock,
	RotateCcw,
	ShieldCheck,
	ShieldOff,
	Unlock,
} from "lucide-react";
import {
	formatDate,
	formatRelativeTime,
	getInitials,
	getStatusClass,
	getStatusLabel,
	getSystemRoleClass,
	getSystemRoleLabel,
} from "../shared/users.utils";

type Props = {
	users: AdminUser[];
	pagination: PaginationState;
	pageCount: number;
	totalRows: number;
	onPaginationChange: OnChangeFn<PaginationState>;
	onView: (user: AdminUser) => void;
	onToggleLock: (userId: string) => void;
	onResetStatus: (userId: string) => void;
	onChangePlan: (user: AdminUser) => void;
	isChangingStatus?: boolean;
	isChangingPlan?: boolean;
	canGrantPro?: boolean;
};

export function UserTable({
	users,
	pagination,
	pageCount,
	totalRows,
	onPaginationChange,
	onView,
	onToggleLock,
	onResetStatus,
	onChangePlan,
	isChangingStatus = false,
	isChangingPlan = false,
	canGrantPro = true,
}: Props) {
	const table = useReactTable({
		data: users,
		columns: [],
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		onPaginationChange,
		pageCount,
		state: {
			pagination,
		},
	});

	if (!users.length) {
		return (
			<div className='rounded-3xl border border-border bg-white p-10 text-center'>
				<p className='text-sm text-[#64748B]'>
					Không tìm thấy người dùng phù hợp.
				</p>
			</div>
		);
	}

	return (
		<>
			<div className='overflow-x-auto'>
				<table className='w-full min-w-280 border-separate border-spacing-y-3'>
					<thead>
						<tr className='text-left text-sm text-[#475569]'>
							<th className='px-4 py-2 font-medium'>User</th>
							<th className='px-4 py-2 font-medium'>Email</th>
							<th className='px-4 py-2 font-medium'>
								Trạng thái
							</th>
							<th className='w-40 px-4 py-2 font-medium'>
								Vai trò hệ thống
							</th>
							<th className='w-28 px-4 py-2 text-center font-medium'>Gói</th>
							<th className='w-40 px-4 py-2 font-medium'>Ngày tạo</th>
							<th className='px-4 py-2 font-medium'>
								Hoạt động gần nhất
							</th>
							<th className='px-4 py-2 font-medium text-right'>
								Actions
							</th>
						</tr>
					</thead>

					<tbody>
						{table.getRowModel().rows.map((row) => {
							const user = row.original;
							const isSuperAdmin =
								user.systemRole === "SUPER_ADMIN";
							const isSystemAdmin =
								user.systemRole === "SYSTEM_ADMIN";

							return (
								<tr
									key={user.id}
									className='text-sm text-[#1E293B]'
								>
									<td className='rounded-l-3xl border-y border-l border-[#EEF2F6] bg-white px-4 py-4'>
										<div className='flex items-center gap-3'>
											{user.avatarUrl ? (
												<img
													src={user.avatarUrl}
													alt={user.fullName}
													className='h-11 w-11 rounded-full border border-border object-cover'
												/>
											) : (
												<div className='flex h-11 w-11 items-center justify-center rounded-full border border-[#BFDBFE] bg-[#EFF6FF] text-sm font-semibold text-[#2563EB]'>
													{getInitials(user.fullName)}
												</div>
											)}

											<div>
												<p className='font-medium text-[#0F172A]'>
													{user.fullName}
												</p>
											</div>
										</div>
									</td>

									<td className='border-y border-[#EEF2F6] bg-white px-4 py-4 text-[#334155]'>
										{user.email}
									</td>

									<td className='border-y border-[#EEF2F6] bg-white px-4 py-4'>
										<span
											className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
												user.status,
											)}`}
										>
											{getStatusLabel(user.status)}
										</span>
									</td>

									<td className='w-40 border-y border-[#EEF2F6] bg-white px-4 py-4'>
										<span
											className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getSystemRoleClass(
												user.systemRole,
											)}`}
										>
											{getSystemRoleLabel(
												user.systemRole,
											)}
										</span>
									</td>

									<td className='w-28 border-y border-[#EEF2F6] bg-white px-4 py-4 text-center'>
										<span
											className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
												user.plan === "pro"
													? "border-[#DDD6FE] bg-[#F5F3FF] text-[#7C3AED]"
													: "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]"
											}`}
										>
											{user.plan === "pro"
												? "Pro"
												: "Free"}
										</span>
									</td>

									<td className='w-40 border-y border-[#EEF2F6] bg-white px-4 py-4 text-[#334155]'>
										{formatDate(user.createdAt)}
									</td>

									<td className='border-y border-[#EEF2F6] bg-white px-4 py-4'>
										<div className='inline-flex items-center gap-2 text-[#334155]'>
											<Clock3 className='h-4 w-4 text-[#64748B]' />
											<span>
												{user.lastActive
													? formatRelativeTime(
															user.lastActive,
														)
													: "Chưa có hoạt động"}
											</span>
										</div>
									</td>

									<td className='rounded-r-3xl border-y border-r border-[#EEF2F6] bg-white px-4 py-4'>
										<div className='flex justify-end'>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<button className='inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#CBD5E1] bg-white text-[#475569] transition hover:bg-[#F8FAFC] hover:text-[#0F172A]'>
														<Ellipsis className='h-4 w-4' />
													</button>
												</DropdownMenuTrigger>

												<DropdownMenuContent
													align='end'
													className='w-60 rounded-2xl border border-border bg-white p-2 text-[#1E293B] shadow-xl'
												>
													<DropdownMenuItem
														onSelect={(e) => {
															e.preventDefault();
															onView(user);
														}}
														className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-[#F1F5F9] focus:text-[#0F172A]'
													>
														<Eye className='mr-2 h-4 w-4' />
														Xem chi tiết
													</DropdownMenuItem>

													{!isSuperAdmin && (
														<>
															<DropdownMenuSeparator className='my-1 bg-border' />

															<DropdownMenuItem
																disabled={
																	isChangingPlan ||
																	(user.plan !==
																		"pro" &&
																		!canGrantPro)
																}
																onClick={() =>
																	onChangePlan(
																		user,
																	)
																}
																className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-[#F1F5F9] focus:text-[#0F172A] disabled:cursor-not-allowed disabled:opacity-50'
															>
																<Crown className='mr-2 h-4 w-4' />
																{isChangingPlan
																	? "Đang cập nhật..."
																	: user.plan ===
																		  "pro"
																		? "Chuyển về Free"
																		: "Cấp Pro"}
															</DropdownMenuItem>

															<DropdownMenuSeparator className='my-1 bg-border' />

															<DropdownMenuItem
																disabled={
																	isChangingStatus
																}
																onClick={() =>
																	onToggleLock(
																		user.id,
																	)
																}
																className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-[#F1F5F9] focus:text-[#0F172A]'
															>
																{isSystemAdmin ? (
																	user.status ===
																	"LOCKED" ? (
																		<ShieldCheck className='mr-2 h-4 w-4' />
																	) : (
																		<ShieldOff className='mr-2 h-4 w-4' />
																	)
																) : user.status ===
																  "LOCKED" ? (
																	<>
																		<Unlock className='mr-2 h-4 w-4' />
																	</>
																) : (
																	<>
																		<Lock className='mr-2 h-4 w-4' />
																	</>
																)}
																{isChangingStatus
																	? "Đang cập nhật..."
																	: isSystemAdmin
																		? user.status ===
																			"LOCKED"
																			? "Khôi phục System Admin"
																			: "Thu hồi System Admin"
																		: user.status ===
																			  "LOCKED"
																			? "Mở khóa tài khoản"
																			: "Khóa tài khoản"}
															</DropdownMenuItem>

															{user.status ===
																"LOCKED" &&
																!isSystemAdmin && (
																	<DropdownMenuItem
																		onClick={() =>
																			onResetStatus(
																				user.id,
																			)
																		}
																		className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-[#F1F5F9] focus:text-[#0F172A]'
																	>
																		<RotateCcw className='mr-2 h-4 w-4' />
																		Reset
																		trạng
																		thái
																	</DropdownMenuItem>
																)}
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
				itemLabel='người dùng'
			/>
		</>
	);
}
