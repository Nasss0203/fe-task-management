"use client";

import { useProjectSelectionStore } from "@/stores/use-project-selection";
import BacklogProjectView from "./BacklogProjectView";
import BacklogWorkspaceView from "./BacklogWorkspaceView";
import type { BacklogRenderContext } from "./types";

type BacklogBoardProps = {
	context?: BacklogRenderContext;
	boardId?: string;
};

const BacklogBoard = ({ context = "workspace" }: BacklogBoardProps) => {
	const { currentProjectId, currentWorkspaceId } = useProjectSelectionStore();
	const workspaceId = currentWorkspaceId as string;
	const projectId = currentProjectId as string;

	if (context === "project") {
		return (
			<BacklogProjectView
				workspaceId={workspaceId}
				projectId={projectId}
			/>
		);
	}

	return (
		<BacklogWorkspaceView workspaceId={workspaceId} projectId={projectId} />
	);
};

export default BacklogBoard;
