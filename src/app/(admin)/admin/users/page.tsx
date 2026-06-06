"use client";

import { UserManagementInsightCharts } from "@/components/admin/charts/user-management-insight-charts";
import { UserDetailPanel } from "@/components/admin/detail/user-detail-panel";
import { UserFilterBar } from "@/components/admin/filters/user-filter-bar";
import { UserAdminHeader } from "@/components/admin/header/user-admin-header";
import { UsersOverview } from "@/components/admin/overview/user-overview-cards";
import { UserTable } from "@/components/admin/table/user-table";
import { useAdminUsers } from "@/features/admin/modules/users/hooks/useAdminUsers";
import type { UserGrowthPeriod } from "@/services/admin/dashboard/type";
import type {
	AdminFindAllUserQuery,
	AdminSystemRole,
	AdminUser,
	AdminUserStatus,
} from "@/services/admin/user/type";
import type { PaginationState } from "@tanstack/react-table";
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
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [userGrowthPeriod, setUserGrowthPeriod] =
		useState<UserGrowthPeriod>("7d");

	const userQuery = useMemo<AdminFindAllUserQuery>(() => {
		return {
			search: search.trim() || undefined,
			status: status === "all" ? undefined : (status as AdminUserStatus),
			role: role === "all" ? undefined : (role as AdminSystemRole),
			createdAt: formatQueryDate(createdAt),
			page: pagination.pageIndex + 1,
			pageSize: pagination.pageSize,
		};
	}, [search, status, role, createdAt, pagination]);

	const {
		userOverview,
		users,
		userGrowth,
		lockUser,
		unlockUser,
		updateSystemRole,
	} = useAdminUsers(userQuery, userGrowthPeriod);

	const overview = userOverview.data?.data;
	const userPage = users.data?.data;
	const userItems = userPage?.data ?? [];
	const visibleUserItems = useMemo(() => {
		if (userItems.length <= pagination.pageSize) {
			return userItems;
		}

		const start = pagination.pageIndex * pagination.pageSize;
		const end = start + pagination.pageSize;

		return userItems.slice(start, end);
	}, [userItems, pagination]);
	const userGrowthItems = userGrowth.data?.data ?? [];

	const resetToFirstPage = () => {
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	};

	const handleSearchChange = (value: string) => {
		resetToFirstPage();
		setSearch(value);
	};

	const handleStatusChange = (value: string) => {
		resetToFirstPage();
		setStatus(value);
	};

	const handleRoleChange = (value: string) => {
		resetToFirstPage();
		setRole(value);
	};

	const handleCreatedAtChange = (value: Date | undefined) => {
		resetToFirstPage();
		setCreatedAt(value);
	};

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
		resetToFirstPage();
	};

	return (
		<div className='space-y-5 p-4 sm:p-6'>
			<UserAdminHeader />

			<UsersOverview overview={overview} />

			<UserManagementInsightCharts
				overview={overview}
				growthData={userGrowth.isError ? [] : userGrowthItems}
				period={userGrowthPeriod}
				onPeriodChange={setUserGrowthPeriod}
			/>

			<div className='rounded-2xl border border-white/10 bg-[#0b0b0b] p-4 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset] md:p-5'>
				<UserFilterBar
					search={search}
					status={status}
					role={role}
					createdAt={createdAt}
					onSearchChange={handleSearchChange}
					onStatusChange={handleStatusChange}
					onRoleChange={handleRoleChange}
					onCreatedAtChange={handleCreatedAtChange}
					onReset={handleResetFilters}
				/>

				<div className='mt-4'>
					{users.isLoading ? (
						<div className='rounded-2xl border border-white/10 bg-[#101010] p-10 text-center'>
							<p className='text-sm text-neutral-400'>
								Đang tải danh sách người dùng...
							</p>
						</div>
					) : users.isError ? (
						<div className='rounded-2xl border border-red-500/20 bg-red-500/5 p-10 text-center'>
							<p className='text-sm text-red-400'>
								Không thể tải danh sách người dùng.
							</p>
						</div>
					) : (
						<UserTable
							users={visibleUserItems}
							pagination={pagination}
							pageCount={userPage?.totalPages ?? 1}
							totalRows={userPage?.total ?? 0}
							onPaginationChange={setPagination}
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
