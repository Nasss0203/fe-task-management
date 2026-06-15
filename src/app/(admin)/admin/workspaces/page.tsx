"use client";

import { WorkspaceDetailPanel } from "@/components/admin/detail/workspace-detail-panel";
import { WorkspaceFilterBar } from "@/components/admin/filters/workspace-filter-bar";
import { WorkspaceAdminHeader } from "@/components/admin/header/workspace-admin-header";
import { WorkspaceOverviewCards } from "@/components/admin/overview/workspace-overview-cards";
import { WorkspaceManagementTable } from "@/components/admin/table/workspace-management-table";
import { useAdminWorkspaces } from "@/features/admin/modules/workspaces/hooks/useAdminWorkspaces";
import type {
	AdminFindAllWorkspaceQuery,
	PlanTypeWorkspace,
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

const matchesSearch = (workspace: WorkspaceItem, value: string) => {
	const keyword = value.trim().toLowerCase();
	if (!keyword) return true;

	return [
		workspace.name,
		workspace.slug,
		workspace.ownerName,
		workspace.ownerEmail,
	]
		.filter(Boolean)
		.some((item) => item!.toLowerCase().includes(keyword));
};

const matchesCreatedAt = (workspace: WorkspaceItem, value: string) => {
	const createdFrom = getCreatedFrom(value);
	if (!createdFrom) return true;

	const createdAtTime = new Date(workspace.createdAt).getTime();
	const createdFromTime = new Date(createdFrom).getTime();

	return (
		!Number.isNaN(createdAtTime) &&
		!Number.isNaN(createdFromTime) &&
		createdAtTime >= createdFromTime
	);
};

export default function AdminWorkspacesPage() {
	const [selectedWorkspace, setSelectedWorkspace] =
		useState<WorkspaceItem | null>(null);

	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("all");
	const [plan, setPlan] = useState("all");
	const [createdAt, setCreatedAt] = useState("all");
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const workspaceQuery = useMemo<AdminFindAllWorkspaceQuery>(() => {
		return {
			page: pagination.pageIndex + 1,
			pageSize: pagination.pageSize,
		};
	}, [pagination]);

	const { workspaces } = useAdminWorkspaces(workspaceQuery);

	const workspacePage = workspaces.data?.data;
	const workspaceItems = workspacePage?.data ?? [];
	const filteredWorkspaceItems = useMemo(() => {
		return workspaceItems.filter((workspace) => {
			const matchSearch = matchesSearch(workspace, search);
			const matchStatus =
				status === "all" ||
				workspace.status === (status as WorkspaceStatus);
			const matchPlan =
				plan === "all" || workspace.plan === (plan as PlanTypeWorkspace);
			const matchCreatedAt = matchesCreatedAt(workspace, createdAt);

			return matchSearch && matchStatus && matchPlan && matchCreatedAt;
		});
	}, [workspaceItems, search, status, plan, createdAt]);
	const visibleWorkspaceItems = useMemo(() => {
		const start = pagination.pageIndex * pagination.pageSize;
		const end = start + pagination.pageSize;

		return filteredWorkspaceItems.slice(start, end);
	}, [filteredWorkspaceItems, pagination]);

	const hasFilters =
		Boolean(search.trim()) ||
		status !== "all" ||
		plan !== "all" ||
		createdAt !== "all";

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

	const handlePlanChange = (value: string) => {
		resetToFirstPage();
		setPlan(value);
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
		setPlan("all");
		setCreatedAt("all");
		resetToFirstPage();
	};

	return (
		<div className='space-y-5 p-4 sm:p-6'>
			<WorkspaceAdminHeader />

			<WorkspaceOverviewCards workspaces={workspaceItems} />

			<WorkspaceFilterBar
				search={search}
				status={status}
				plan={plan}
				createdAt={createdAt}
				onSearchChange={handleSearchChange}
				onStatusChange={handleStatusChange}
				onPlanChange={handlePlanChange}
				onCreatedAtChange={handleCreatedAtChange}
				onReset={handleResetFilters}
			/>

			{workspaces.isLoading ? (
				<div className='rounded-2xl border border-white/10 bg-[#0b0b0b] p-10 text-center'>
					<p className='text-sm text-neutral-400'>
						Đang tải danh sách workspace...
					</p>
				</div>
			) : workspaces.isError ? (
				<div className='rounded-2xl border border-red-500/20 bg-red-500/5 p-10 text-center'>
					<p className='text-sm text-red-400'>
						Không thể tải danh sách workspace.
					</p>
				</div>
			) : (
				<WorkspaceManagementTable
					workspaces={visibleWorkspaceItems}
					pagination={pagination}
					pageCount={
						hasFilters
							? Math.max(
									Math.ceil(
										filteredWorkspaceItems.length /
											pagination.pageSize,
									),
									1,
								)
							: (workspacePage?.totalPages ?? 1)
					}
					totalRows={
						hasFilters
							? filteredWorkspaceItems.length
							: (workspacePage?.total ?? 0)
					}
					onPaginationChange={setPagination}
					onView={handleViewWorkspace}
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
