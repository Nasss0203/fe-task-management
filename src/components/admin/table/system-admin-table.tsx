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
	isLoading?: boolean;
	isError?: boolean;
	isChangingStatus?: boolean;
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
	isLoading = false,
	isError = false,
	isChangingStatus = false,
}: Props) {
	if (isError && !isLoading) {
		return (
			<div className={adminEmptyStateClass}>
				<p className='text-sm text-danger'>
					Không thể tải danh sách System Admin.
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
			isChangingStatus={isChangingStatus}
			isLoading={isLoading}
			skeletonRowCount={pagination.pageSize}
		/>
	);
}
