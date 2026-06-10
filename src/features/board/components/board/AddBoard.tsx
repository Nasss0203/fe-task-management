"use client";

import {
	CalendarDays,
	GalleryVerticalEnd,
	LayoutGrid,
	List,
	Plus,
	Table2,
} from "lucide-react";

import { useBoards } from "@/features/board/hooks/useBoards";
import { useWorkspaceFeatures } from "@/features/workspace-feature/hooks/useWorkspaceFeatures";
import { BoardItem, BoardViewType } from "@/services/board/type";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { isBoardViewEnabled } from "./view-board";
import {
	PopoverContentV2,
	PopoverHeaderV2,
	PopoverTitleV2,
	PopoverTriggerV2,
	PopoverV2,
} from "@/components/popover/popover-custom";

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
		label: "Backlog",
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
	const { canUseSprint } = useWorkspaceFeatures(workspaceId);

	const existingViewTypes = new Set(boards.map((board) => board.viewType));
	const boardViewItems = BOARD_VIEW_ITEMS.filter((item) => {
		if (
			!item.enabled ||
			!isBoardViewEnabled(item.value, {
				canUseSprint,
			})
		) {
			return false;
		}

		return true;
	});

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
					className='flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-muted text-white transition hover:bg-neutral-600'
				>
					<Plus className='size-4' />
				</button>
			</PopoverTriggerV2>

			<PopoverContentV2
				align='start'
				sideOffset={10}
				className='w-[420px] rounded-2xl border border-border bg-background p-0 text-white shadow-2xl'
			>
				<PopoverHeaderV2 className='border-b border-border px-5 py-4'>
					<PopoverTitleV2 className='text-base font-semibold text-foreground'>
						Thêm chế độ xem mới
					</PopoverTitleV2>
				</PopoverHeaderV2>

				<div className='grid grid-cols-5 p-3'>
					{boardViewItems.map((item) => {
						const Icon = item.icon;
						const isExists = existingViewTypes.has(item.value);
						const isDisabled = isExists;

						return (
							<button
								key={item.value}
								type='button'
								disabled={isDisabled}
								title={
									isExists
										? "Chế độ xem này đã tồn tại"
										: item.label
								}
								onClick={() =>
									handleSubmit(item.value, item.label)
								}
								className='group flex cursor-pointer flex-col items-center justify-start gap-2 rounded-xl p-2 text-center transition hover:hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'
							>
								<div className='flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background text-foreground transition group-hover:border-border group-hover:hover:bg-accent hover:text-accent-foreground group-disabled:border-border group-disabled:hover:bg-accent'>
									<Icon className='size-5' />
								</div>

								<span className='line-clamp-2 text-xs font-medium leading-5 text-foreground'>
									{item.label}
								</span>
							</button>
						);
					})}
				</div>
			</PopoverContentV2>
		</PopoverV2>
	);
}
