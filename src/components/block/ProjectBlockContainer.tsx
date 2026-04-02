"use client";

import ProjectBlock, {
	BoardItem,
	BoardViewType,
} from "@/components/block/ProjectBlock";
import { findAllBoard } from "@/services/board/board.service";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, LayoutList } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Props = {
	projectId: string;
	workspaceId: string;
	initialBoardId?: string | null;
	initialView?: BoardViewType;
	isOpen?: boolean;
	title?: string;
};

const ProjectBlockContainer = ({
	projectId,
	workspaceId,
	initialBoardId,
	initialView = BoardViewType.BOARD,
	isOpen = true,
	title,
}: Props) => {
	const { setCurrentProjectId, setCurrentBoardId } =
		useProjectSelectionStore();

	const [activeTab, setActiveTab] = useState<BoardViewType>(initialView);

	const boardQuery = useQuery({
		queryKey: ["boards", workspaceId, projectId],
		queryFn: () => findAllBoard(workspaceId, projectId),
		enabled: !!workspaceId && !!projectId,
	});

	const boards: BoardItem[] = boardQuery.data?.data ?? [];

	const boardBoard = useMemo(
		() => boards.find((b) => b.viewType === BoardViewType.BOARD),
		[boards],
	);

	const calendarBoard = useMemo(
		() => boards.find((b) => b.viewType === BoardViewType.CALENDAR),
		[boards],
	);

	const availableTabs = useMemo(() => {
		const tabs = [];

		if (boardBoard) {
			tabs.push({
				icon: LayoutList,
				type: "Board",
				value: BoardViewType.BOARD,
			});
		}

		if (calendarBoard) {
			tabs.push({
				icon: CalendarDays,
				type: "Calendar",
				value: BoardViewType.CALENDAR,
			});
		}

		return tabs;
	}, [boardBoard, calendarBoard]);

	useEffect(() => {
		if (!boards.length) return;

		if (initialBoardId) {
			const matchedBoard = boards.find((b) => b.id === initialBoardId);
			if (matchedBoard) {
				setActiveTab(matchedBoard.viewType);
				return;
			}
		}

		const isActiveTabValid = availableTabs.some(
			(tab) => tab.value === activeTab,
		);

		if (!isActiveTabValid && availableTabs.length > 0) {
			setActiveTab(availableTabs[0].value);
		}
	}, [boards, initialBoardId, availableTabs, activeTab]);

	const activeBoard = useMemo(() => {
		if (activeTab === BoardViewType.CALENDAR) return calendarBoard;
		return boardBoard;
	}, [activeTab, boardBoard, calendarBoard]);

	useEffect(() => {
		if (!activeBoard) return;

		setCurrentProjectId(projectId);
		setCurrentBoardId(activeBoard.id);
	}, [projectId, activeBoard, setCurrentProjectId, setCurrentBoardId]);

	return (
		<ProjectBlock
			title={title}
			isOpen={isOpen}
			projectId={projectId}
			workspaceId={workspaceId}
			boards={boards}
			activeTab={activeTab}
			availableTabs={availableTabs}
			boardBoard={boardBoard}
			calendarBoard={calendarBoard}
			setActiveTab={setActiveTab}
		/>
	);
};

export default ProjectBlockContainer;
