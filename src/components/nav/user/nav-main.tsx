"use client";

import DialogAddWorkspace from "@/components/dialog/DialogAddWorkspace";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";

import ProjectSidebarItem from "@/components/sidebar/user/ProjectSidebarItem";
import { useWorkspaceFeatures } from "@/features/workspace-feature/hooks/useWorkspaceFeatures";
import WorkspaceDropdown from "@/features/workspace/components/workspaces/DropdownWorkspace";
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace";
import { findProjectByWorkspaceIdApi } from "@/services/project/project.service";
import { PROJECT_KEY, type ProjectItems } from "@/services/project/type";
import type { WorkspaceItem } from "@/services/workspace/type";
import { useWorkspaceNameDraftStore } from "@/stores/use-workspace-name-draft";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useQueries } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DialogCreateProject } from "../../dialog";
import { RequirePermission } from "@/features/permission/components/RequirePermission";
import { PERMISSIONS } from "@/constants/permissions";
import SidebarMenuButtonV2 from "../../sidebar/user/button-sidebar";
import {
	SidebarGroupLabelV2,
	SidebarGroupV2,
	SidebarMenuItemV2,
	SidebarMenuSubButtonV2,
	SidebarMenuSubV2,
	SidebarMenuV2,
} from "../../sidebar/user/sidebar-custom";
import { WorkspaceProjectsSubmenu } from "./WorkspaceProjectsSubmenu";


