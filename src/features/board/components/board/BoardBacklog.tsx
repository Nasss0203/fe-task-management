"use client";

import ProjectBacklogView from "@/features/sprint/components/backlog/ProjectBacklogView";

export const BacklogViewType = {
	WORKSPACE: "workspace",
	PROJECT: "project",
} as const;

export type BacklogRenderContext =
	(typeof BacklogViewType)[keyof typeof BacklogViewType];

type BoardBacklogProps = {
	context?: BacklogRenderContext;
	boardId?: string;
	workspaceId: string;
	projectId: string;
};

const BoardBacklog = ({
	context = BacklogViewType.PROJECT,
	workspaceId,
	projectId,
}: BoardBacklogProps) => {
	if (!workspaceId || !projectId) {
		return null;
	}

	if (context === BacklogViewType.WORKSPACE) {
		return (
			<ProjectBacklogView
				workspaceId={workspaceId}
				projectId={projectId}
			/>
		);
	}

	return (
		<ProjectBacklogView
			workspaceId={workspaceId}
			projectId={projectId}
		/>
	);
};

export default BoardBacklog;
