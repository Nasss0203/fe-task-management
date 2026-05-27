"use client";

import DialogAddWorkspace from "@/components/dialog/DialogAddWorkspace";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";

import ProjectSidebarItem from "@/components/sidebar/user/ProjectSidebarItem";
import WorkspaceDropdown from "@/components/workspaces/DropdownWorkspace";
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace";
import { findProjectByWorkspaceIdApi } from "@/services/project/project.service";

import { PROJECT_KEY, type ProjectItems } from "@/services/project/type";

import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useQueries } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { DialogTask } from "../../dialog";
import SidebarMenuButtonV2 from "../../sidebar/user/button-sidebar";
import {
	SidebarGroupLabelV2,
	SidebarGroupV2,
	SidebarMenuItemV2,
	SidebarMenuSubButtonV2,
	SidebarMenuSubV2,
	SidebarMenuV2,
} from "../../sidebar/user/sidebar-custom";

type WorkspaceItem = {
	id: string;
	name: string;
	slug: string;
};

export function NavMain() {
	const { setCurrentWorkspaceId, setCurrentProjectId } =
		useProjectSelectionStore();

	const {
		createWorkspace: { mutate },
		workspaceFindAll: { data: workspaceQuery },
	} = useWorkspace();

	const workspaces: WorkspaceItem[] = workspaceQuery?.data ?? [];

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

	return (
		<SidebarGroupV2>
			<SidebarGroupLabelV2>Workspace</SidebarGroupLabelV2>
			<SidebarMenuV2>
				{workspaces.map((workspace, index) => {
					const projects: ProjectItems[] =
						projectQueries[index]?.data?.data ?? [];

					return (
						<Collapsible
							asChild
							className='group/collapsible'
							key={workspace.id}
						>
							<SidebarMenuItemV2>
								<SidebarMenuButtonV2
									tooltip={workspace.name}
									variant='default'
									className='group/workspace-item relative pr-14'
								>
									<CollapsibleTrigger asChild>
										<div
											className='mr-1 cursor-pointer flex size-5 shrink-0 items-center justify-center rounded-sm text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100'
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
											handleSelectWorkspace(workspace.id)
										}
										className='min-w-0 flex-1'
									>
										<span className='line-clamp-1'>
											{workspace.name}
										</span>
									</Link>

									<div className='pointer-events-none absolute right-1 top-1/2 z-20 flex -translate-y-1/2 items-center gap-1 opacity-0 transition-opacity group-hover/workspace-item:pointer-events-auto group-hover/workspace-item:opacity-100 group-focus-within/workspace-item:pointer-events-auto group-focus-within/workspace-item:opacity-100'>
										<WorkspaceDropdown></WorkspaceDropdown>

										<DialogTask
											workspaceId={workspace.id}
											workspaceName={workspace.name}
										/>
									</div>
								</SidebarMenuButtonV2>

								<CollapsibleContent>
									<SidebarMenuSubV2 className=' w-full  pr-4'>
										{projects.map((project: any) => (
											<ProjectSidebarItem
												key={project.id}
												project={project}
												workspace={workspace}
												handleSelectProject={
													handleSelectProject
												}
											/>
										))}
									</SidebarMenuSubV2>
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