export function NavMain() {
	const pathname = usePathname();
	const { setCurrentWorkspaceId, setCurrentProjectId } =
		useProjectSelectionStore();
	const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(
		null,
	);
	const renameInputRef = useRef<HTMLInputElement>(null);
	const skipRenameBlurRef = useRef(false);
	const isRenameComposingRef = useRef(false);
	const workspaceNameDrafts = useWorkspaceNameDraftStore(
		(state) => state.drafts,
	);
	const setWorkspaceNameDraft = useWorkspaceNameDraftStore(
		(state) => state.setDraft,
	);
	const clearWorkspaceNameDraft = useWorkspaceNameDraftStore(
		(state) => state.clearDraft,
	);

	const {
		workspaceFindAll: { data: workspaceQuery },
		updateWorkspace,
	} = useWorkspace();

	const workspaces: WorkspaceItem[] = workspaceQuery?.data ?? [];

	useEffect(() => {
		if (!editingWorkspaceId) return;

		const frame = window.requestAnimationFrame(() => {
			renameInputRef.current?.focus();
			renameInputRef.current?.select();
		});

		return () => window.cancelAnimationFrame(frame);
	}, [editingWorkspaceId]);

	const projectQueries = useQueries({
		queries: workspaces.map((workspace) => ({
			queryKey: [PROJECT_KEY.PROJECT, workspace.id],
			queryFn: () => findProjectByWorkspaceIdApi(workspace.id),
			enabled: !!workspace.id,
		})),
	});

	const handleSelectWorkspace = (workspaceId: string) => {
		setCurrentWorkspaceId(workspaceId);
		setCurrentProjectId(null);
	};

	const handleSelectProject = (workspaceId: string, projectId: string) => {
		const state = useProjectSelectionStore.getState();

		const isSameWorkspace = state.currentWorkspaceId === workspaceId;
		const isSameProject = state.currentProjectId === projectId;

		if (!isSameWorkspace) {
			state.setCurrentWorkspaceId(workspaceId);
		}

		if (!isSameProject) {
			state.setCurrentProjectId(projectId);
		}
	};

	const startRenameWorkspace = (workspace: WorkspaceItem) => {
		skipRenameBlurRef.current = false;
		setEditingWorkspaceId(workspace.id);
		setWorkspaceNameDraft(
			workspace.id,
			workspaceNameDrafts[workspace.id] ?? workspace.name,
		);
	};

	const cancelRenameWorkspace = () => {
		skipRenameBlurRef.current = true;
		if (editingWorkspaceId) {
			clearWorkspaceNameDraft(editingWorkspaceId);
		}
		setEditingWorkspaceId(null);
	};

	const commitRenameWorkspace = async (workspace: WorkspaceItem) => {
		const name = (
			workspaceNameDrafts[workspace.id] ?? workspace.name
		).trim();

		if (!editingWorkspaceId) return;

		if (!name) {
			toast.error("Tên không gian làm việc không được để trống.");
			setWorkspaceNameDraft(workspace.id, workspace.name);
			renameInputRef.current?.focus();
			return;
		}

		if (name === workspace.name) {
			clearWorkspaceNameDraft(workspace.id);
			cancelRenameWorkspace();
			return;
		}

		try {
			await updateWorkspace.mutateAsync({
				workspaceId: workspace.id,
				data: {
					name,
				},
			});

			toast.success("Đã đổi tên không gian làm việc.");
			clearWorkspaceNameDraft(workspace.id);
			cancelRenameWorkspace();
		} catch (error) {
			console.error("renameWorkspaceInline failed", error);
			toast.error("Không thể đổi tên không gian làm việc.");
		}
	};

	return (
		<SidebarGroupV2>
			<SidebarGroupLabelV2>Workspace</SidebarGroupLabelV2>
			<SidebarMenuV2>
				{workspaces.map((workspace, index) => {
					const projects: ProjectItems[] =
						projectQueries[index]?.data?.data ?? [];
					const workspaceName =
						workspaceNameDrafts[workspace.id] ?? workspace.name;
					const isEditingWorkspace =
						editingWorkspaceId === workspace.id;

					return (
						<Collapsible
							asChild
							className='group/collapsible'
							key={workspace.id}
						>
							<SidebarMenuItemV2>
								{isEditingWorkspace ? (
									<div className='group/workspace-item relative flex h-8 w-full items-center gap-1 overflow-hidden rounded-md border border-neutral-200 bg-white p-2 pr-2 text-left text-sm dark:border-none dark:bg-sidebar-accent dark:text-sidebar-accent-foreground'>
										<CollapsibleTrigger asChild>
											<div
												className='mr-1 cursor-pointer flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:hover:bg-accent hover:text-accent-foreground hover:hover:text-foreground'
												onClick={(e) => {
													e.stopPropagation();
													handleSelectWorkspace(
														workspace.id,
													);
													setCurrentWorkspaceId(
														workspace.id,
													);
												}}
											>
												<ChevronRight className='size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
											</div>
										</CollapsibleTrigger>

										<form
											className='min-w-0 flex-1'
											onSubmit={(event) => {
												event.preventDefault();
												if (isRenameComposingRef.current) {
													return;
												}

												void commitRenameWorkspace(
													workspace,
												);
											}}
										>
											<input
												ref={renameInputRef}
												value={workspaceName}
												disabled={
													updateWorkspace.isPending
												}
												onChange={(event) =>
													setWorkspaceNameDraft(
														workspace.id,
														event.target.value,
													)
												}
												onCompositionStart={() => {
													isRenameComposingRef.current = true;
												}}
												onCompositionEnd={(event) => {
													isRenameComposingRef.current = false;
													setWorkspaceNameDraft(
														workspace.id,
														event.currentTarget.value,
													);
												}}
												onClick={(event) =>
													event.stopPropagation()
												}
												onPointerDown={(event) =>
													event.stopPropagation()
												}
												onBlur={() => {
													if (isRenameComposingRef.current) {
														return;
													}

													if (
														skipRenameBlurRef.current
													) {
														skipRenameBlurRef.current =
															false;
														return;
													}

													void commitRenameWorkspace(
														workspace,
													);
												}}
												onKeyDown={(event) => {
													if (
														event.nativeEvent.isComposing ||
														isRenameComposingRef.current
													) {
														return;
													}

													if (
														event.key === "Escape"
													) {
														event.preventDefault();
														cancelRenameWorkspace();
													}
												}}
												className='h-6 w-full min-w-0 rounded border border-blue-500/60 bg-background px-2 text-sm text-foreground outline-none ring-2 ring-blue-500/20'
											/>
										</form>
									</div>
								) : (
									<SidebarMenuButtonV2
										asChild
										tooltip={workspaceName}
										variant='default'
										isActive={pathname === `/dashboard/${workspace.slug}`}
										className='group/workspace-item relative pr-14'
									>
										<div>
											<CollapsibleTrigger asChild>
												<div
													className='mr-1 cursor-pointer flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:hover:bg-accent hover:text-accent-foreground hover:hover:text-foreground'
													onClick={(e) => {
														e.stopPropagation();
														handleSelectWorkspace(
															workspace.id,
														);
														setCurrentWorkspaceId(
															workspace.id,
														);
													}}
												>
													<ChevronRight className='size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
												</div>
											</CollapsibleTrigger>

											<Link
												href={`/dashboard/${workspace.slug}`}
												onClick={() =>
													handleSelectWorkspace(
														workspace.id,
													)
												}
												className='min-w-0 flex-1'
											>
												<span className='line-clamp-1'>
													{workspaceName}
												</span>
											</Link>

											<div className='pointer-events-none absolute right-1 top-1/2 z-20 flex -translate-y-1/2 items-center gap-1 opacity-0 transition-opacity group-hover/workspace-item:pointer-events-auto group-hover/workspace-item:opacity-100 group-focus-within/workspace-item:pointer-events-auto group-focus-within/workspace-item:opacity-100'>
												<WorkspaceDropdown
													workspace={workspace}
													onStartRename={() =>
														startRenameWorkspace(
															workspace,
														)
													}
												/>

												<RequirePermission
													workspaceId={workspace.id}
													code={PERMISSIONS.PROJECT_CREATE}
													mode="hide"
												>
													<DialogCreateProject
														workspaceId={workspace.id}
														workspaceName={
															workspace.name
														}
													/>
												</RequirePermission>
											</div>
										</div>
									</SidebarMenuButtonV2>
								)}

								<CollapsibleContent>
									<WorkspaceProjectsSubmenu
										workspace={workspace}
										projects={projects}
										handleSelectProject={
											handleSelectProject
										}
									/>
								</CollapsibleContent>
							</SidebarMenuItemV2>
						</Collapsible>
					);
				})}
				<SidebarMenuSubButtonV2>
					<DialogAddWorkspace></DialogAddWorkspace>
				</SidebarMenuSubButtonV2>
			</SidebarMenuV2>
		</SidebarGroupV2>
	);
}
