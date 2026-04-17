"use client";

import { ProjectBlock } from "@/components/block";
import { BoardItem, BoardViewType } from "@/components/board/board.type";
import { BOARD_VIEW_CONFIG } from "@/components/board/view-board";
import { findAllBoard } from "@/services/board/board.service";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

const RestPage = () => {
	const { currentWorkspaceId, currentProjectId, setCurrentBoardId } =
		useProjectSelectionStore();

	const workspaceId = currentWorkspaceId;
	const projectId = currentProjectId;

	const [activeTab, setActiveTab] = useState<BoardViewType>(
		BoardViewType.BOARD,
	);

	const allBoard = useQuery({
		queryKey: ["boards", workspaceId, projectId],
		queryFn: () => findAllBoard(workspaceId!, projectId!),
		enabled: !!workspaceId && !!projectId,
	});

	const boards: BoardItem[] = allBoard.data?.data ?? [];

	const availableTabs = useMemo(() => {
		return boards
			.filter((board) => {
				const config = BOARD_VIEW_CONFIG[board.viewType];
				return config?.enabled;
			})
			.map((board) => {
				const config = BOARD_VIEW_CONFIG[board.viewType]!;

				return {
					icon: config.icon,
					type: config.label,
					value: board.viewType,
				};
			});
	}, [boards]);

	useEffect(() => {
		if (!availableTabs.length) return;

		const isActiveTabValid = availableTabs.some(
			(tab) => tab.value === activeTab,
		);

		if (!isActiveTabValid) {
			setActiveTab(availableTabs[0].value);
		}
	}, [availableTabs, activeTab]);

	const activeBoard = useMemo(() => {
		return boards.find((board) => board.viewType === activeTab);
	}, [boards, activeTab]);

	useEffect(() => {
		if (!activeBoard?.id) return;
		setCurrentBoardId(activeBoard.id);
	}, [activeBoard?.id, setCurrentBoardId]);

	if (!workspaceId || !projectId) return null;

	return (
		<div className='px-20'>
			<ProjectBlock
				projectId={projectId}
				workspaceId={workspaceId}
				activeTab={activeTab}
				availableTabs={availableTabs}
				boards={boards}
				activeBoard={activeBoard}
				setActiveTab={setActiveTab}
			/>
		</div>
	);
};

export default RestPage;
