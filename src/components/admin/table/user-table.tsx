"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminUser } from "@/services/admin/user/type";
import {
	Clock3,
	Ellipsis,
	Eye,
	History,
	Lock,
	RotateCcw,
	ShieldCheck,
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
	onView: (user: AdminUser) => void;
	onToggleLock: (userId: string) => void;
	onToggleAdmin: (userId: string) => void;
	onResetStatus: (userId: string) => void;
};

export function UserTable({
	users,
	onView,
	onToggleLock,
	onToggleAdmin,
	onResetStatus,
}: Props) {
	if (!users.length) {
		return (
			<div className='rounded-3xl border border-white/10 bg-[#101010] p-10 text-center'>
				<p className='text-sm text-neutral-400'>
					Không tìm thấy người dùng phù hợp.
				</p>
			</div>
		);
	}

	return (
		<div className='overflow-x-auto'>
			<table className='w-full min-w-295 border-separate border-spacing-y-3'>
				<thead>
					<tr className='text-left text-sm text-neutral-500'>
						<th className='px-4 py-2 font-medium'>User</th>
						<th className='px-4 py-2 font-medium'>Email</th>
						<th className='px-4 py-2 font-medium'>Trạng thái</th>
						<th className='px-4 py-2 font-medium'>
							Vai trò hệ thống
						</th>
						<th className='px-4 py-2 font-medium'>
							Không gian làm việc
						</th>
						<th className='px-4 py-2 font-medium'>Ngày tạo</th>
						<th className='px-4 py-2 font-medium'>
							Hoạt động gần nhất
						</th>
						<th className='px-4 py-2 font-medium text-right'>
							Actions
						</th>
					</tr>
				</thead>

				<tbody>
					{users.map((user) => {
						const isSuperAdmin = user.systemRole === "SUPER_ADMIN";
						const isSystemAdmin =
							user.systemRole === "SYSTEM_ADMIN";

						return (
							<tr
								key={user.id}
								className='text-sm text-neutral-200'
							>
								<td className='rounded-l-3xl border-y border-l border-white/5 bg-[#101010] px-4 py-4'>
									<div className='flex items-center gap-3'>
										{user.avatarUrl ? (
											<img
												src={user.avatarUrl}
												alt={user.fullName}
												className='h-11 w-11 rounded-full border border-white/10 object-cover'
											/>
										) : (
											<div className='flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#171717] text-sm font-semibold text-white'>
												{getInitials(user.fullName)}
											</div>
										)}

										<div className='space-y-0.5'>
											<p className='font-medium text-white'>
												{user.fullName}
											</p>
											<p className='max-w-42 truncate text-xs text-neutral-500'>
												ID: {user.id}
											</p>
										</div>
									</div>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4 text-neutral-300'>
									{user.email}
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<span
										className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
											user.status,
										)}`}
									>
										{getStatusLabel(user.status)}
									</span>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<span
										className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getSystemRoleClass(
											user.systemRole,
										)}`}
									>
										{getSystemRoleLabel(user.systemRole)}
									</span>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<div className='space-y-0.5'>
										<p className='font-medium text-white'>
											{user.workspaces.length} workspace
										</p>

										<p className='text-xs text-neutral-500'>
											{user.workspaces.length === 0
												? "Không có workspace"
												: user.workspaces
														.slice(0, 2)
														.map(
															(workspace) =>
																workspace.role,
														)
														.join(" • ")}

											{user.workspaces.length > 2
												? " • ..."
												: ""}
										</p>
									</div>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4 text-neutral-300'>
									{formatDate(user.createdAt)}
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<div className='inline-flex items-center gap-2 text-neutral-300'>
										<Clock3 className='h-4 w-4 text-neutral-500' />
										<span>
											{user.lastActive
												? formatRelativeTime(
														user.lastActive,
													)
												: "Chưa có hoạt động"}
										</span>
									</div>
								</td>

								<td className='rounded-r-3xl border-y border-r border-white/5 bg-[#101010] px-4 py-4'>
									<div className='flex justify-end'>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<button className='inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#171717] text-neutral-300 transition hover:bg-white/5 hover:text-white'>
													<Ellipsis className='h-4 w-4' />
												</button>
											</DropdownMenuTrigger>

											<DropdownMenuContent
												align='end'
												className='w-60 rounded-2xl border border-white/10 bg-[#0f0f0f] p-2 text-white'
											>
												<DropdownMenuItem
													onSelect={(e) => {
														e.preventDefault();
														onView(user);
													}}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
												>
													<Eye className='mr-2 h-4 w-4' />
													Xem chi tiết
												</DropdownMenuItem>

												<DropdownMenuItem
													onClick={() => onView(user)}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
												>
													<History className='mr-2 h-4 w-4' />
													Xem lịch sử hoạt động
												</DropdownMenuItem>

												{!isSuperAdmin && (
													<>
														<DropdownMenuSeparator className='my-1 bg-white/10' />

														<DropdownMenuItem
															onClick={() =>
																onToggleLock(
																	user.id,
																)
															}
															className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
														>
															{user.status ===
															"LOCKED" ? (
																<>
																	<Unlock className='mr-2 h-4 w-4' />
																	Mở khóa tài
																	khoản
																</>
															) : (
																<>
																	<Lock className='mr-2 h-4 w-4' />
																	Khóa tài
																	khoản
																</>
															)}
														</DropdownMenuItem>

														{user.status ===
															"LOCKED" && (
															<DropdownMenuItem
																onClick={() =>
																	onResetStatus(
																		user.id,
																	)
																}
																className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
															>
																<RotateCcw className='mr-2 h-4 w-4' />
																Reset trạng thái
															</DropdownMenuItem>
														)}
													</>
												)}

												{!isSuperAdmin && (
													<>
														<DropdownMenuSeparator className='my-1 bg-white/10' />

														<DropdownMenuItem
															onClick={() =>
																onToggleAdmin(
																	user.id,
																)
															}
															className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
														>
															<ShieldCheck className='mr-2 h-4 w-4' />
															{isSystemAdmin
																? "Thu hồi System Admin"
																: "Gán System Admin"}
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
	);
}
