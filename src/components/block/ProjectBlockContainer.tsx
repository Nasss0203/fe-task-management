"use client";

import ProjectBlock, {
	BoardItem,
	BoardViewType,
} from "@/components/block/ProjectBlock";
import { findAllBoard } from "@/services/board/board.service";
import { ProjectItems } from "@/services/project/type";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, LayoutList } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Props = {
	project: ProjectItems;
	workspaceId: string;
};

const ProjectBlockContainer = ({ project, workspaceId }: Props) => {
	const { setCurrentProjectId, setCurrentBoardId } =
		useProjectSelectionStore();

	const [activeTab, setActiveTab] = useState<BoardViewType>("TABLE");

	const projectId = project.id;
	if (!projectId) return null;

	const boardQuery = useQuery({
		queryKey: ["boards", workspaceId, projectId],
		queryFn: () => findAllBoard(workspaceId, projectId),
		enabled: !!workspaceId && !!projectId,
	});

	const boards: BoardItem[] = boardQuery.data?.data ?? [];

	const tableBoard = useMemo(
		() => boards.find((b) => b.viewType === "TABLE"),
		[boards],
	);

	const calendarBoard = useMemo(
		() => boards.find((b) => b.viewType === "CALENDAR"),
		[boards],
	);

	const availableTabs = useMemo(() => {
		const tabs = [];

		if (tableBoard) {
			tabs.push({
				icon: LayoutList,
				type: "Table",
				value: "TABLE" as BoardViewType,
			});
		}

		if (calendarBoard) {
			tabs.push({
				icon: CalendarDays,
				type: "Calendar",
				value: "CALENDAR" as BoardViewType,
			});
		}

		return tabs;
	}, [tableBoard, calendarBoard]);

	useEffect(() => {
		if (!availableTabs.length) return;

		const isActiveTabValid = availableTabs.some(
			(tab) => tab.value === activeTab,
		);

		if (!isActiveTabValid) {
			setActiveTab(availableTabs[0].value);
		}
	}, [availableTabs, activeTab]);

	const activeBoard = activeTab === "TABLE" ? tableBoard : calendarBoard;

	useEffect(() => {
		setCurrentProjectId(projectId);
		setCurrentBoardId(activeBoard?.id ?? null);
	}, [projectId, activeBoard?.id, setCurrentProjectId, setCurrentBoardId]);

	return (
		<ProjectBlock
			isOpen
			projectId={projectId}
			workspaceId={workspaceId}
			boards={boards}
			activeTab={activeTab}
			availableTabs={availableTabs}
			tableBoard={tableBoard}
			calendarBoard={calendarBoard}
			setCurrentBoardId={setCurrentBoardId}
			setActiveTab={setActiveTab}
		/>
	);
};

export default ProjectBlockContainer;
