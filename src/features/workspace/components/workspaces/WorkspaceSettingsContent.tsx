"use client";

import { AddPeopleDialog } from "@/components/dialog/AddPeopleDialog";
import WorkspaceTrashDialog from "@/features/workspace/components/workspaces/WorkspaceTrashDialog";
import { usePlan } from "@/features/billing/hooks/usePlan";
import { useMember } from "@/features/member/hooks/useMember";
import { usePermission } from "@/features/permission/hooks/usePermission";
import { useProject } from "@/features/project/hooks/useProject";
import { useTask } from "@/features/task/hooks/useTask";
import { useWorkspaceFeatures } from "@/features/workspace-feature/hooks/useWorkspaceFeatures";
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace";
import { PERMISSIONS } from "@/constants/permissions";
import { FeatureKey } from "@/services/workspace-feature/type";
import type { WorkspaceItem } from "@/services/workspace/type";
import { Bell } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SettingsBoardSection } from "@/features/workspace/components/settings/SettingsBoardSection";
import { SettingsDangerSection } from "@/features/workspace/components/settings/SettingsDangerSection";
import { SettingsDetailsSection } from "@/features/workspace/components/settings/SettingsDetailsSection";
import { SettingsFeaturesSection } from "@/features/workspace/components/settings/SettingsFeaturesSection";

import { SettingsSidebar } from "@/features/workspace/components/settings/SettingsSidebar";
import { SETTINGS_NAV, type SettingsSection } from "@/features/workspace/components/settings/types";

type WorkspaceSettingsContentProps = {
	workspaceSlug: string;
	variant?: "page" | "dialog";
};

const getFeature = (features: ReturnType<typeof useWorkspaceFeatures>["features"], code: FeatureKey) =>
	features.find((feature) => feature.code.toLowerCase() === code);

