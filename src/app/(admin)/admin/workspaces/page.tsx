"use client";

import { WorkspaceDetailPanel } from "@/components/admin/detail/workspace-detail-panel";
import { WorkspaceFilterBar } from "@/components/admin/filters/workspace-filter-bar";
import { WorkspaceAdminHeader } from "@/components/admin/header/workspace-admin-header";
import { WorkspaceOverviewCards } from "@/components/admin/overview/workspace-overview-cards";
import { adminEmptyStateClass } from "@/components/admin/shared/theme";
import { WorkspaceManagementTable } from "@/components/admin/table/workspace-management-table";
import { useAdminWorkspaces } from "@/features/admin/modules/workspaces/hooks/useAdminWorkspaces";
import type {
	AdminFindAllWorkspaceQuery,
	WorkspaceItem,
	WorkspaceStatus,
} from "@/services/admin/workspace/type";
import type { PaginationState } from "@tanstack/react-table";
import { useMemo, useState } from "react";

const getCreatedFrom = (value: string) => {
	if (value === "all") return undefined;

	const date = new Date();

	if (value === "7d") {
		date.setDate(date.getDate() - 6);
	}

	if (value === "30d") {
		date.setDate(date.getDate() - 29);
	}

	if (value === "90d") {
		date.setDate(date.getDate() - 89);
	}

	date.setHours(0, 0, 0, 0);

	return date.toISOString();
};

export default function AdminWorkspacesPage() {
	const [selectedWorkspace, setSelectedWorkspace] =
		useState<WorkspaceItem | null>(null);

	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("all");
	const [createdAt, setCreatedAt] = useState("all");
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const workspaceQuery = useMemo<AdminFindAllWorkspaceQuery>(() => {
		return {
			search: search.trim() || undefined,
			status:
				status === "all" ? undefined : (status as WorkspaceStatus),
			createdFrom: getCreatedFrom(createdAt),
			page: pagination.pageIndex + 1,
			pageSize: pagination.pageSize,
		};
	}, [createdAt, pagination, search, status]);

	const { workspaces } = useAdminWorkspaces(workspaceQuery);

	const workspacePage = workspaces.data?.data;
	const workspaceItems = workspacePage?.data ?? [];

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

	const handleCreatedAtChange = (value: string) => {
		resetToFirstPage();
		setCreatedAt(value);
	};

	const handleViewWorkspace = (workspace: WorkspaceItem) => {
		setSelectedWorkspace(workspace);
	};

	const handleResetFilters = () => {
		setSearch("");
		setStatus("all");
		setCreatedAt("all");
		resetToFirstPage();
	};

	return (
		<div className='space-y-5 p-4 sm:p-6 w-full max-w-full min-w-0'>
			<WorkspaceAdminHeader />

			<WorkspaceOverviewCards workspaces={workspaceItems} />

			{workspaces.isLoading ? (
				<div>
					<WorkspaceManagementTable
						workspaces={[]}
						pagination={pagination}
						pageCount={workspacePage?.totalPages ?? 1}
						totalRows={workspacePage?.total ?? 0}
						onPaginationChange={setPagination}
						onView={handleViewWorkspace}
						isLoading
						skeletonRowCount={pagination.pageSize}
						toolbar={
							<WorkspaceFilterBar
								search={search}
								status={status}
								createdAt={createdAt}
								onSearchChange={handleSearchChange}
								onStatusChange={handleStatusChange}
								onCreatedAtChange={handleCreatedAtChange}
								onReset={handleResetFilters}
							/>
						}
					/>
					<p className='hidden'>
						Đang tải danh sách workspace...
					</p>
				</div>
			) : workspaces.isError ? (
				<div className={adminEmptyStateClass}>
					<p className='text-sm text-danger'>
						Không thể tải danh sách workspace.
					</p>
				</div>
			) : (
				<WorkspaceManagementTable
					workspaces={workspaceItems}
					pagination={pagination}
					pageCount={workspacePage?.totalPages ?? 1}
					totalRows={workspacePage?.total ?? 0}
					onPaginationChange={setPagination}
					onView={handleViewWorkspace}
					toolbar={
						<WorkspaceFilterBar
							search={search}
							status={status}
							createdAt={createdAt}
							onSearchChange={handleSearchChange}
							onStatusChange={handleStatusChange}
							onCreatedAtChange={handleCreatedAtChange}
							onReset={handleResetFilters}
						/>
					}
				/>
			)}

			<WorkspaceDetailPanel
				key={selectedWorkspace?.id ?? "workspace-detail"}
				workspace={selectedWorkspace}
				onClose={() => setSelectedWorkspace(null)}
			/>
		</div>
	);
}
