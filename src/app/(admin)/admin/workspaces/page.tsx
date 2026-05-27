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
	const [plan, setPlan] = useState("all");
	const [createdAt, setCreatedAt] = useState("all");

	const workspaceQuery = useMemo<AdminFindAllWorkspaceQuery>(() => {
		return {
			search: search.trim() || undefined,
			status: status === "all" ? undefined : (status as WorkspaceStatus),
			plan: plan === "all" ? undefined : (plan as PlanTypeWorkspace),
			createdFrom: getCreatedFrom(createdAt),
		};
	}, [search, status, plan, createdAt]);

	const { workspaces, updatePlan } = useAdminWorkspaces(workspaceQuery);

	const workspaceItems = workspaces.data?.data ?? [];

	const handleViewWorkspace = (workspace: WorkspaceItem) => {
		setSelectedWorkspace(workspace);
	};

	const handleChangePlan = (
		workspaceId: string,
		nextPlan: PlanTypeWorkspace,
	) => {
		updatePlan.mutate({
			workspaceId,
			planType: nextPlan,
		});
	};

	const handleResetFilters = () => {
		setSearch("");
		setStatus("all");
		setPlan("all");
		setCreatedAt("all");
	};

	return (
		<div className='space-y-6 p-6'>
			<WorkspaceAdminHeader />

			<WorkspaceOverviewCards workspaces={workspaceItems} />

			<WorkspaceFilterBar
				search={search}
				status={status}
				plan={plan}
				createdAt={createdAt}
				onSearchChange={setSearch}
				onStatusChange={setStatus}
				onPlanChange={setPlan}
				onCreatedAtChange={setCreatedAt}
				onReset={handleResetFilters}
			/>

			{workspaces.isLoading ? (
				<div className='rounded-[28px] border border-white/10 bg-[#0b0b0b] p-10 text-center'>
					<p className='text-sm text-neutral-400'>
						Đang tải danh sách workspace...
					</p>
				</div>
			) : workspaces.isError ? (
				<div className='rounded-[28px] border border-red-500/20 bg-red-500/5 p-10 text-center'>
					<p className='text-sm text-red-400'>
						Không thể tải danh sách workspace.
					</p>
				</div>
			) : (
				<WorkspaceManagementTable
					workspaces={workspaceItems}
					onView={handleViewWorkspace}
					onChangePlan={handleChangePlan}
				/>
			)}

			<WorkspaceDetailPanel
				key={selectedWorkspace?.id ?? "workspace-detail"}
				workspace={selectedWorkspace}
				onClose={() => setSelectedWorkspace(null)}
				onChangePlan={handleChangePlan}
			/>
		</div>
	);
}
