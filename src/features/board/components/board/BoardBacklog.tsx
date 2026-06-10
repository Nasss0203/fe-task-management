"use client";

import { useProjectSelectionStore } from "@/stores/use-project-selection";
import ProjectBacklogView from "@/features/sprint/components/backlog/ProjectBacklogView";
import WorkspaceBacklogView from "@/features/sprint/components/backlog/WorkspaceBacklogView";

export const BacklogViewType = {
	WORKSPACE: "workspace",
	PROJECT: "project",
} as const;

export type BacklogRenderContext =
	(typeof BacklogViewType)[keyof typeof BacklogViewType];

type BoardBacklogProps = {
	context?: BacklogRenderContext;
	boardId?: string;
};

const BoardBacklog = ({
	context = BacklogViewType.PROJECT,
}: BoardBacklogProps) => {
	const { currentProjectId, currentWorkspaceId } = useProjectSelectionStore();

	const workspaceId = currentWorkspaceId;
	const projectId = currentProjectId;

	if (!workspaceId || !projectId) {
		return null;
	}

	if (context === BacklogViewType.PROJECT) {
		return (
			<ProjectBacklogView
				workspaceId={workspaceId}
				projectId={projectId}
			/>
		);
	}

	return (
		<WorkspaceBacklogView workspaceId={workspaceId} projectId={projectId} />
	);
};

export default BoardBacklog;
