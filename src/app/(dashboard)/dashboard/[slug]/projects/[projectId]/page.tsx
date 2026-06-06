"use client";

import { ProjectBlock } from "@/components/block";
import type { AvailableTabItem } from "@/components/block/ProjectBlock";
import {
	BOARD_VIEW_CONFIG,
	isBoardViewEnabled,
} from "@/components/board/view-board";
import { useBoards } from "@/features/board/hooks/useBoards";
import { usePage } from "@/features/page/hooks/usePage";
import { useWorkspaceFeatures } from "@/features/workspace-feature/hooks/useWorkspaceFeatures";
import { BoardItem, BoardViewType } from "@/services/board/type";
import { normalizeDatabaseViewConfig } from "@/services/page_block/type";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const RestPage = () => {
	const params = useParams<{
		slug: string;
		projectId: string;
	}>();

	const projectId = params.projectId;

	const {
		pages: { data: pageData },
	} = usePage();

	const page = pageData?.data;
	const workspaceId = page?.workspace_id;

	const blockId = page?.blocks?.find((block) => {
		const config = normalizeDatabaseViewConfig(block.data_config);
		return config?.project_id === projectId;
	})?.id;

	const { setCurrentProjectId, setCurrentBoardId } =
		useProjectSelectionStore();

	const [activeTab, setActiveTab] = useState<BoardViewType>(
		BoardViewType.BOARD,
	);

	const { findBoard } = useBoards({
		workspaceId,
		projectId,
	});
	const { canUseSprint } = useWorkspaceFeatures(workspaceId);

	const boards = useMemo<BoardItem[]>(
		() => findBoard.data?.data ?? [],
		[findBoard.data?.data],
	);

	const availableTabs = useMemo<AvailableTabItem[]>(() => {
		return boards
			.filter((board) => {
				return isBoardViewEnabled(board.viewType, {
					canUseSprint,
				});
			})
			.map((board) => {
				const config = BOARD_VIEW_CONFIG[board.viewType]!;

				return {
					icon: config.icon,
					type: config.label,
					value: board.viewType,
					boardId: board.id,
				};
			});
	}, [boards, canUseSprint]);

	const activeTabValue = availableTabs.some((tab) => tab.value === activeTab)
		? activeTab
		: (availableTabs[0]?.value ?? activeTab);

	const activeBoard = useMemo(() => {
		return boards.find((board) => board.viewType === activeTabValue);
	}, [boards, activeTabValue]);

	useEffect(() => {
		if (!activeBoard?.id) return;
		setCurrentProjectId(projectId);
		setCurrentBoardId(activeBoard.id);
	}, [activeBoard?.id, projectId, setCurrentBoardId, setCurrentProjectId]);

	if (!workspaceId || !projectId) return null;

	return (
		<div className='flex flex-col gap-5'>
			<div className='text-2xl font-medium'>{page.title}</div>
			<div className='min-h-0 flex-1 overflow-y-auto px-10 pb-10'>
				<ProjectBlock
					context='project'
					blockId={blockId}
					projectId={projectId}
					workspaceId={workspaceId}
					activeTab={activeTabValue}
					availableTabs={availableTabs}
					boards={boards}
					activeBoard={activeBoard}
					setActiveTab={setActiveTab}
				/>
			</div>
		</div>
	);
};

export default RestPage;
