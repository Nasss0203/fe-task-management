"use client";

import { ProjectBlock } from "@/components/block";
import { findAllBoard } from "@/services/board/board.service";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useQuery } from "@tanstack/react-query";
import { Calendar, CircleArrowRight, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type BoardViewType = "TABLE" | "CALENDAR";

type BoardItem = {
	id: string;
	name: string;
	viewType: BoardViewType;
	projectId: string;
	workspaceId: string;
};

const tabTrigger: {
	icon: LucideIcon;
	type: string;
	value: BoardViewType;
}[] = [
	{
		icon: CircleArrowRight,
		type: "Theo trạng thái",
		value: "TABLE",
	},
	{
		icon: Calendar,
		type: "Theo lịch",
		value: "CALENDAR",
	},
];

const RestPage = () => {
	const { currentWorkspaceId, currentProjectId, setCurrentBoardId } =
		useProjectSelectionStore();

	const allBoard = useQuery({
		queryKey: ["boards", currentWorkspaceId, currentProjectId],
		queryFn: () => findAllBoard(currentWorkspaceId!, currentProjectId!),
		enabled: !!currentWorkspaceId && !!currentProjectId,
	});

	const boards: BoardItem[] = allBoard.data?.data ?? [];

	const availableTabs = useMemo(
		() =>
			tabTrigger.filter((tab) =>
				boards.some((board) => board.viewType === tab.value),
			),
		[boards],
	);

	const [activeTab, setActiveTab] = useState<BoardViewType>("TABLE");

	const tableBoard = boards.find((board) => board.viewType === "TABLE");
	const calendarBoard = boards.find((board) => board.viewType === "CALENDAR");

	useEffect(() => {
		if (!availableTabs.length) return;

		const isActiveTabValid = availableTabs.some(
			(tab) => tab.value === activeTab,
		);

		if (!isActiveTabValid) {
			setActiveTab(availableTabs[0].value);
		}
	}, [availableTabs, activeTab]);

	useEffect(() => {
		if (!boards.length) return;

		if (activeTab === "TABLE" && tableBoard?.id) {
			setCurrentBoardId(tableBoard.id);
			return;
		}

		if (activeTab === "CALENDAR" && calendarBoard?.id) {
			setCurrentBoardId(calendarBoard.id);
			return;
		}
	}, [boards, activeTab, tableBoard, calendarBoard, setCurrentBoardId]);

	return (
		<ProjectBlock
			projectId={currentProjectId as string}
			workspaceId={currentWorkspaceId as string}
			activeTab={activeTab}
			availableTabs={availableTabs}
			boards={boards}
			calendarBoard={calendarBoard}
			setActiveTab={setActiveTab}
			setCurrentBoardId={setCurrentBoardId}
			tableBoard={tableBoard}
		></ProjectBlock>
	);
};

export default RestPage;
