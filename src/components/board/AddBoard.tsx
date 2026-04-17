"use client";

import {
	BarChart3,
	CalendarDays,
	FileText,
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

import {
	PopoverContentV2,
	PopoverHeaderV2,
	PopoverTitleV2,
	PopoverTriggerV2,
	PopoverV2,
} from "../popover/popover-custom";
import { BoardViewType } from "./board.type";

type AddBoardProps = {
	onSelect?: (viewType: BoardViewType) => void;
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
		label: "Bảng",
		value: BoardViewType.BOARD,
		icon: LayoutGrid,
		enabled: true,
	},
	{
		label: "Thư viện",
		value: BoardViewType.GALLERY,
		icon: Image,
		enabled: true,
	},
	{
		label: "Danh sách",
		value: BoardViewType.LIST,
		icon: List,
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
		label: "Dòng thời gian",
		value: BoardViewType.TIMELINE,
		icon: GanttChart,
		enabled: true,
	},
	{ label: "Bảng tin", value: BoardViewType.FEED, icon: Rss, enabled: true },

	{ label: "Bản đồ", value: BoardViewType.MAP, icon: Map, enabled: true },
	{
		label: "Lịch",
		value: BoardViewType.CALENDAR,
		icon: CalendarDays,
		enabled: true,
	},
	{
		label: "Biểu mẫu",
		value: BoardViewType.FORM,
		icon: FileText,
		enabled: true,
	},
];

export default function AddBoard({ onSelect }: AddBoardProps) {
	return (
		<PopoverV2>
			<PopoverTriggerV2 asChild>
				<button className='flex h-7 w-7 items-center justify-center rounded-full bg-neutral-700 text-white transition hover:bg-neutral-600 cursor-pointer'>
					<Plus className='size-4' />
				</button>
			</PopoverTriggerV2>

			<PopoverContentV2
				align='start'
				sideOffset={10}
				className='w-120 rounded-2xl border border-neutral-800 bg-neutral-950 p-0 text-white shadow-2xl'
			>
				<PopoverHeaderV2 className='border-b border-neutral-800 px-5 py-4'>
					<PopoverTitleV2 className='text-base font-semibold text-neutral-100'>
						Thêm chế độ xem mới
					</PopoverTitleV2>
				</PopoverHeaderV2>

				<div className='grid grid-cols-4 p-4'>
					{BOARD_VIEW_ITEMS.filter((item) => item.enabled).map(
						(item) => {
							const Icon = item.icon;

							return (
								<button
									key={item.value}
									type='button'
									onClick={() => onSelect?.(item.value)}
									className='group flex flex-col items-center justify-start gap-3 rounded-xl px-2 py-3 text-center transition hover:bg-neutral-900 cursor-pointer'
								>
									<div className='flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-100 transition group-hover:border-neutral-700 group-hover:bg-neutral-800'>
										<Icon className='size-5' />
									</div>

									<span className='line-clamp-2 text-sm font-medium leading-5 text-neutral-100'>
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
