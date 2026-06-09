"use client";

import BacklogSprint from "@/components/backlog/BacklogSprint";
import Sprint from "@/components/spints/Sprint";
import { useSprints } from "@/features/sprint/hooks/useSprints";
import { useBoards } from "@/features/board/hooks/useBoards";
import { usePage } from "@/features/page/hooks/usePage";
import { BoardItem } from "@/services/board/type";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useParams } from "next/navigation";
import { useEffect } from "react";

const SprintPage = () => {
	const params = useParams<{
		slug: string;
		projectId: string;
		sprintId: string;
	}>();

	const projectId = params.projectId;
	const sprintId = params.sprintId;

	const {
		pages: { data: pageData },
	} = usePage();

	const workspaceId = pageData?.data?.workspace_id as string;

	const { setCurrentWorkspaceId, setCurrentProjectId } =
		useProjectSelectionStore();

	const { findBoard } = useBoards({
		workspaceId,
		projectId,
	});
	const { sprint } = useSprints({ projectId, sprintId, workspaceId });

	const sprintItem = sprint?.data;

	const boards: BoardItem[] = findBoard.data?.data ?? [];

	useEffect(() => {
		if (!workspaceId || !projectId) return;

		setCurrentWorkspaceId(workspaceId);
		setCurrentProjectId(projectId);
	}, [workspaceId, projectId, setCurrentWorkspaceId, setCurrentProjectId]);

	if (!workspaceId || !projectId || !sprintId) return null;

	return (
		<div className='flex h-full min-h-0 flex-1 flex-col overflow-hidden pb-4'>
			<div className='mb-4 shrink-0 px-1'>
				<h2 className='text-2xl font-bold tracking-tight text-foreground truncate'>
					{sprintItem?.name}
				</h2>
				<p className='text-sm font-medium text-muted-foreground truncate'>
					Lập kế hoạch sprint từ backlog và theo dõi tiến độ sprint
					hiện tại
				</p>
			</div>

			<div className='grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden 2xl:grid-cols-2'>
				<div className='flex min-h-0 flex-col overflow-hidden'>
					<BacklogSprint
						projectId={projectId}
						workspaceId={workspaceId}
					/>
				</div>

				<div className='flex min-h-0 flex-col overflow-hidden'>
					<Sprint
						boards={boards}
						projectId={projectId}
						workspaceId={workspaceId}
						sprintId={sprintId}
					/>
				</div>
			</div>
		</div>
	);
};

export default SprintPage;
