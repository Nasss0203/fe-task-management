"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import type { AdminUser } from "@/services/admin/user/type";
import {
	Activity,
	Building2,
	CalendarDays,
	Clock3,
	Copy,
	Mail,
	ShieldCheck,
	User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
	user: AdminUser | null;
	onClose: () => void;
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
	if (!value) return "Chưa có hoạt động";

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

const getInitials = (name: string) => {
	const initials = name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("");

	return initials || "U";
};

const getStatusLabel = (status: AdminUser["status"]) => {
	if (status === "ACTIVE") return "Hoạt động";
	return "Bị khóa";
};

const getStatusClassName = (status: AdminUser["status"]) => {
	if (status === "ACTIVE") {
		return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
	}

	return "border-rose-500/30 bg-rose-500/10 text-rose-400";
};

const getSystemRoleLabel = (role: AdminUser["systemRole"]) => {
	if (role === "SUPER_ADMIN") return "Super Admin";
	if (role === "SYSTEM_ADMIN") return "System Admin";
	return "User";
};

const getSystemRoleClassName = (role: AdminUser["systemRole"]) => {
	if (role === "SUPER_ADMIN") {
		return "border-purple-500/30 bg-purple-500/10 text-purple-400";
	}

	if (role === "SYSTEM_ADMIN") {
		return "border-sky-500/30 bg-sky-500/10 text-sky-400";
	}

	return "border-white/10 bg-white/5 text-neutral-300";
};

const getWorkspaceRoleClassName = (role: string) => {
	if (role === "OWNER") {
		return "border-amber-500/30 bg-amber-500/10 text-amber-400";
	}

	if (role === "ADMIN") {
		return "border-sky-500/30 bg-sky-500/10 text-sky-400";
	}

	return "border-white/10 bg-white/5 text-neutral-300";
};

const getActivityLabel = (action: string) => {
	if (action === "LOGIN") return "Đăng nhập";
	if (action === "OPEN_APP") return "Mở ứng dụng";
	if (action === "OPEN_WORKSPACE") return "Mở workspace";
	if (action === "REFRESH_TOKEN") return "Làm mới phiên đăng nhập";
	return action;
};

const getSystemRoleDescription = (role: AdminUser["systemRole"]) => {
	if (role === "SUPER_ADMIN") {
		return "Toàn quyền quản trị hệ thống, có thể quản lý user, workspace, plan và phân quyền admin.";
	}

	if (role === "SYSTEM_ADMIN") {
		return "Có thể truy cập trang admin, xem dữ liệu hệ thống và quản lý user thường theo quyền được cấp.";
	}

	return "Người dùng bình thường, không có quyền truy cập trang quản trị hệ thống.";
};

export function UserDetailPanel({ user, onClose }: Props) {
	const [open, setOpen] = useState(Boolean(user));
	const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		setOpen(Boolean(user));
	}, [user]);

	useEffect(() => {
		return () => {
			if (closeTimerRef.current) {
				clearTimeout(closeTimerRef.current);
			}
		};
	}, []);

	const handleRequestClose = () => {
		if (closeTimerRef.current) {
			clearTimeout(closeTimerRef.current);
		}

		setOpen(false);

		closeTimerRef.current = setTimeout(() => {
			onClose();
		}, 300);
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			handleRequestClose();
			return;
		}

		setOpen(true);
	};

	const handleCopyUserId = async () => {
		if (!user) return;

		await navigator.clipboard.writeText(user.id);
	};

	if (!user) return null;

	return (
		<Drawer direction='right' open={open} onOpenChange={handleOpenChange}>
			<DrawerContent className='left-auto right-0 mt-0 flex h-screen w-full max-w-130 overflow-hidden rounded-none border-l border-white/10 bg-[#0b0b0b] text-white'>
				<DrawerHeader className='border-b border-white/10 px-6 py-5 text-left'>
					<div className='flex items-start justify-between gap-4'>
						<div>
							<DrawerTitle className='text-xl font-semibold text-white'>
								Chi tiết người dùng
							</DrawerTitle>
							<DrawerDescription className='mt-1 text-sm text-neutral-400'>
								Xem thông tin tài khoản, vai trò hệ thống,
								workspace tham gia và lịch sử hoạt động.
							</DrawerDescription>
						</div>

						<Button
							type='button'
							variant='ghost'
							onClick={handleRequestClose}
							className='h-9 rounded-xl border border-white/10 px-3 text-sm text-neutral-300 hover:bg-white/5 hover:text-white'
						>
							Close
						</Button>
					</div>
				</DrawerHeader>

				<div className='no-scrollbar flex-1 overflow-x-hidden overflow-y-auto px-6 py-4'>
					<div className='space-y-4'>
						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<div className='flex items-start gap-4'>
								{user.avatarUrl ? (
									<img
										src={user.avatarUrl}
										alt={user.fullName}
										className='h-14 w-14 rounded-2xl border border-white/10 object-cover'
									/>
								) : (
									<div className='flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#0b0b0b] text-base font-semibold text-white'>
										{getInitials(user.fullName)}
									</div>
								)}

								<div className='min-w-0 flex-1'>
									<h3 className='truncate text-base font-semibold text-white'>
										{user.fullName}
									</h3>

									<div className='mt-1 flex items-center gap-2 text-sm text-neutral-400'>
										<Mail className='h-4 w-4 text-neutral-500' />
										<span className='truncate'>
											{user.email}
										</span>
									</div>

									<div className='mt-3 flex flex-wrap gap-2'>
										<Badge
											variant='outline'
											className={getStatusClassName(
												user.status,
											)}
										>
											{getStatusLabel(user.status)}
										</Badge>

										<Badge
											variant='outline'
											className={getSystemRoleClassName(
												user.systemRole,
											)}
										>
											{getSystemRoleLabel(
												user.systemRole,
											)}
										</Badge>
									</div>
								</div>
							</div>
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Thông tin tài khoản
							</h3>

							<div className='space-y-3 text-sm'>
								<div>
									<p className='text-neutral-500'>User ID</p>

									<div className='mt-1 flex items-start justify-between gap-3'>
										<p className='break-all text-white'>
											{user.id}
										</p>

										<Button
											type='button'
											variant='ghost'
											onClick={handleCopyUserId}
											className='h-8 shrink-0 rounded-xl border border-white/10 px-2 text-neutral-300 hover:bg-white/5 hover:text-white'
										>
											<Copy className='h-4 w-4' />
										</Button>
									</div>
								</div>

								<div className='grid grid-cols-2 gap-4 pt-2'>
									<div>
										<p className='text-neutral-500'>
											Trạng thái
										</p>
										<p className='text-white'>
											{getStatusLabel(user.status)}
										</p>
									</div>

									<div>
										<p className='text-neutral-500'>
											Vai trò hệ thống
										</p>
										<p className='text-white'>
											{getSystemRoleLabel(
												user.systemRole,
											)}
										</p>
									</div>

									<div>
										<p className='text-neutral-500'>
											Ngày tạo
										</p>
										<div className='mt-1 flex items-center gap-2 text-white'>
											<CalendarDays className='h-4 w-4 text-neutral-500' />
											{formatDate(user.createdAt)}
										</div>
									</div>

									<div>
										<p className='text-neutral-500'>
											Hoạt động gần nhất
										</p>
										<div className='mt-1 flex items-center gap-2 text-white'>
											<Clock3 className='h-4 w-4 text-neutral-500' />
											{formatDateTime(user.lastActive)}
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Quyền hệ thống
							</h3>

							<div className='rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3'>
								<div className='flex items-start justify-between gap-4'>
									<div className='min-w-0'>
										<div className='flex items-center gap-2'>
											<ShieldCheck className='h-4 w-4 text-neutral-400' />
											<p className='text-sm font-medium text-white'>
												{getSystemRoleLabel(
													user.systemRole,
												)}
											</p>
										</div>

										<p className='mt-2 text-sm leading-6 text-neutral-500'>
											{getSystemRoleDescription(
												user.systemRole,
											)}
										</p>
									</div>

									<Badge
										variant='outline'
										className={getSystemRoleClassName(
											user.systemRole,
										)}
									>
										{user.systemRole}
									</Badge>
								</div>
							</div>
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Workspaces
							</h3>

							{user.workspaces.length ? (
								<div className='space-y-3'>
									{user.workspaces.map((workspace) => (
										<div
											key={workspace.id}
											className='rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3'
										>
											<div className='flex items-start justify-between gap-4'>
												<div className='min-w-0'>
													<div className='flex items-center gap-2'>
														<Building2 className='h-4 w-4 text-neutral-500' />
														<p className='truncate text-sm font-medium text-white'>
															{workspace.name}
														</p>
													</div>

													<p className='mt-1 truncate text-xs text-neutral-500'>
														ID: {workspace.id}
													</p>
												</div>

												<Badge
													variant='outline'
													className={getWorkspaceRoleClassName(
														workspace.role,
													)}
												>
													{workspace.role}
												</Badge>
											</div>
										</div>
									))}
								</div>
							) : (
								<p className='text-sm text-neutral-500'>
									Chưa tham gia workspace nào.
								</p>
							)}
						</div>

						<div className='rounded-2xl border border-white/10 bg-[#111111] p-4'>
							<h3 className='mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500'>
								Lịch sử hoạt động
							</h3>

							{user.activities.length ? (
								<div className='space-y-3'>
									{user.activities.map((activity) => (
										<div
											key={activity.id}
											className='rounded-xl border border-white/10 bg-[#0b0b0b] px-4 py-3'
										>
											<div className='flex items-start justify-between gap-4'>
												<div className='min-w-0'>
													<div className='flex items-center gap-2'>
														<Activity className='h-4 w-4 text-neutral-500' />
														<p className='truncate text-sm font-medium text-white'>
															{getActivityLabel(
																activity.action,
															)}
														</p>
													</div>

													<p className='mt-1 text-xs text-neutral-500'>
														{formatDateTime(
															activity.createdAt ??
																activity.time,
														)}
													</p>
												</div>

												<span className='shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-neutral-300'>
													{activity.action}
												</span>
											</div>
										</div>
									))}
								</div>
							) : (
								<p className='text-sm text-neutral-500'>
									Chưa có lịch sử hoạt động.
								</p>
							)}
						</div>
					</div>
				</div>

				<DrawerFooter className='border-t border-white/10 px-6 py-4'>
					<Button
						variant='outline'
						onClick={handleRequestClose}
						className='h-11 rounded-2xl border-white/10 bg-[#111111] text-white hover:bg-white/5 hover:text-white'
					>
						Close
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
