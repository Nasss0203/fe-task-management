"use client";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { findProjectByWorkspaceIdApi } from "@/services/project/project.service";
import { PROJECT_KEY } from "@/services/project/type";
import { WORKSPACE_KEY } from "@/services/workspace/type";
import { findAllWorkspaceApi } from "@/services/workspace/workspace.service";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useQueries, useQuery } from "@tanstack/react-query";
import { ChevronRight, Ellipsis } from "lucide-react";
import Link from "next/link";
import { DialogTask } from "../dialog";
import {
	PopoverContentV2,
	PopoverDescriptionV2,
	PopoverHeaderV2,
	PopoverTitleV2,
	PopoverTriggerV2,
	PopoverV2,
} from "../popover/popover-custom";
import { SidebarMenuButtonV2 } from "../sidebar";
import {
	SidebarGroupLabelV2,
	SidebarGroupV2,
	SidebarMenuItemV2,
	SidebarMenuSubButtonV2,
	SidebarMenuSubItemV2,
	SidebarMenuSubV2,
	SidebarMenuV2,
} from "../sidebar/sidebar-custom";

type WorkspaceItem = {
	id: string;
	name: string;
	slug: string;
};

type ProjectItem = {
	id: string;
	name: string;
};

export function NavMain() {
	const { setCurrentWorkspaceId, setCurrentProjectId } =
		useProjectSelectionStore();

	const workspaceQuery = useQuery({
		queryKey: [WORKSPACE_KEY.WORKSPACE],
		queryFn: findAllWorkspaceApi,
	});

	const workspaces: WorkspaceItem[] = workspaceQuery.data?.data ?? [];

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
		setCurrentWorkspaceId(workspaceId);
		setCurrentProjectId(projectId);
	};

	return (
		<SidebarGroupV2>
			<SidebarGroupLabelV2>Platform</SidebarGroupLabelV2>

			<SidebarMenuV2>
				{workspaces.map((workspace, index) => {
					const projects: ProjectItem[] =
						projectQueries[index]?.data?.data ?? [];

					return (
						<Collapsible
							key={workspace.id}
							asChild
							className='group/collapsible'
						>
							<SidebarMenuItemV2>
								<SidebarMenuButtonV2
									tooltip={workspace.name}
									variant='default'
								>
									<CollapsibleTrigger
										asChild
										className='hover:bg-neutral-700 rounded-xs mr-1'
										onClick={() =>
											handleSelectWorkspace(workspace.id)
										}
									>
										<ChevronRight className='transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
									</CollapsibleTrigger>

									<Link
										href={`/dashboard/${workspace.slug}`}
										onClick={() =>
											handleSelectWorkspace(workspace.id)
										}
										className='flex-1 min-w-0'
									>
										<span className='line-clamp-1'>
											{workspace.name}
										</span>
									</Link>

									<PopoverV2>
										<PopoverTriggerV2
											asChild
											className='hover:bg-neutral-700 rounded-xs ml-auto'
										>
											<Ellipsis size={12} />
										</PopoverTriggerV2>

										<PopoverContentV2
											align='start'
											side='right'
											sideOffset={15}
										>
											<PopoverHeaderV2>
												<PopoverTitleV2>
													Trang
												</PopoverTitleV2>
												<PopoverDescriptionV2>
													Description text here.
												</PopoverDescriptionV2>
											</PopoverHeaderV2>
										</PopoverContentV2>
									</PopoverV2>

									<DialogTask />
								</SidebarMenuButtonV2>

								<CollapsibleContent>
									<SidebarMenuSubV2>
										{projects.map((project) => (
											<SidebarMenuSubItemV2
												key={project.id}
											>
												<SidebarMenuSubButtonV2 asChild>
													<Link
														href={`/dashboard/${workspace.slug}/${project.id}`}
														onClick={() =>
															handleSelectProject(
																workspace.id,
																project.id,
															)
														}
													>
														<span>
															{project.name}
														</span>
													</Link>
												</SidebarMenuSubButtonV2>
											</SidebarMenuSubItemV2>
										))}
									</SidebarMenuSubV2>
								</CollapsibleContent>
							</SidebarMenuItemV2>
						</Collapsible>
					);
				})}
			</SidebarMenuV2>
		</SidebarGroupV2>
	);
}
