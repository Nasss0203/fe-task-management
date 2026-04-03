"use client";

import { ProjectBlock } from "@/components/block";
import { BoardItem, BoardViewType } from "@/components/block/ProjectBlock";
import { findAllBoard } from "@/services/board/board.service";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useQuery } from "@tanstack/react-query";
import { Calendar, CircleArrowRight, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const tabTrigger: {
	icon: LucideIcon;
	type: string;
	value: BoardViewType;
}[] = [
	{
		icon: CircleArrowRight,
		type: "Theo trạng thái",
		value: BoardViewType.BOARD,
	},
	{
		icon: Calendar,
		type: "Theo lịch",
		value: BoardViewType.CALENDAR,
	},
];

const RestPage = () => {
	const { currentWorkspaceId, currentProjectId, setCurrentBoardId } =
		useProjectSelectionStore();

	const [activeTab, setActiveTab] = useState<BoardViewType>(
		BoardViewType.BOARD,
	);

	const workspaceId = currentWorkspaceId;
	const projectId = currentProjectId;

	const allBoard = useQuery({
		queryKey: ["boards", workspaceId, projectId],
		queryFn: () => findAllBoard(workspaceId!, projectId!),
		enabled: !!workspaceId && !!projectId,
	});

	const boards: BoardItem[] = allBoard.data?.data ?? [];

	const tableBoard = useMemo(
		() => boards.find((board) => board.viewType === BoardViewType.BOARD),
		[boards],
	);

	const calendarBoard = useMemo(
		() => boards.find((board) => board.viewType === BoardViewType.CALENDAR),
		[boards],
	);

	const availableTabs = useMemo(
		() =>
			tabTrigger.filter((tab) =>
				boards.some((board) => board.viewType === tab.value),
			),
		[boards],
	);

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
		if (activeTab === BoardViewType.CALENDAR) return calendarBoard;
		return tableBoard;
	}, [activeTab, tableBoard, calendarBoard]);

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
				calendarBoard={calendarBoard}
				setActiveTab={setActiveTab}
				boardBoard={tableBoard}
			/>
		</div>
	);
};

export default RestPage;
