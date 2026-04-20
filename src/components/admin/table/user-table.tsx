import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Clock3,
	Ellipsis,
	Eye,
	History,
	Lock,
	RotateCcw,
	ShieldCheck,
	ShieldOff,
	Unlock,
} from "lucide-react";
import type { AdminUser } from "../shared/users.types";
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
			<div className='rounded-[28px] border border-white/10 bg-[#0b0b0b] p-10 text-center'>
				<p className='text-sm text-neutral-400'>
					Không tìm thấy người dùng phù hợp.
				</p>
			</div>
		);
	}

	return (
		<div className='rounded-[28px] border border-white/10 bg-[#0b0b0b] p-4 md:p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]'>
			<div className='mb-5 flex items-start justify-between gap-4'>
				<div>
					<h2 className='text-2xl font-semibold text-white'>
						Danh sách người dùng
					</h2>
					<p className='mt-1 text-sm text-neutral-400'>
						Quản lý toàn bộ user trong hệ thống theo trạng thái,
						quyền hệ thống và lịch sử hoạt động.
					</p>
				</div>

				<div className='rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-neutral-300'>
					{users.length} users
				</div>
			</div>

			<div className='overflow-x-auto'>
				<table className='w-full min-w-295 border-separate border-spacing-y-3'>
					<thead>
						<tr className='text-left text-sm text-neutral-500'>
							<th className='px-4 py-2 font-medium'>User</th>
							<th className='px-4 py-2 font-medium'>Email</th>
							<th className='px-4 py-2 font-medium'>
								Trạng thái
							</th>
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
						{users.map((user) => (
							<tr
								key={user.id}
								className='text-sm text-neutral-200'
							>
								<td className='rounded-l-3xl border-y border-l border-white/5 bg-[#101010] px-4 py-4'>
									<div className='flex items-center gap-3'>
										<div className='flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#171717] text-sm font-semibold text-white'>
											{getInitials(user.fullName)}
										</div>

										<div className='space-y-0.5'>
											<p className='font-medium text-white'>
												{user.fullName}
											</p>
											<p className='text-xs text-neutral-500'>
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
											{user.workspaces
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
											{formatRelativeTime(
												user.lastActive,
											)}
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
												className='w-56 rounded-2xl border border-white/10 bg-[#0f0f0f] p-2 text-white'
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
												<DropdownMenuSeparator className='my-1 bg-white/10' />
												<DropdownMenuItem
													onClick={() =>
														onToggleLock(user.id)
													}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
												>
													{user.status ===
													"LOCKED" ? (
														<>
															<Unlock className='mr-2 h-4 w-4' />
															Mở khóa tài khoản
														</>
													) : (
														<>
															<Lock className='mr-2 h-4 w-4' />
															Khóa tài khoản
														</>
													)}
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() =>
														onResetStatus(user.id)
													}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
												>
													<RotateCcw className='mr-2 h-4 w-4' />
													Reset trạng thái
												</DropdownMenuItem>
												<DropdownMenuSeparator className='my-1 bg-white/10' />
												<DropdownMenuItem
													onClick={() =>
														onToggleAdmin(user.id)
													}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
												>
													{user.systemRole ===
													"SYSTEM_ADMIN" ? (
														<>
															<ShieldOff className='mr-2 h-4 w-4' />
															Thu hồi System Admin
														</>
													) : (
														<>
															<ShieldCheck className='mr-2 h-4 w-4' />
															Gán System Admin
														</>
													)}
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
