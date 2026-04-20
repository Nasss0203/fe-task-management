"use client";

import ProjectBlock, {
	AvailableTabItem,
} from "@/components/block/ProjectBlock";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useEffect, useMemo, useState } from "react";

import { useBoards } from "@/hooks/use-board";
import { BoardItem, BoardViewType } from "@/services/board/type";
import { PageBlockDataConfig } from "@/services/page_block/type";
import { BOARD_VIEW_CONFIG } from "../board/view-board";

type Props = {
	projectId: string;
	workspaceId: string;
	configs: PageBlockDataConfig[];
	title?: string;
	isOpen?: boolean;
};

const ProjectBlockContainer = ({
	projectId,
	workspaceId,
	configs,
	title,
	isOpen,
}: Props) => {
	const { setCurrentProjectId, setCurrentBoardId } =
		useProjectSelectionStore();

	const initialView =
		(configs[0]?.view_type as BoardViewType | undefined) ??
		BoardViewType.BOARD;

	const [activeTab, setActiveTab] = useState<BoardViewType>(initialView);

	const { findBoard } = useBoards({
		workspaceId,
		projectId,
	});

	const boards: BoardItem[] = findBoard.data?.data ?? [];

	const availableTabs = useMemo<AvailableTabItem[]>(() => {
		return configs.reduce<AvailableTabItem[]>((acc, item) => {
			const viewType = item.view_type as BoardViewType;
			const config = BOARD_VIEW_CONFIG[viewType];

			if (!config?.enabled) return acc;

			acc.push({
				icon: config.icon,
				type: config.label,
				value: viewType,
				boardId: item.board_id,
			});

			return acc;
		}, []);
	}, [configs]);

	const activeConfig = useMemo(() => {
		return configs.find((item) => item.view_type === activeTab);
	}, [configs, activeTab]);

	const activeBoard = useMemo(() => {
		if (!activeConfig?.board_id) return undefined;
		return boards.find((b) => b.id === activeConfig.board_id);
	}, [boards, activeConfig]);

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
			title={title}
			isOpen={isOpen}
			boards={boards}
			projectId={projectId}
			workspaceId={workspaceId}
			activeTab={activeTab}
			availableTabs={availableTabs}
			activeBoard={activeBoard}
			setActiveTab={setActiveTab}
		/>
	);
};

export default ProjectBlockContainer;
