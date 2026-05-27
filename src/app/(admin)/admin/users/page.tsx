"use client";

import { UserDetailPanel } from "@/components/admin/detail/user-detail-panel";
import { UserFilterBar } from "@/components/admin/filters/user-filter-bar";
import { UserAdminHeader } from "@/components/admin/header/user-admin-header";
import { UsersOverview } from "@/components/admin/overview/user-overview-cards";
import { UserTable } from "@/components/admin/table/user-table";
import { useAdminUsers } from "@/features/admin/modules/users/hooks/useAdminUsers";
import type {
	AdminFindAllUserQuery,
	AdminSystemRole,
	AdminUser,
	AdminUserStatus,
} from "@/services/admin/user/type";
import { useMemo, useState } from "react";

const formatQueryDate = (date?: Date) => {
	if (!date) return undefined;

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
};

export default function AdminUsersPage() {
	const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("all");
	const [role, setRole] = useState("all");
	const [createdAt, setCreatedAt] = useState<Date | undefined>(undefined);

	const userQuery = useMemo<AdminFindAllUserQuery>(() => {
		return {
			search: search.trim() || undefined,
			status: status === "all" ? undefined : (status as AdminUserStatus),
			role: role === "all" ? undefined : (role as AdminSystemRole),
			createdAt: formatQueryDate(createdAt),
		};
	}, [search, status, role, createdAt]);

	const { userOverview, users, lockUser, unlockUser, updateSystemRole } =
		useAdminUsers(userQuery);

	const overview = userOverview.data?.data;
	const userItems = users.data?.data ?? [];

	const handleViewUser = (user: AdminUser) => {
		setSelectedUser(user);
	};

	const handleToggleLock = (userId: string) => {
		const user = userItems.find((item) => item.id === userId);
		if (!user) return;

		if (user.status === "LOCKED") {
			unlockUser.mutate(userId);
			return;
		}

		lockUser.mutate(userId);
	};

	const handleToggleAdmin = (userId: string) => {
		const user = userItems.find((item) => item.id === userId);
		if (!user) return;

		if (user.systemRole === "SUPER_ADMIN") return;

		const nextRole: AdminSystemRole =
			user.systemRole === "SYSTEM_ADMIN" ? "USER" : "SYSTEM_ADMIN";

		updateSystemRole.mutate({
			userId,
			systemRole: nextRole,
		});
	};

	const handleResetStatus = (userId: string) => {
		unlockUser.mutate(userId);
	};

	const handleResetFilters = () => {
		setSearch("");
		setStatus("all");
		setRole("all");
		setCreatedAt(undefined);
	};

	return (
		<div className='space-y-6 p-6'>
			<UserAdminHeader />

			<UsersOverview overview={overview} />

			<div className='rounded-[28px] border border-white/10 bg-[#0b0b0b] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] md:p-5'>
				<UserFilterBar
					search={search}
					status={status}
					role={role}
					createdAt={createdAt}
					onSearchChange={setSearch}
					onStatusChange={setStatus}
					onRoleChange={setRole}
					onCreatedAtChange={setCreatedAt}
					onReset={handleResetFilters}
				/>

				<div className='mt-4'>
					{users.isLoading ? (
						<div className='rounded-3xl border border-white/10 bg-[#101010] p-10 text-center'>
							<p className='text-sm text-neutral-400'>
								Đang tải danh sách người dùng...
							</p>
						</div>
					) : users.isError ? (
						<div className='rounded-3xl border border-red-500/20 bg-red-500/5 p-10 text-center'>
							<p className='text-sm text-red-400'>
								Không thể tải danh sách người dùng.
							</p>
						</div>
					) : (
						<UserTable
							users={userItems}
							onView={handleViewUser}
							onToggleLock={handleToggleLock}
							onToggleAdmin={handleToggleAdmin}
							onResetStatus={handleResetStatus}
						/>
					)}
				</div>
			</div>

			<UserDetailPanel
				key={selectedUser?.id ?? "user-detail"}
				user={selectedUser}
				onClose={() => setSelectedUser(null)}
			/>
		</div>
	);
}
