"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { useSprints } from "@/hooks/use-sprint";
import {
	SidebarMenuSubButtonV2,
	SidebarMenuSubItemV2,
	SidebarMenuSubV2,
} from "./sidebar-custom";

type ProjectSidebarItemProps = {
	project: any;
	workspace: any;
	handleSelectProject: (workspaceId: string, projectId: string) => void;
};

const ProjectSidebarItem = ({
	project,
	workspace,
	handleSelectProject,
}: ProjectSidebarItemProps) => {
	const { sprintsQuery } = useSprints({
		projectId: project.id,
		workspaceId: workspace.id,
	});

	const sprints = sprintsQuery.data?.data ?? [];

	const projectHref = `/dashboard/${workspace.slug}/projects/${project.id}`;

	return (
		<Collapsible asChild className='group/project'>
			<SidebarMenuSubItemV2>
				<div className='flex items-center gap-1 rounded-md px-1 py-0.5 hover:bg-neutral-800/80'>
					{sprints.length > 0 ? (
						<CollapsibleTrigger asChild>
							<button
								type='button'
								className='flex size-5 shrink-0 items-center justify-center rounded-sm hover:bg-neutral-700'
							>
								<ChevronRight className='size-3 transition-transform duration-200 group-data-[state=open]/project:rotate-90' />
							</button>
						</CollapsibleTrigger>
					) : (
						<div className='size-5 shrink-0' />
					)}

					<SidebarMenuSubButtonV2
						asChild
						className='h-7 flex-1 justify-start px-1 text-sm font-medium text-neutral-100 hover:bg-transparent'
					>
						<Link
							href={projectHref}
							className='min-w-0'
							onClick={() =>
								handleSelectProject(workspace.id, project.id)
							}
						>
							<span className='line-clamp-1'>{project.name}</span>
						</Link>
					</SidebarMenuSubButtonV2>
				</div>

				<CollapsibleContent>
					<SidebarMenuSubV2 className='mt-1 border-l border-neutral-700/80 pl-3'>
						{sprints.map((sprint: any) => {
							const sprintHref = `/dashboard/${workspace.slug}/projects/${project.id}/sprints/${sprint.id}`;

							return (
								<SidebarMenuSubItemV2 key={sprint.id}>
									<SidebarMenuSubButtonV2
										asChild
										className='h-7 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'
									>
										<Link
											href={sprintHref}
											onClick={() =>
												handleSelectProject(
													workspace.id,
													project.id,
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
					</SidebarMenuSubV2>
				</CollapsibleContent>
			</SidebarMenuSubItemV2>
		</Collapsible>
	);
};

export default ProjectSidebarItem;
