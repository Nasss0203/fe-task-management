"use client";

import ProjectSidebarItem from "@/components/sidebar/user/ProjectSidebarItem";
import { useWorkspaceFeatures } from "@/features/workspace-feature/hooks/useWorkspaceFeatures";
import type { ProjectItems } from "@/services/project/type";
import type { WorkspaceItem } from "@/services/workspace/type";
import {
	SidebarMenuSubV2,
} from "@/components/sidebar/user/sidebar-custom";

type WorkspaceProjectsSubmenuProps = {
	workspace: WorkspaceItem;
	projects: ProjectItems[];
	handleSelectProject: (workspaceId: string, projectId: string) => void;
};

export function WorkspaceProjectsSubmenu({
	workspace,
	projects,
	handleSelectProject,
}: WorkspaceProjectsSubmenuProps) {
	const { canUseSprint } = useWorkspaceFeatures(workspace.id);

	return (
		<SidebarMenuSubV2 className=' w-full  pr-4'>
			{projects.map((project) => (
				<ProjectSidebarItem
					key={project.id}
					project={project}
					workspace={workspace}
					canUseSprint={canUseSprint}
					handleSelectProject={handleSelectProject}
				/>
			))}
		</SidebarMenuSubV2>
	);
}
