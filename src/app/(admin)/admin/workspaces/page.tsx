"use client";

import { WorkspaceDetailPanel } from "@/components/admin/detail/workspace-detail-panel";
import { WorkspaceFilterBar } from "@/components/admin/filters/workspace-filter-bar";
import { WorkspaceAdminHeader } from "@/components/admin/header/workspace-admin-header";
import { WorkspaceOverviewCards } from "@/components/admin/overview/workspace-overview-cards";
import { adminWorkspaces } from "@/components/admin/shared/workspace-admin.mock-data";
import type {
	AdminWorkspace,
	WorkspaceMember,
	WorkspacePlan,
	WorkspaceStatus,
} from "@/components/admin/shared/workspace-admin.types";
import { matchesWorkspaceCreatedFilter } from "@/components/admin/shared/workspace-admin.utils";
import { WorkspaceManagementTable } from "@/components/admin/table/workspace-management-table";
import { useMemo, useState } from "react";

export default function AdminWorkspacesPage() {
	const [workspaces, setWorkspaces] =
		useState<AdminWorkspace[]>(adminWorkspaces);
	const [selectedWorkspace, setSelectedWorkspace] =
		useState<AdminWorkspace | null>(null);

	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("all");
	const [plan, setPlan] = useState("all");
	const [createdAt, setCreatedAt] = useState("all");

	const filteredWorkspaces = useMemo(() => {
		return workspaces.filter((workspace) => {
			const keyword = search.toLowerCase();

			const matchesSearch =
				workspace.name.toLowerCase().includes(keyword) ||
				workspace.slug.toLowerCase().includes(keyword) ||
				workspace.ownerName.toLowerCase().includes(keyword) ||
				workspace.ownerEmail.toLowerCase().includes(keyword);

			const matchesStatus =
				status === "all" || workspace.status === status;
			const matchesPlan = plan === "all" || workspace.plan === plan;
			const matchesDate = matchesWorkspaceCreatedFilter(
				workspace.createdAt,
				createdAt,
			);

			return matchesSearch && matchesStatus && matchesPlan && matchesDate;
		});
	}, [workspaces, search, status, plan, createdAt]);

	const syncSelectedWorkspace = (nextWorkspaces: AdminWorkspace[]) => {
		setSelectedWorkspace((prev: AdminWorkspace | null) => {
			if (!prev) return null;
			return nextWorkspaces.find((item) => item.id === prev.id) ?? null;
		});
	};

	const handleViewWorkspace = (workspace: AdminWorkspace) => {
		setSelectedWorkspace(workspace);
	};

	const handleToggleLock = (workspaceId: string) => {
		setWorkspaces((prev: AdminWorkspace[]) => {
			const next: AdminWorkspace[] = prev.map((workspace) => {
				if (
					workspace.id !== workspaceId ||
					workspace.status === "DELETED"
				) {
					return workspace;
				}

				const nextStatus: WorkspaceStatus =
					workspace.status === "LOCKED" ? "ACTIVE" : "LOCKED";

				return {
					...workspace,
					status: nextStatus,
				};
			});

			syncSelectedWorkspace(next);
			return next;
		});
	};

	const handleToggleDelete = (workspaceId: string) => {
		setWorkspaces((prev: AdminWorkspace[]) => {
			const next: AdminWorkspace[] = prev.map((workspace) => {
				if (workspace.id !== workspaceId) return workspace;

				const nextStatus: WorkspaceStatus =
					workspace.status === "DELETED" ? "ACTIVE" : "DELETED";

				return {
					...workspace,
					status: nextStatus,
				};
			});

			syncSelectedWorkspace(next);
			return next;
		});
	};

	const handleChangePlan = (workspaceId: string, nextPlan: WorkspacePlan) => {
		setWorkspaces((prev: AdminWorkspace[]) => {
			const next: AdminWorkspace[] = prev.map((workspace) =>
				workspace.id === workspaceId
					? {
							...workspace,
							plan: nextPlan,
							storageLimitGb:
								nextPlan === "FREE"
									? 5
									: nextPlan === "PRO"
										? 25
										: 100,
						}
					: workspace,
			);

			syncSelectedWorkspace(next);
			return next;
		});
	};

	const handleAssignOwner = (workspaceId: string, ownerId: string) => {
		setWorkspaces((prev: AdminWorkspace[]) => {
			const next: AdminWorkspace[] = prev.map((workspace) => {
				if (workspace.id !== workspaceId) return workspace;

				const nextOwner = workspace.members.find(
					(member: WorkspaceMember) => member.id === ownerId,
				);

				if (!nextOwner) return workspace;

				const updatedMembers: WorkspaceMember[] = workspace.members.map(
					(member: WorkspaceMember) => {
						if (member.id === ownerId) {
							return { ...member, role: "OWNER" };
						}

						if (
							member.id === workspace.ownerId &&
							member.role === "OWNER"
						) {
							return { ...member, role: "ADMIN" };
						}

						return member;
					},
				);

				return {
					...workspace,
					ownerId: nextOwner.id,
					ownerName: nextOwner.name,
					ownerEmail: nextOwner.email,
					members: updatedMembers,
				};
			});

			syncSelectedWorkspace(next);
			return next;
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

			<WorkspaceOverviewCards workspaces={workspaces} />

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

			<WorkspaceManagementTable
				workspaces={filteredWorkspaces}
				onView={handleViewWorkspace}
				onToggleLock={handleToggleLock}
				onToggleDelete={handleToggleDelete}
				onChangePlan={handleChangePlan}
			/>

			<WorkspaceDetailPanel
				key={selectedWorkspace?.id ?? "workspace-detail"}
				workspace={selectedWorkspace}
				onClose={() => setSelectedWorkspace(null)}
				onAssignOwner={handleAssignOwner}
				onChangePlan={handleChangePlan}
			/>
		</div>
	);
}
