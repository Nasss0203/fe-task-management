"use client";

import CalendarApp from "@/components/calendar/calendar";
import { ProviderDragDrop } from "@/components/dnd";
import { TabsListCustom, TabsTriggerCustom } from "@/components/tabs";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { findAllBoard } from "@/services/board/board.service";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { useQuery } from "@tanstack/react-query";
import {
	Calendar,
	CircleArrowRight,
	Plus,
	type LucideIcon,
} from "lucide-react";
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
	const {
		currentWorkspaceId,
		currentProjectId,
		currentBoardId,
		setCurrentBoardId,
	} = useProjectSelectionStore();

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

	const defaultTab = availableTabs[0]?.value ?? "TABLE";
	const [activeTab, setActiveTab] = useState<BoardViewType>("TABLE");

	useEffect(() => {
		setActiveTab(defaultTab);
	}, [defaultTab]);

	const tableBoard = boards.find((board) => board.viewType === "TABLE");
	const calendarBoard = boards.find((board) => board.viewType === "CALENDAR");

	useEffect(() => {
		if (activeTab === "TABLE" && tableBoard?.id) {
			setCurrentBoardId(tableBoard.id);
			return;
		}

		if (activeTab === "CALENDAR" && calendarBoard?.id) {
			setCurrentBoardId(calendarBoard.id);
			return;
		}

		setCurrentBoardId(null);
	}, [activeTab, tableBoard, calendarBoard, setCurrentBoardId]);

	return (
		<div className='flex flex-col gap-2'>
			<div>
				<input
					type='text'
					defaultValue='Workspace'
					placeholder='Workspace'
					className='text-2xl font-bold outline-none'
				/>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={(value) => setActiveTab(value as BoardViewType)}
			>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-1'>
						<TabsListCustom variant='none'>
							{availableTabs.map((item, index) => (
								<TabsTriggerCustom
									value={item.value}
									key={index}
								>
									<div className='flex items-center gap-1'>
										<item.icon />
										<div className='text-sm font-medium'>
											{item.type}
										</div>
									</div>
								</TabsTriggerCustom>
							))}
						</TabsListCustom>

						<button className='flex justify-center items-center rounded-full bg-neutral-300 w-6 h-6'>
							<Plus className='size-4' />
						</button>
					</div>
				</div>

				<TabsContent value='TABLE'>
					<ProviderDragDrop />
				</TabsContent>

				<TabsContent value='CALENDAR'>
					<CalendarApp />
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default RestPage;
