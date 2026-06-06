"use client";

import { AddPeopleDialog } from "@/components/dialog/AddPeopleDialog";
import { Button } from "@/components/ui/button";
import WorkspaceTrashDialog from "@/components/workspaces/WorkspaceTrashDialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { usePlan } from "@/features/billing/hooks/usePlan";
import { useMember } from "@/features/member/hooks/useMember";
import { useProject } from "@/features/project/hooks/useProject";
import { useTask } from "@/features/task/hooks/useTask";
import { useWorkspaceFeatures } from "@/features/workspace-feature/hooks/useWorkspaceFeatures";
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace";
import { WorkspaceMemberItem } from "@/services/member/type";
import {
	FeatureKey,
	WorkspaceFeatureItem,
} from "@/services/workspace-feature/type";
import {
	type WorkspaceItem,
	WorkspaceLayoutMode,
} from "@/services/workspace/type";
import {
	Bell,
	Columns3,
	LayoutList,
	Lock,
	RotateCcw,
	Settings,
	Trash2,
	Users,
	Zap,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

type SettingsSection = "details" | "access" | "features" | "board" | "danger";
type WorkspaceSettingsContentProps = {
	workspaceSlug: string;
	variant?: "page" | "dialog";
};

const SETTINGS_NAV: {
	key: SettingsSection;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
}[] = [
	{ key: "details", label: "Details", icon: Settings },
	{ key: "access", label: "Access", icon: Users },
	{ key: "features", label: "Features", icon: Zap },
	{ key: "board", label: "Board", icon: Columns3 },
	{ key: "danger", label: "Danger zone", icon: Trash2 },
];

const getFeature = (
	features: WorkspaceFeatureItem[],
	code: FeatureKey,
): WorkspaceFeatureItem | undefined => {
	return features.find((feature) => feature.code.toLowerCase() === code);
};

const formatPlanName = (value?: string | null) => {
	if (!value) return "FREE";

	return value.replace(/-/g, " ").toUpperCase();
};

const formatDeletedAt = (value?: string | null) => {
	if (!value) return "Unknown time";

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) return "Unknown time";

	return new Intl.DateTimeFormat("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
};

const WorkspaceSettingsContent = ({
	workspaceSlug,
	variant = "page",
}: WorkspaceSettingsContentProps) => {
	const [activeSection, setActiveSection] =
		useState<SettingsSection>("features");
	const [openTrashDialog, setOpenTrashDialog] = useState(false);
	const [openAddPeopleDialog, setOpenAddPeopleDialog] = useState(false);

	const {
		workspaceFindAll: { data: workspaceQuery, isLoading },
		updateWorkspaceLayoutMode,
	} = useWorkspace();
	const { planInfo } = usePlan();

	const workspaces: WorkspaceItem[] = workspaceQuery?.data ?? [];
	const workspace = workspaces.find((item) => item.slug === workspaceSlug);

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
	const members: WorkspaceMemberItem[] = findAllMember.data?.data ?? [];
	const isMembersLoading = findAllMember.isPending;
	const deletedProjectItems = deletedProjects.data?.data ?? [];
	const isDeletedProjectsLoading = deletedProjects.isPending;
	const deletedTaskItems = deletedTasks.data?.data ?? [];
	const isDeletedTasksLoading = deletedTasks.isPending;
	const inviteLink =
		typeof window === "undefined"
			? undefined
			: `${window.location.origin}/dashboard/${workspace?.slug ?? ""}`;

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
				layoutMode: layoutMode as WorkspaceLayoutMode,
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
			toast.success("Project da duoc khoi phuc.");
		} catch (error) {
			console.error("restoreProjectFromSettings failed", error);
			toast.error("Khong the khoi phuc project.");
		}
	};

	const handleRestoreTask = async (taskId?: string) => {
		if (!workspace?.id || !taskId) return;

		try {
			await restoreTask.mutateAsync({
				taskId,
			});
			toast.success("Task da duoc khoi phuc.");
		} catch (error) {
			console.error("restoreTaskFromSettings failed", error);
			toast.error("Khong the khoi phuc task.");
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
			? "-mx-4 -mt-3 flex min-h-[calc(100svh-4rem)] text-neutral-100 md:-mx-6 xl:-mx-10"
			: "flex h-full min-h-0 text-neutral-100";

	const mainClassName =
		variant === "page" ? "min-w-0 flex-1 overflow-y-auto" : "min-w-0 flex-1 overflow-y-auto bg-[#1b1b1d]";

	return (
		<div className={shellClassName}>
			<aside className='w-64 shrink-0 border-r border-neutral-800 bg-neutral-950/80'>
				<div className='border-b border-neutral-800 px-5 py-4'>
					<div className='text-base font-semibold'>
						Workspace settings
					</div>
					<div className='mt-3 flex items-center gap-3'>
						<div className='flex size-8 items-center justify-center rounded bg-blue-600 text-sm font-bold'>
							{workspace.name.charAt(0).toUpperCase()}
						</div>
						<div className='min-w-0'>
							<div className='truncate text-sm font-medium'>
								{workspace.name}
							</div>
							<div className='text-xs text-neutral-500'>
								Task workspace
							</div>
						</div>
					</div>
				</div>

				<nav className='grid gap-1 px-3 py-4'>
					{SETTINGS_NAV.map((item) => {
						const Icon = item.icon;
						const isActive = activeSection === item.key;

						return (
							<button
								key={item.key}
								type='button'
								onClick={() => setActiveSection(item.key)}
								className={`flex h-9 items-center gap-3 rounded-md px-3 text-left text-sm transition ${
									isActive
										? "bg-blue-500/15 text-blue-300"
										: "text-neutral-300 hover:bg-neutral-900 hover:text-neutral-100"
								}`}
							>
								<Icon className='size-4' />
								{item.label}
							</button>
						);
					})}
				</nav>
			</aside>

			<main className={mainClassName}>
				<div className='border-b border-neutral-800 px-8 py-5'>
					<div className='text-sm text-neutral-500'>
						Workspaces / {workspace.name} / Settings
					</div>
					<h1 className='mt-2 text-2xl font-semibold'>
						{SETTINGS_NAV.find((item) => item.key === activeSection)
							?.label ?? "Settings"}
					</h1>
				</div>

				<div className='max-w-5xl px-8 py-6'>
					{activeSection === "details" ? (
						<div className='max-w-3xl space-y-4'>
							<div className='rounded-md border border-neutral-800 bg-neutral-900/30 p-5'>
								<div className='mb-4 text-sm font-semibold'>
									Workspace details
								</div>

								<div className='grid gap-4'>
									<div className='flex items-center justify-between gap-4 border-b border-neutral-800 pb-3'>
										<span className='text-sm text-neutral-400'>
											Name
										</span>
										<span className='text-sm font-medium'>
											{workspace.name}
										</span>
									</div>

									<div className='flex items-center justify-between gap-4 border-b border-neutral-800 pb-3'>
										<span className='text-sm text-neutral-400'>
											Slug
										</span>
										<span className='text-sm font-medium'>
											{workspace.slug}
										</span>
									</div>

									<div className='flex items-center justify-between gap-4'>
										<span className='text-sm text-neutral-400'>
											Plan
										</span>
										<span className='inline-flex items-center rounded-full border border-neutral-700 px-2.5 py-1 text-xs font-semibold'>
											{formatPlanName(planName)}
										</span>
									</div>
								</div>
							</div>
						</div>
					) : null}

					{activeSection === "access" ? (
						<div className='max-w-4xl space-y-4'>
							<div className='flex items-center justify-between gap-4'>
								<div>
									<div className='text-sm font-semibold'>
										Current users
									</div>
									<div className='mt-1 text-sm text-neutral-500'>
										Manage workspace members and roles.
									</div>
								</div>
								<button
									type='button'
									onClick={() => setOpenAddPeopleDialog(true)}
									className='rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-400'
								>
									Add people
								</button>
							</div>

							<div className='rounded-md border border-neutral-800'>
								<div className='grid grid-cols-[1fr_220px_120px] border-b border-neutral-800 px-4 py-3 text-xs font-semibold uppercase text-neutral-500'>
									<div>Name</div>
									<div>Role</div>
									<div>Action</div>
								</div>
								{isMembersLoading ? (
									<div className='px-4 py-4 text-sm text-neutral-500'>
										Loading members...
									</div>
								) : members.length === 0 ? (
									<div className='px-4 py-4 text-sm text-neutral-500'>
										No members found in this workspace yet.
									</div>
								) : (
									members.map((member) => (
										<div
											key={member.id}
											className='grid grid-cols-[1fr_220px_120px] items-center border-t border-neutral-800 px-4 py-4 text-sm first:border-t-0'
										>
											<div className='flex min-w-0 items-center gap-3'>
												<div className='flex size-8 items-center justify-center overflow-hidden rounded-full bg-violet-600 text-xs font-bold uppercase'>
													{member.avatar_url ? (
														<Image
															src={member.avatar_url}
															alt={member.full_name}
															width={32}
															height={32}
															className='size-full object-cover'
														/>
													) : (
														member.full_name?.charAt(0) ??
														member.email?.charAt(0) ??
														"U"
													)}
												</div>
												<div className='min-w-0'>
													<div className='truncate font-medium'>
														{member.full_name || member.email}
													</div>
													<div className='truncate text-xs text-neutral-500'>
														{member.email}
													</div>
												</div>
											</div>
											<div className='uppercase text-neutral-200'>
												{member.role_name}
											</div>
											<div className='text-neutral-500'>-</div>
										</div>
									))
								)}
							</div>
						</div>
					) : null}

					{activeSection === "features" ? (
						<div className='max-w-3xl space-y-4'>
							<div className='rounded-md border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-100'>
								Feature settings decide what this workspace can
								use after the plan allows it.
							</div>

							<div className='rounded-md border border-neutral-800 bg-neutral-900/30'>
								<div className='flex items-center justify-between gap-4 border-b border-neutral-800 px-5 py-4'>
									<div>
										<div className='text-sm font-semibold'>
											Sprint
										</div>
										<div className='mt-1 text-sm text-neutral-500'>
											Enable sprint planning, backlog
											views, and sprint task workflows.
										</div>
									</div>
									<Switch
										checked={sprintEnabled}
										disabled={
											isFeatureLoading ||
											isUpdatingFeature ||
											!sprintPlanEnabled
										}
										onCheckedChange={handleToggleSprint}
										aria-label='Toggle sprint feature'
									/>
								</div>

								<div className='grid grid-cols-3 gap-4 px-5 py-4 text-sm'>
									<div>
										<div className='text-xs uppercase text-neutral-500'>
											Plan
										</div>
										<div className='mt-1 font-medium'>
											{sprintPlanEnabled
												? "Allowed"
												: "Not allowed"}
										</div>
									</div>
									<div>
										<div className='text-xs uppercase text-neutral-500'>
											Workspace
										</div>
										<div className='mt-1 font-medium'>
											{sprintFeature?.workspaceEnabled ===
											false
												? "Off"
												: "On"}
										</div>
									</div>
									<div>
										<div className='text-xs uppercase text-neutral-500'>
											Result
										</div>
										<div className='mt-1 font-medium'>
											{sprintEnabled
												? "Enabled"
												: "Disabled"}
										</div>
									</div>
								</div>
							</div>
						</div>
					) : null}

					{activeSection === "board" ? (
						<div className='max-w-3xl space-y-4'>
							<div className='rounded-md border border-neutral-800 bg-neutral-900/30 p-5'>
								<div className='flex items-start gap-3'>
									<LayoutList className='mt-0.5 size-5 text-neutral-500' />
									<div className='min-w-0 flex-1'>
										<div className='text-sm font-semibold'>
											Workspace layout
										</div>
										<div className='mt-1 text-sm text-neutral-500'>
											Choose whether this workspace opens
											in a Jira-style tab layout or a
											Notion-style block page.
										</div>

										<div className='mt-4 max-w-xs'>
											<Select
												value={
													workspace.layoutMode ??
													WorkspaceLayoutMode.TABS
												}
												onValueChange={
													handleUpdateLayoutMode
												}
												disabled={isUpdatingLayout}
											>
												<SelectTrigger className='w-full border-neutral-800 bg-neutral-950 text-neutral-100'>
													<SelectValue placeholder='Select layout' />
												</SelectTrigger>
												<SelectContent className='border-neutral-800 bg-neutral-950 text-neutral-100'>
													<SelectItem
														value={
															WorkspaceLayoutMode.TABS
														}
													>
														Tabs
													</SelectItem>
													<SelectItem
														value={
															WorkspaceLayoutMode.BLOCKS
														}
													>
														Blocks
													</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<div className='mt-3 text-xs text-neutral-500'>
											Tabs shows Summary and Pages. Blocks
											opens straight into the page block
											list.
										</div>
									</div>
								</div>
							</div>
						</div>
					) : null}

					{activeSection === "danger" ? (
						<div className='max-w-3xl space-y-4'>
							<div className='rounded-md border border-red-500/20 bg-red-500/5 p-5'>
								<div className='flex items-start gap-3'>
									<Lock className='mt-0.5 size-5 text-red-300' />
									<div className='min-w-0 flex-1'>
										<div className='text-sm font-semibold text-red-200'>
											Danger zone
										</div>
										<div className='mt-1 text-sm text-red-200/70'>
											Move this workspace to trash.
											Project deletion can be handled
											later.
										</div>
									</div>
									<button
										type='button'
										onClick={() => setOpenTrashDialog(true)}
										className='rounded-md border border-red-500/30 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/10'
									>
										Move to trash
									</button>
								</div>
							</div>

							<div className='rounded-md border border-neutral-800 bg-neutral-900/30 p-5'>
								<div className='mb-4 flex items-start justify-between gap-4'>
									<div>
										<div className='text-sm font-semibold'>
											Deleted projects
										</div>
										<div className='mt-1 text-sm text-neutral-500'>
											Restore projects that were soft-deleted in this workspace.
										</div>
									</div>
									<div className='rounded-full border border-neutral-700 px-2.5 py-1 text-xs text-neutral-400'>
										{deletedProjectItems.length} items
									</div>
								</div>

								{isDeletedProjectsLoading ? (
									<div className='text-sm text-neutral-500'>
										Loading deleted projects...
									</div>
								) : deletedProjectItems.length === 0 ? (
									<div className='rounded-md border border-dashed border-neutral-800 px-4 py-6 text-sm text-neutral-500'>
										Chua co project nao trong thung rac cua workspace nay.
									</div>
								) : (
									<div className='grid gap-3'>
										{deletedProjectItems.map((project) => (
											<div
												key={project.id}
												className='flex items-center justify-between gap-4 rounded-md border border-neutral-800 px-4 py-3'
											>
												<div className='min-w-0'>
													<div className='truncate text-sm font-medium text-neutral-100'>
														{project.name ?? "Untitled project"}
													</div>
													<div className='mt-1 text-xs text-neutral-500'>
														Deleted at {formatDeletedAt(project.deleted_at)}
													</div>
												</div>

												<Button
													variant='outline'
													size='sm'
													onClick={() => handleRestoreProject(project.id)}
													disabled={restoreProject.isPending}
													className='border-neutral-700 bg-transparent text-neutral-100 hover:bg-neutral-800'
												>
													<RotateCcw className='mr-2 h-4 w-4' />
													Restore
												</Button>
											</div>
										))}
									</div>
								)}
							</div>

							<div className='rounded-md border border-neutral-800 bg-neutral-900/30 p-5'>
								<div className='mb-4 flex items-start justify-between gap-4'>
									<div>
										<div className='text-sm font-semibold'>
											Deleted tasks
										</div>
										<div className='mt-1 text-sm text-neutral-500'>
											Restore tasks that were soft-deleted
											in this workspace.
										</div>
									</div>
									<div className='rounded-full border border-neutral-700 px-2.5 py-1 text-xs text-neutral-400'>
										{deletedTaskItems.length} items
									</div>
								</div>

								{isDeletedTasksLoading ? (
									<div className='text-sm text-neutral-500'>
										Loading deleted tasks...
									</div>
								) : deletedTaskItems.length === 0 ? (
									<div className='rounded-md border border-dashed border-neutral-800 px-4 py-6 text-sm text-neutral-500'>
										Chua co task nao trong thung rac cua
										workspace nay.
									</div>
								) : (
									<div className='grid gap-3'>
										{deletedTaskItems.map((task) => (
											<div
												key={task.id}
												className='flex items-center justify-between gap-4 rounded-md border border-neutral-800 px-4 py-3'
											>
												<div className='min-w-0'>
													<div className='truncate text-sm font-medium text-neutral-100'>
														{task.title ??
															"Untitled task"}
													</div>
													<div className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500'>
														<span>
															{task.projectSeq
																? `TM-${task.projectSeq}`
																: task.id.slice(
																		0,
																		8,
																	)}
														</span>
														{task.statusName ? (
															<span>
																Status:{" "}
																{
																	task.statusName
																}
															</span>
														) : null}
														{task.priorityName ? (
															<span>
																Priority:{" "}
																{
																	task.priorityName
																}
															</span>
														) : null}
														<span>
															Deleted at{" "}
															{formatDeletedAt(
																task.deletedAt,
															)}
														</span>
													</div>
												</div>

												<Button
													variant='outline'
													size='sm'
													onClick={() =>
														handleRestoreTask(
															task.id,
														)
													}
													disabled={
														restoreTask.isPending
													}
													className='border-neutral-700 bg-transparent text-neutral-100 hover:bg-neutral-800'
												>
													<RotateCcw className='mr-2 h-4 w-4' />
													Restore
												</Button>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					) : null}

					<div className='mt-8 flex items-center gap-2 text-xs text-neutral-600'>
						<Bell className='size-3.5' />
						Changes apply to this workspace only.
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
