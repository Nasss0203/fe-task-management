"use client";

import { UserManagementInsightCharts } from "@/components/admin/charts/user-management-insight-charts";
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
import {
	adminEmptyStateClass,
	adminPanelCompactClass,
} from "@/components/admin/shared/theme";
import type { PaginationState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { toast } from "sonner";

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
		billingPlans,
		lockUser,
		unlockUser,
		updateSystemRole,
		grantSubscription,
		revokeSubscription,
	} = useAdminUsers(userQuery);

	const overview = userOverview.data?.data;
	const userPage = users.data?.data;
	const userItems = useMemo(() => userPage?.data ?? [], [userPage?.data]);
	const proPlan = useMemo(() => {
		const activePlans =
			billingPlans.data?.filter((item) => item.status === "ACTIVE") ?? [];

		return (
			activePlans.find(
				(item) =>
					item.slug?.toLowerCase() === "pro-monthly" ||
					item.code.toLowerCase() === "pro_monthly",
			) ??
			activePlans.find(
				(item) =>
					item.slug?.toLowerCase() !== "free" &&
					item.code.toLowerCase() !== "free",
			) ??
			null
		);
	}, [billingPlans.data]);
	const visibleUserItems = useMemo(() => {
		if (userItems.length <= pagination.pageSize) {
			return userItems;
		}

		const start = pagination.pageIndex * pagination.pageSize;
		const end = start + pagination.pageSize;

		return userItems.slice(start, end);
	}, [userItems, pagination]);
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

	const handleChangePlan = async (user: AdminUser) => {
		const nextPlan = user.plan === "pro" ? "free" : "pro";

		try {
			if (nextPlan === "pro") {
				if (!proPlan) {
					toast.error("Không tìm thấy gói Pro đang hoạt động.");
					return;
				}

				await grantSubscription.mutateAsync({
					userId: user.id,
					planId: proPlan.id,
					months: 1,
					note: "Granted from admin user management",
				});
				toast.success(
					"Đã cấp Pro cho user và toàn bộ workspace sở hữu.",
				);
			} else {
				await revokeSubscription.mutateAsync({
					userId: user.id,
					note: "Revoked from admin user management",
				});
				toast.success(
					"Đã chuyển user và toàn bộ workspace sở hữu về Free.",
				);
			}

			setSelectedUser((current) =>
				current?.id === user.id
					? {
							...current,
							plan: nextPlan,
						}
					: current,
			);
		} catch (error) {
			console.error("change user billing subscription failed", error);
			toast.error("Không thể cập nhật gói của user.");
		}
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
			/>

			<div className={`${adminPanelCompactClass} p-4 md:p-5`}>
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
						<div className={adminEmptyStateClass}>
							<p className='text-sm text-muted-foreground'>
								Đang tải danh sách người dùng...
							</p>
						</div>
					) : users.isError ? (
						<div className={adminEmptyStateClass}>
							<p className='text-sm text-danger'>
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
							onChangePlan={handleChangePlan}
							isChangingPlan={
								grantSubscription.isPending ||
								revokeSubscription.isPending
							}
							canGrantPro={Boolean(proPlan)}
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
