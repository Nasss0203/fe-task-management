"use client";

import {
	BarChart3,
	CalendarDays,
	FileText,
	GalleryVerticalEnd,
	GanttChart,
	Image,
	LayoutDashboard,
	LayoutGrid,
	List,
	Map,
	Plus,
	Rss,
	Table2,
} from "lucide-react";

import { useBoards } from "@/hooks/use-board";
import { BoardItem, BoardViewType } from "@/services/board/type";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import {
	PopoverContentV2,
	PopoverHeaderV2,
	PopoverTitleV2,
	PopoverTriggerV2,
	PopoverV2,
} from "../popover/popover-custom";

type AddBoardProps = {
	blockId: string;
	projectId: string;
	workspaceId: string;
	boards: BoardItem[];
};

const BOARD_VIEW_ITEMS: {
	label: string;
	value: BoardViewType;
	icon: React.ComponentType<{ className?: string }>;
	enabled?: boolean;
}[] = [
	{
		label: "Bảng tính",
		value: BoardViewType.TABLE,
		icon: Table2,
		enabled: true,
	},
	{
		label: "Theo trạng thái",
		value: BoardViewType.BOARD,
		icon: LayoutGrid,
		enabled: true,
	},
	{
		label: "Danh sách",
		value: BoardViewType.LIST,
		icon: List,
		enabled: true,
	},
	{
		label: "Lịch",
		value: BoardViewType.CALENDAR,
		icon: CalendarDays,
		enabled: true,
	},
	{
		label: "Dòng thời gian",
		value: BoardViewType.TIMELINE,
		icon: GanttChart,
		enabled: true,
	},
	{
		label: "Biểu đồ",
		value: BoardViewType.CHART,
		icon: BarChart3,
		enabled: true,
	},
	{
		label: "Bảng điều khiển",
		value: BoardViewType.DASHBOARD,
		icon: LayoutDashboard,
		enabled: true,
	},
	{
		label: "Bảng tin",
		value: BoardViewType.FEED,
		icon: Rss,
		enabled: true,
	},
	{
		label: "Bản đồ",
		value: BoardViewType.MAP,
		icon: Map,
		enabled: true,
	},
	{
		label: "Biểu mẫu",
		value: BoardViewType.FORM,
		icon: FileText,
		enabled: true,
	},
	{
		label: "Thư viện",
		value: BoardViewType.GALLERY,
		icon: Image,
		enabled: true,
	},
	{
		label: "Back Log",
		value: BoardViewType.BACKLOG,
		icon: GalleryVerticalEnd,
		enabled: true,
	},
];

export default function AddBoard({
	projectId,
	workspaceId,
	boards,
	blockId,
}: AddBoardProps) {
	const { setCurrentWorkspaceId, setCurrentProjectId, setCurrentBoardId } =
		useProjectSelectionStore();

	const { createBoard, findBoard } = useBoards();

	const existingViewTypes = new Set(boards.map((board) => board.viewType));

	const handleSubmit = async (viewType: BoardViewType, label: string) => {
		if (!viewType) return;

		const isExists = existingViewTypes.has(viewType);

		if (isExists) return;

		const name = label.toLowerCase();

		try {
			await createBoard.mutateAsync({
				name,
				viewType,
				projectId,
				workspaceId,
				blockId,
			});

			await findBoard.refetch();
		} catch (error) {
			console.error("createBoard failed", error);
		}
	};

	const handleOpenAddBoard = () => {
		setCurrentWorkspaceId(workspaceId);
		setCurrentProjectId(projectId);
		setCurrentBoardId(null);
	};

	return (
		<PopoverV2>
			<PopoverTriggerV2 asChild>
				<button
					type='button'
					onClick={handleOpenAddBoard}
					className='flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-neutral-700 text-white transition hover:bg-neutral-600'
				>
					<Plus className='size-4' />
				</button>
			</PopoverTriggerV2>

			<PopoverContentV2
				align='start'
				sideOffset={10}
				className='w-90 rounded-2xl border border-neutral-800 bg-neutral-950 p-0 text-white shadow-2xl'
			>
				<PopoverHeaderV2 className='border-b border-neutral-800 px-5 py-4'>
					<PopoverTitleV2 className='text-base font-semibold text-neutral-100'>
						Thêm chế độ xem mới
					</PopoverTitleV2>
				</PopoverHeaderV2>

				<div className='grid grid-cols-4 p-3'>
					{BOARD_VIEW_ITEMS.filter((item) => item.enabled).map(
						(item) => {
							const Icon = item.icon;
							const isExists = existingViewTypes.has(item.value);

							return (
								<button
									key={item.value}
									type='button'
									disabled={isExists}
									title={
										isExists
											? "Chế độ xem này đã tồn tại"
											: item.label
									}
									onClick={() =>
										handleSubmit(item.value, item.label)
									}
									className='group flex cursor-pointer flex-col items-center justify-start gap-2 rounded-xl p-2 text-center transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'
								>
									<div className='flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-100 transition group-hover:border-neutral-700 group-hover:bg-neutral-800 group-disabled:border-neutral-800 group-disabled:bg-neutral-900'>
										<Icon className='size-5' />
									</div>

									<span className='line-clamp-2 text-xs font-medium leading-5 text-neutral-100'>
										{item.label}
									</span>
								</button>
							);
						},
					)}
				</div>
			</PopoverContentV2>
		</PopoverV2>
	);
}
