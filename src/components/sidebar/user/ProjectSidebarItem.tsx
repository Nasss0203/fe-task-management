"use client";

import { ChevronRight, BarChart2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";

import DialogAddTask from "@/components/dialog/DialogAddTask";
import ProjectDropdown from "@/features/project/components/project/ProjectDropdown";
import { PERMISSIONS } from "@/constants/permissions";
import { RequirePermission } from "@/features/permission/components/RequirePermission";
import { useSprints } from "@/features/sprint/hooks/useSprint";
import type { ProjectItems } from "@/services/project/type";
import type { SprintItem } from "@/services/sprint/type";
import type { WorkspaceItem } from "@/services/workspace/type";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
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
	const canFetchSprints = canUseSprint && Boolean(projectId);
	const { sprintsQuery } = useSprints({
		projectId,
		workspaceId: workspace.id,
		enabled: canFetchSprints,
	});

	const sprints: SprintItem[] = canFetchSprints
		? (sprintsQuery.data?.data ?? [])
		: [];

	const projectHref = projectId
		? `/dashboard/${workspace.slug}/projects/${projectId}`
		: `/dashboard/${workspace.slug}`;

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
							<span className='line-clamp-1'>
								{projectName}
							</span>
						</Link>
					</SidebarMenuSubButtonV2>

					<div className='pointer-events-none absolute right-1 top-1/2 z-20 flex -translate-y-1/2 items-center gap-0.5 opacity-0 transition-opacity group-hover/project-item:pointer-events-auto group-hover/project-item:opacity-100 group-focus-within/project-item:pointer-events-auto group-focus-within/project-item:opacity-100'>
						<ProjectDropdown
							project={project}
							workspace={workspace}
						/>

						<RequirePermission
							workspaceId={workspace.id}
							code={PERMISSIONS.TASK_CREATE}
						>
							<DialogAddTask></DialogAddTask>
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
