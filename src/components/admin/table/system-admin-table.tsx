"use client";

import { adminEmptyStateClass } from "@/components/admin/shared/theme";
import { UserTable } from "@/components/admin/table/user-table";
import type { AdminUser } from "@/services/admin/user/type";
import type { OnChangeFn, PaginationState } from "@tanstack/react-table";

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
	isLoading?: boolean;
	isError?: boolean;
	isChangingStatus?: boolean;
	isChangingPlan?: boolean;
	canGrantPro?: boolean;
};

export function SystemAdminTable({
	users,
	pagination,
	pageCount,
	totalRows,
	onPaginationChange,
	onView,
	onToggleLock,
	onResetStatus,
	onChangePlan,
	isLoading = false,
	isError = false,
	isChangingStatus = false,
	isChangingPlan = false,
	canGrantPro = true,
}: Props) {
	if (isError && !isLoading) {
		return (
			<div className={adminEmptyStateClass}>
				<p className='text-sm text-danger'>
					Khong the tai danh sach System Admin.
				</p>
			</div>
		);
	}

	return (
		<UserTable
			users={users}
			pagination={pagination}
			pageCount={pageCount}
			totalRows={totalRows}
			onPaginationChange={onPaginationChange}
			onView={onView}
			onToggleLock={onToggleLock}
			onResetStatus={onResetStatus}
			onChangePlan={onChangePlan}
			isChangingStatus={isChangingStatus}
			isChangingPlan={isChangingPlan}
			canGrantPro={canGrantPro}
			isLoading={isLoading}
			skeletonRowCount={pagination.pageSize}
		/>
	);
}
