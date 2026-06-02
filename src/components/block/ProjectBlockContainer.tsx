"use client";

import ProjectBlock, {
	AvailableTabItem,
} from "@/components/block/ProjectBlock";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useBoards } from "@/features/board/hooks/useBoards";
import { useWorkspaceFeatures } from "@/features/workspace-feature/hooks/useWorkspaceFeatures";
import { BoardItem, BoardViewType } from "@/services/board/type";
import { PageBlockDataConfig } from "@/services/page_block/type";
import { BacklogRenderContext } from "../backlog/types";
import { BOARD_VIEW_CONFIG } from "../board/view-board";

type Props = {
	blockId?: string;
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

	const [selectedTabState, setSelectedTabState] = useState<{
		projectId: string;
		value: BoardViewType | null;
	}>(() => ({
		projectId,
		value: null,
	}));

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
		return boards.reduce<AvailableTabItem[]>((acc, board) => {
			const viewConfig = BOARD_VIEW_CONFIG[board.viewType];

			if (!viewConfig?.enabled) return acc;
			if (
				board.viewType === BoardViewType.BACKLOG &&
				!canUseSprint
			) {
				return acc;
			}

			acc.push({
				icon: viewConfig.icon,
				type: viewConfig.label,
				value: board.viewType,
				boardId: board.id,
			});

			return acc;
		}, []);
	}, [boards, canUseSprint]);

	const defaultTab = useMemo(() => {
		const defaultBoard = config.default_board_id
			? boards.find((board) => board.id === config.default_board_id)
			: null;

		return (
			defaultBoard?.viewType ??
			config.default_view_type ??
			BoardViewType.BOARD
		);
	}, [boards, config.default_board_id, config.default_view_type]);

	const requestedTab =
		selectedTabState.projectId === projectId
			? selectedTabState.value
			: null;

	const activeTab = useMemo(() => {
		const preferredTab = requestedTab ?? defaultTab;
		const isAvailable = availableTabs.some(
			(tab) => tab.value === preferredTab,
		);

		if (isAvailable) return preferredTab;

		return availableTabs[0]?.value ?? preferredTab;
	}, [availableTabs, defaultTab, requestedTab]);

	const activeBoard = useMemo(() => {
		if (activeTab === BoardViewType.BACKLOG && !canUseSprint) {
			return undefined;
		}

		return boards.find((board) => board.viewType === activeTab);
	}, [boards, activeTab, canUseSprint]);

	const handleSetActiveTab = useCallback(
		(value: BoardViewType) => {
			setSelectedTabState({
				projectId,
				value,
			});
		},
		[projectId],
	);

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
			setActiveTab={handleSetActiveTab}
			context={context}
		/>
	);
};

export default ProjectBlockContainer;
