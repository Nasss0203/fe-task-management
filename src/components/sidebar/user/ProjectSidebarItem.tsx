"use client";

import { ChevronRight, BarChart2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";

import DialogAddTask from "@/components/dialog/DialogAddTask";
import ProjectDropdown from "@/features/project/components/project/ProjectDropdown";
import { useProject } from "@/features/project/hooks/useProject";
import { PERMISSIONS } from "@/constants/permissions";
import { RequirePermission } from "@/features/permission/components/RequirePermission";
import { useSprints } from "@/features/sprint/hooks/useSprint";
import type { ProjectItems } from "@/services/project/type";
import type { SprintItem } from "@/services/sprint/type";
import type { WorkspaceItem } from "@/services/workspace/type";
import { useProjectNameDraftStore } from "@/stores/use-project-name-draft";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { toast } from "sonner";
import {
	SidebarMenuSubButtonV2,
	SidebarMenuSubItemV2,
	SidebarMenuSubV2,
} from "./sidebar-custom";

type ProjectSidebarItemProps = {
	project: ProjectItems;
	workspace: WorkspaceItem;
	canUseSprint?: boolean;
	handleSelectProject: (workspaceId: string, projectId: string) => void;
};

const ProjectSidebarItem = ({
	project,
	workspace,
	canUseSprint = false,
	handleSelectProject,
}: ProjectSidebarItemProps) => {
	const pathname = usePathname();
	const { setCurrentProjectId } = useProjectSelectionStore();
	const projectId = project.id ?? "";
	const projectName = project.name ?? "Untitled project";
	const draftName = useProjectNameDraftStore(
		(state) => state.drafts[projectId],
	);
	const setDraft = useProjectNameDraftStore((state) => state.setDraft);
	const clearDraft = useProjectNameDraftStore((state) => state.clearDraft);
	const value = draftName ?? projectName;
	const [isEditingName, setIsEditingName] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const skipBlurRef = useRef(false);
	const ignoreBlurUntilRef = useRef(0);
	const isNameComposingRef = useRef(false);
	const { updateProject } = useProject(workspace.id);
	const projectHref = projectId
		? `/dashboard/${workspace.slug}/projects/${projectId}`
		: `/dashboard/${workspace.slug}`;
	const canFetchSprints = canUseSprint && Boolean(projectId);
	const { sprintsQuery } = useSprints({
		projectId,
		workspaceId: workspace.id,
		enabled: canFetchSprints,
	});

	const sprints: SprintItem[] = canFetchSprints
		? (sprintsQuery.data?.data ?? [])
		: [];

	useEffect(() => {
		if (!isEditingName) return;

		const frame = window.requestAnimationFrame(() => {
			inputRef.current?.focus();
			inputRef.current?.select();
		});

		return () => window.cancelAnimationFrame(frame);
	}, [isEditingName]);

	const startRenameProject = () => {
		if (!projectId) return;

		skipBlurRef.current = false;
		ignoreBlurUntilRef.current = Date.now() + 300;
		setDraft(projectId, value);
		setIsEditingName(true);
	};

	const cancelRenameProject = () => {
		if (!projectId) return;

		skipBlurRef.current = true;
		setDraft(projectId, projectName);
		setIsEditingName(false);
	};

	const commitRenameProject = async () => {
		if (!projectId) return;

		const name = value.trim();

		if (!name) {
			toast.error("Tên dự án không được để trống.");
			setDraft(projectId, projectName);
			inputRef.current?.focus();
			return;
		}

		if (name === projectName) {
			clearDraft(projectId);
			setIsEditingName(false);
			return;
		}

		try {
			await updateProject.mutateAsync({
				workspaceId: workspace.id,
				projectId,
				data: {
					name,
				},
			});

			clearDraft(projectId);
			setIsEditingName(false);
			toast.success("Đã đổi tên dự án.");
		} catch (error) {
			console.error("renameProjectFromSidebar failed", error);
			toast.error("Không thể đổi tên dự án.");
		}
	};

	return (
		<Collapsible asChild className='group/project'>
			<SidebarMenuSubItemV2>
				<div className='group/project-item relative flex items-center gap-1 rounded-md px-1 py-0.5 hover:bg-accent/50'>
					{canUseSprint ? (
						<CollapsibleTrigger asChild>
							<button
								type='button'
								className='z-10 flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground'
								onClick={() => setCurrentProjectId(projectId)}
							>
								<ChevronRight className='size-3 transition-transform duration-200 group-data-[state=open]/project:rotate-90' />
							</button>
						</CollapsibleTrigger>
					) : (
						<div className='size-5 shrink-0' />
					)}

					{isEditingName ? (
						<form
							className='h-7 min-w-0 flex-1 px-1 pr-14'
							onSubmit={(event) => {
								event.preventDefault();
								if (isNameComposingRef.current) {
									return;
								}

								void commitRenameProject();
							}}
						>
							<input
								ref={inputRef}
								value={value}
								disabled={updateProject.isPending}
								onChange={(event) =>
									setDraft(projectId, event.target.value)
								}
								onCompositionStart={() => {
									isNameComposingRef.current = true;
								}}
								onCompositionEnd={(event) => {
									isNameComposingRef.current = false;
									setDraft(projectId, event.currentTarget.value);
								}}
								onClick={(event) => event.stopPropagation()}
								onPointerDown={(event) =>
									event.stopPropagation()
								}
								onBlur={() => {
									if (isNameComposingRef.current) {
										return;
									}

									if (Date.now() < ignoreBlurUntilRef.current) {
										window.requestAnimationFrame(() => {
											inputRef.current?.focus();
										});
										return;
									}

									if (skipBlurRef.current) {
										skipBlurRef.current = false;
										return;
									}

									void commitRenameProject();
								}}
								onKeyDown={(event) => {
									if (
										event.nativeEvent.isComposing ||
										isNameComposingRef.current
									) {
										return;
									}

									if (event.key === "Escape") {
										event.preventDefault();
										cancelRenameProject();
									}
								}}
								className='h-6 w-full min-w-0 rounded border border-blue-500/60 bg-background px-2 text-sm text-foreground outline-none ring-2 ring-blue-500/20'
							/>
						</form>
					) : (
						<SidebarMenuSubButtonV2
							asChild
							isActive={pathname === projectHref}
							className='h-7 flex-1 justify-start px-1 pr-14 text-sm font-medium text-foreground hover:bg-transparent'
						>
							<Link
								href={projectHref}
								className='min-w-0'
								onClick={() => {
									if (!projectId) return;

									handleSelectProject(workspace.id, projectId);
								}}
							>
								<span className='line-clamp-1'>{value}</span>
							</Link>
						</SidebarMenuSubButtonV2>
					)}

					<div className='pointer-events-none absolute right-1 top-1/2 z-20 flex -translate-y-1/2 items-center gap-0.5 opacity-0 transition-opacity group-hover/project-item:pointer-events-auto group-hover/project-item:opacity-100 group-focus-within/project-item:pointer-events-auto group-focus-within/project-item:opacity-100'>
						<ProjectDropdown
							project={project}
							workspace={workspace}
							onRenameProject={startRenameProject}
						/>

						<RequirePermission
							workspaceId={workspace.id}
							code={PERMISSIONS.TASK_CREATE}
						>
							<DialogAddTask
								workspaceId={workspace.id}
								projectId={projectId}
								positionContext={
									projectId
										? {
												context: "backlog",
												contextId: projectId,
											}
										: undefined
								}
							></DialogAddTask>
						</RequirePermission>
					</div>
				</div>

				{canUseSprint ? (
					<CollapsibleContent>
						<SidebarMenuSubV2 className='mt-1 border-l border-border pl-3 mr-0'>
							{sprints.map((sprint) => {
								const sprintHref = `/dashboard/${workspace.slug}/projects/${projectId}/sprints/${sprint.id}`;

								return (
									<SidebarMenuSubItemV2 key={sprint.id}>
										<SidebarMenuSubButtonV2
											asChild
											isActive={pathname === sprintHref}
											className='h-7 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground'
										>
											<Link
												href={sprintHref}
												onClick={() =>
													handleSelectProject(
														workspace.id,
														projectId,
													)
												}
											>
												<span className='line-clamp-1'>
													{sprint.name}
												</span>
											</Link>
										</SidebarMenuSubButtonV2>
									</SidebarMenuSubItemV2>
								);
							})}

							<SidebarMenuSubItemV2>
								<SidebarMenuSubButtonV2
									asChild
									isActive={pathname === `/dashboard/${workspace.slug}/projects/${projectId}/reports`}
									className='h-7 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground'
								>
									<Link
										href={`/dashboard/${workspace.slug}/projects/${projectId}/reports`}
										onClick={() =>
											handleSelectProject(
												workspace.id,
												projectId,
											)
										}
									>
										<div className="flex items-center gap-1.5 w-full">
											<BarChart2 className="size-3.5 shrink-0" />
											<span className='line-clamp-1'>
												Reports
											</span>
										</div>
									</Link>
								</SidebarMenuSubButtonV2>
							</SidebarMenuSubItemV2>
						</SidebarMenuSubV2>
					</CollapsibleContent>
				) : null}
			</SidebarMenuSubItemV2>
		</Collapsible>
	);
};

export default ProjectSidebarItem;
