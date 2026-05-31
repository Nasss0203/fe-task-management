"use client";

import ProjectBlock, {
	AvailableTabItem,
} from "@/components/block/ProjectBlock";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useEffect, useMemo, useState } from "react";

import { useBoards } from "@/features/board/hooks/useBoards";
import { BoardItem, BoardViewType } from "@/services/board/type";
import { PageBlockDataConfig } from "@/services/page_block/type";
import { BacklogRenderContext } from "../backlog/types";
import { BOARD_VIEW_CONFIG } from "../board/view-board";

type Props = {
	blockId: string;
	projectId: string;
	workspaceId: string;
	config: PageBlockDataConfig;
	title?: string;
	isOpen?: boolean;
	context?: BacklogRenderContext;
};

const ProjectBlockContainer = ({
	projectId,
	blockId,
	workspaceId,
	config,
	title,
	isOpen,
	context = "workspace",
}: Props) => {
	const { setCurrentProjectId, setCurrentBoardId } =
		useProjectSelectionStore();

	const [activeTab, setActiveTab] = useState<BoardViewType>(
		config.default_view_type ?? BoardViewType.BOARD,
	);

	const { findBoard } = useBoards({
		workspaceId,
		projectId,
	});

	const boards: BoardItem[] = findBoard.data?.data ?? [];

	const availableTabs = useMemo<AvailableTabItem[]>(() => {
		return boards.reduce<AvailableTabItem[]>((acc, board) => {
			const viewConfig = BOARD_VIEW_CONFIG[board.viewType];

			if (!viewConfig?.enabled) return acc;

			acc.push({
				icon: viewConfig.icon,
				type: viewConfig.label,
				value: board.viewType,
				boardId: board.id,
			});

			return acc;
		}, []);
	}, [boards]);

	const activeBoard = useMemo(() => {
		return boards.find((board) => board.viewType === activeTab);
	}, [boards, activeTab]);

	useEffect(() => {
		if (!config.default_board_id) return;

		const defaultBoard = boards.find(
			(board) => board.id === config.default_board_id,
		);

		if (defaultBoard) {
			setActiveTab(defaultBoard.viewType);
			return;
		}

		setActiveTab(config.default_view_type ?? BoardViewType.BOARD);
	}, [boards, config.default_board_id, config.default_view_type]);

	useEffect(() => {
		if (!availableTabs.length) return;

		const isValid = availableTabs.some((tab) => tab.value === activeTab);

		if (!isValid) {
			setActiveTab(availableTabs[0].value);
		}
	}, [availableTabs, activeTab]);

	useEffect(() => {
		if (!activeBoard) return;

		setCurrentProjectId(projectId);
		setCurrentBoardId(activeBoard.id);
	}, [projectId, activeBoard, setCurrentProjectId, setCurrentBoardId]);

	return (
		<ProjectBlock
			blockId={blockId}
			title={title}
			isOpen={isOpen}
			boards={boards}
			projectId={projectId}
			workspaceId={workspaceId}
			activeTab={activeTab}
			availableTabs={availableTabs}
			activeBoard={activeBoard}
			setActiveTab={setActiveTab}
			context={context}
		/>
	);
};

export default ProjectBlockContainer;
