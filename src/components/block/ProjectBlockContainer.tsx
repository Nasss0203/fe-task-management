"use client";

import ProjectBlock, {
	AvailableTabItem,
} from "@/components/block/ProjectBlock";
import { findAllBoard } from "@/services/board/board.service";
import { PageBlockDataConfig } from "@/services/page/type";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { BoardItem, BoardViewType } from "../board/board.type";
import { BOARD_VIEW_CONFIG } from "../board/view-board";

type Props = {
	projectId: string;
	workspaceId: string;
	configs: PageBlockDataConfig[];
	title?: string;
};

const ProjectBlockContainer = ({
	projectId,
	workspaceId,
	configs,
	title,
}: Props) => {
	const { setCurrentProjectId, setCurrentBoardId } =
		useProjectSelectionStore();

	const initialView =
		(configs.find((item) => item.is_open)?.view as BoardViewType) ??
		BoardViewType.BOARD;

	const [activeTab, setActiveTab] = useState<BoardViewType>(initialView);

	const boardQuery = useQuery({
		queryKey: ["boards", workspaceId, projectId],
		queryFn: () => findAllBoard(workspaceId, projectId),
		enabled: !!workspaceId && !!projectId,
	});

	const boards: BoardItem[] = boardQuery.data?.data ?? [];

	const availableTabs = useMemo<AvailableTabItem[]>(() => {
		return configs.reduce<AvailableTabItem[]>((acc, item) => {
			if (!item.is_open) return acc;

			const viewType = item.view as BoardViewType;
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
		return configs.find((item) => item.view === activeTab);
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
			isOpen={true}
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
