"use client";

import { UserDetailPanel } from "@/components/admin/detail/user-detail-panel";
import { CreateSystemAdminDialog } from "@/components/admin/dialog/create-system-admin-dialog";
import { SystemAdminFilterBar } from "@/components/admin/filters/system-admin-filter-bar";
import { SystemAdminHeader } from "@/components/admin/header/system-admin-header";
import { SystemAdminOverviewCard } from "@/components/admin/overview/system-admin-overview-card";
import { adminPanelCompactClass } from "@/components/admin/shared/theme";
import { SystemAdminTable } from "@/components/admin/table/system-admin-table";
import { useUser } from "@/features/auth/hooks/useUser";
import { useAdminUsers } from "@/features/admin/modules/users/hooks/useAdminUsers";
import { SystemRole } from "@/services/auth/type";
import type {
	AdminFindAllUserQuery,
	AdminUser,
	AdminUserStatus,
	CreateSystemAdminDto,
} from "@/services/admin/user/type";
import type { PaginationState } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const formatQueryDate = (date?: Date) => {
	if (!date) return undefined;

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
};

export default function AdminSystemAdminsPage() {
	const { user } = useUser();
	const router = useRouter();

	useEffect(() => {
		if (user && user.systemRole !== SystemRole.SUPER_ADMIN) {
			router.replace("/admin");
		}
	}, [user, router]);

	const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("all");
	const [createdAt, setCreatedAt] = useState<Date | undefined>(undefined);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const userQuery = useMemo<AdminFindAllUserQuery>(() => {
		return {
			search: search.trim() || undefined,
			status: status === "all" ? undefined : (status as AdminUserStatus),
			role: "SYSTEM_ADMIN",
			createdAt: formatQueryDate(createdAt),
			page: pagination.pageIndex + 1,
			pageSize: pagination.pageSize,
		};
	}, [search, status, createdAt, pagination]);

	const {
		userOverview,
		users,
		billingPlans,
		lockUser,
		unlockUser,
		createSystemAdmin,
		grantSubscription,
		revokeSubscription,
	} = useAdminUsers(userQuery);

	const isSuperAdmin = user?.systemRole === SystemRole.SUPER_ADMIN;
	const userPage = users.data?.data;
	const userItems = useMemo(() => userPage?.data ?? [], [userPage?.data]);
	const systemAdmins =
		userOverview.data?.data.systemAdmins ?? userPage?.total ?? userItems.length;
	const lockedSystemAdmins = userItems.filter(
		(item) => item.status === "LOCKED",
	).length;
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

	const handleCreatedAtChange = (value: Date | undefined) => {
		resetToFirstPage();
		setCreatedAt(value);
	};

	const handleToggleLock = async (userId: string) => {
		const user = userItems.find((item) => item.id === userId);
		if (!user) return;

		const isLocked = user.status === "LOCKED";

		try {
			if (isLocked) {
				await unlockUser.mutateAsync(userId);
			} else {
				await lockUser.mutateAsync(userId);
			}

			toast.success(
				isLocked
					? "Da khoi phuc tai khoan System Admin."
					: "Da thu hoi tai khoan System Admin va toan bo phien dang nhap.",
			);
		} catch (error) {
			console.error("change system admin status failed", error);
			toast.error("Khong the cap nhat trang thai System Admin.");
		}
	};

	const handleResetStatus = (userId: string) => {
		unlockUser.mutate(userId);
	};

	const handleChangePlan = async (user: AdminUser) => {
		const nextPlan = user.plan === "pro" ? "free" : "pro";

		try {
			if (nextPlan === "pro") {
				if (!proPlan) {
					toast.error("Khong tim thay goi Pro dang hoat dong.");
					return;
				}

				await grantSubscription.mutateAsync({
					userId: user.id,
					planId: proPlan.id,
					months: 1,
					note: "Granted from admin management",
				});
				toast.success("Da cap Pro cho System Admin.");
			} else {
				await revokeSubscription.mutateAsync({
					userId: user.id,
					note: "Revoked from admin management",
				});
				toast.success("Da chuyen System Admin ve Free.");
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
			console.error("change system admin billing subscription failed", error);
			toast.error("Khong the cap nhat goi cua System Admin.");
		}
	};

	const handleResetFilters = () => {
		setSearch("");
		setStatus("all");
		setCreatedAt(undefined);
		resetToFirstPage();
	};

	const handleCreateSystemAdmin = async (data: CreateSystemAdminDto) => {
		const response = await createSystemAdmin.mutateAsync(data);

		toast.success("Da tao tai khoan System Admin", {
			description: `Thong tin dang nhap ${response.data.email} da duoc gui toi ${response.data.recipientEmail}.`,
		});
	};

	return (
		<div className='space-y-5 p-4 sm:p-6 w-full max-w-full min-w-0'>
			<div className='border-b border-border pb-5'>
				<SystemAdminHeader
					isSuperAdmin={isSuperAdmin}
					onCreateSystemAdmin={() => setIsCreateDialogOpen(true)}
				/>
			</div>

			<SystemAdminOverviewCard
				total={systemAdmins}
				locked={lockedSystemAdmins}
			/>

			<div className={`${adminPanelCompactClass} p-4 md:p-5`}>
				<SystemAdminFilterBar
					search={search}
					status={status}
					createdAt={createdAt}
					onSearchChange={handleSearchChange}
					onStatusChange={handleStatusChange}
					onCreatedAtChange={handleCreatedAtChange}
					onReset={handleResetFilters}
				/>

				<div className='mt-4'>
					<SystemAdminTable
						users={visibleUserItems}
						pagination={pagination}
						pageCount={userPage?.totalPages ?? 1}
						totalRows={userPage?.total ?? 0}
						onPaginationChange={setPagination}
						onView={setSelectedUser}
						onToggleLock={handleToggleLock}
						onResetStatus={handleResetStatus}
						onChangePlan={handleChangePlan}
						isLoading={users.isLoading}
						isError={users.isError}
						isChangingStatus={
							lockUser.isPending || unlockUser.isPending
						}
						isChangingPlan={
							grantSubscription.isPending ||
							revokeSubscription.isPending
						}
						canGrantPro={Boolean(proPlan)}
					/>
				</div>
			</div>

			<UserDetailPanel
				key={selectedUser?.id ?? "system-admin-detail"}
				user={selectedUser}
				onClose={() => setSelectedUser(null)}
			/>

			<CreateSystemAdminDialog
				open={isCreateDialogOpen}
				onOpenChange={setIsCreateDialogOpen}
				onSubmit={handleCreateSystemAdmin}
				isPending={createSystemAdmin.isPending}
			/>
		</div>
	);
}