const WorkspaceSettingsContent = ({
	workspaceSlug,
	variant = "page",
}: WorkspaceSettingsContentProps) => {
	const [activeSection, setActiveSection] = useState<SettingsSection>("details");
	const [openTrashDialog, setOpenTrashDialog] = useState(false);
	const [openAddPeopleDialog, setOpenAddPeopleDialog] = useState(false);

	const {
		workspaceFindAll: { data: workspaceQuery, isLoading },
		updateWorkspaceLayoutMode,
	} = useWorkspace();
	const { planInfo } = usePlan();

	const workspaces: WorkspaceItem[] = workspaceQuery?.data ?? [];
	const workspace = workspaces.find((item) => item.slug === workspaceSlug);

	// Permission hooks — must be called before any early returns (Rules of Hooks)
	const { can } = usePermission(workspace?.id);

	const { features, updateWorkspaceFeature, workspaceFeaturesQuery } =
		useWorkspaceFeatures(workspace?.id);
	const { findAllMember } = useMember({ workspaceId: workspace?.id });
	const { deletedProjects, restoreProject } = useProject(workspace?.id);
	const { deletedTasks, restoreTask } = useTask(
		workspace?.id ?? "",
		"",
		undefined,
		{
			includeTrash: true,
		},
	);

	const sprintFeature = getFeature(features, FeatureKey.SPRINT_ENABLED);
	const sprintPlanEnabled = sprintFeature?.planEnabled === true;
	const sprintEnabled = sprintFeature?.enabled === true;
	const planName =
		planInfo.data?.data?.plan?.name ??
		workspace?.planType ??
		workspace?.planType;
	const isFeatureLoading = workspaceFeaturesQuery.isPending;
	const isUpdatingFeature = updateWorkspaceFeature.isPending;
	const isUpdatingLayout = updateWorkspaceLayoutMode.isPending;
	const members = findAllMember.data?.data ?? [];
	const isMembersLoading = findAllMember.isPending;
	const deletedProjectItems = deletedProjects.data?.data ?? [];
	const isDeletedProjectsLoading = deletedProjects.isPending;
	const deletedTaskItems = deletedTasks.data?.data ?? [];
	const isDeletedTasksLoading = deletedTasks.isPending;
	const inviteLink =
		typeof window === "undefined"
			? undefined
			: `${window.location.origin}/dashboard/${workspace?.slug ?? ""}`;

	const createdByName = workspace?.createdBy
		? (members.find((m) => m.user_id === workspace.createdBy)?.full_name ?? null)
		: null;

	const handleToggleSprint = (enabled: boolean) => {
		if (!workspace?.id) return;

		updateWorkspaceFeature.mutate({
			workspaceId: workspace.id,
			featureCode: FeatureKey.SPRINT_ENABLED,
			enabled,
		});
	};

	const handleUpdateLayoutMode = (layoutMode: string) => {
		if (!workspace?.id) return;

		updateWorkspaceLayoutMode.mutate({
			workspaceId: workspace.id,
			data: {
				layoutMode: layoutMode as Parameters<typeof handleUpdateLayoutMode>[0] extends string ? any : never,
			},
		});
	};

	const handleRestoreProject = async (projectId?: string) => {
		if (!workspace?.id || !projectId) return;

		try {
			await restoreProject.mutateAsync({
				workspaceId: workspace.id,
				projectId,
			});
			toast.success("Đã khôi phục dự án.");
		} catch (error) {
			console.error("restoreProjectFromSettings failed", error);
			toast.error("Không thể khôi phục dự án.");
		}
	};

	const handleRestoreTask = async (taskId?: string) => {
		if (!workspace?.id || !taskId) return;

		try {
			await restoreTask.mutateAsync({
				taskId,
			});
			toast.success("Đã khôi phục công việc.");
		} catch (error) {
			console.error("restoreTaskFromSettings failed", error);
			toast.error("Không thể khôi phục công việc.");
		}
	};

	if (isLoading) {
		return (
			<div className='flex h-full items-center justify-center p-8 text-sm text-muted-foreground'>
				Loading settings...
			</div>
		);
	}

	if (!workspace) {
		return (
			<div className='flex h-full items-center justify-center p-8 text-sm text-muted-foreground'>
				Workspace not found.
			</div>
		);
	}

	const shellClassName =
		variant === "page"
			? "-mx-4 -mt-3 flex min-h-[calc(100svh-4rem)] text-foreground md:-mx-6 xl:-mx-10"
			: "flex h-full min-h-0 text-foreground";

	const mainClassName =
		variant === "page" ? "min-w-0 flex-1 overflow-y-auto" : "min-w-0 flex-1 overflow-y-auto bg-background";

	return (
		<div className={shellClassName}>
			<SettingsSidebar
				workspaceName={workspace.name}
				activeSection={activeSection}
				onSectionChange={setActiveSection}
			/>

			<main className={mainClassName}>
				<div className='border-b border-border px-8 py-5'>
					<div className='text-sm text-muted-foreground'>
						Workspaces / {workspace.name} / Settings
					</div>
					<h1 className='mt-2 text-2xl font-semibold'>
						{SETTINGS_NAV.find((item) => item.key === activeSection)
							?.label ?? "Settings"}
					</h1>
				</div>

				<div className='max-w-5xl px-8 py-6'>
					{activeSection === "details" && (
						<SettingsDetailsSection
							workspaceName={workspace.name}
							workspaceSlug={workspace.slug}
							planName={planName}
							createdByName={createdByName}
						/>
					)}


					{activeSection === "preferences" && (
						<div className="space-y-6">
							<SettingsFeaturesSection
								sprintFeature={sprintFeature}
								sprintPlanEnabled={sprintPlanEnabled}
								sprintEnabled={sprintEnabled}
								isFeatureLoading={isFeatureLoading}
								isUpdatingFeature={isUpdatingFeature}
								canUpdate={can(PERMISSIONS.WORKSPACE_FEATURE_UPDATE)}
								onToggleSprint={handleToggleSprint}
							/>
							<SettingsBoardSection
								currentLayoutMode={workspace.layoutMode}
								isUpdatingLayout={isUpdatingLayout}
								canUpdate={can(PERMISSIONS.WORKSPACE_UPDATE)}
								onUpdateLayoutMode={handleUpdateLayoutMode}
							/>
						</div>
					)}


					{activeSection === "danger" && (
						<SettingsDangerSection
							canDeleteWorkspace={can(PERMISSIONS.WORKSPACE_DELETE)}
							canDeleteProject={can(PERMISSIONS.PROJECT_DELETE)}
							canDeleteTask={can(PERMISSIONS.TASK_DELETE)}
							deletedProjectItems={deletedProjectItems}
							isDeletedProjectsLoading={isDeletedProjectsLoading}
							deletedTaskItems={deletedTaskItems}
							isDeletedTasksLoading={isDeletedTasksLoading}
							isRestoringProject={restoreProject.isPending}
							isRestoringTask={restoreTask.isPending}
							onMoveToTrash={() => setOpenTrashDialog(true)}
							onRestoreProject={handleRestoreProject}
							onRestoreTask={handleRestoreTask}
						/>
					)}

					<div className='mt-8 flex items-center gap-2 text-xs text-neutral-600'>
						<Bell className='size-3.5' />
						Thay đổi chỉ áp dụng cho workspace này.
					</div>
				</div>
			</main>

			<WorkspaceTrashDialog
				workspace={workspace}
				open={openTrashDialog}
				onOpenChange={setOpenTrashDialog}
			/>

			<AddPeopleDialog
				open={openAddPeopleDialog}
				onOpenChange={setOpenAddPeopleDialog}
				workspaceId={workspace.id}
				workspaceName={workspace.name}
				inviteLink={inviteLink}
			/>
		</div>
	);
};

export default WorkspaceSettingsContent;
