"use client";

import BacklogSprint from "@/components/backlog/BacklogSprint";
import Sprint from "@/components/spints/Sprint";
import { useBoards } from "@/hooks/use-board";
import { usePage } from "@/hooks/use-page";
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

	const workspaceId = pageData?.data?.workspace_id;

	const { setCurrentWorkspaceId, setCurrentProjectId } =
		useProjectSelectionStore();

	const { findBoard } = useBoards({
		workspaceId,
		projectId,
	});

	const boards: BoardItem[] = findBoard.data?.data ?? [];

	useEffect(() => {
		if (!workspaceId || !projectId) return;

		setCurrentWorkspaceId(workspaceId);
		setCurrentProjectId(projectId);
	}, [workspaceId, projectId, setCurrentWorkspaceId, setCurrentProjectId]);

	if (!workspaceId || !projectId || !sprintId) return null;

	return (
		<div className='flex h-screen flex-col overflow-hidden'>
			<div className='mb-6 flex shrink-0 flex-col gap-1'>
				<h2 className='text-2xl font-bold tracking-tight text-white'>
					Sprint Planning
				</h2>
				<p className='text-sm font-medium text-slate-400'>
					Lập kế hoạch sprint từ backlog và theo dõi tiến độ sprint
					hiện tại
				</p>
			</div>

			<div className='grid min-h-0 flex-1 grid-cols-12 gap-5'>
				<BacklogSprint />

				<Sprint
					boards={boards}
					projectId={projectId}
					workspaceId={workspaceId}
					sprintId={sprintId}
				/>
			</div>
		</div>
	);
};

export default SprintPage;
