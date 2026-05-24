"use client";

import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/react";
import { Ellipsis, Plus } from "lucide-react";

const STATUS_STYLE: Record<
	string,
	{
		dot: string;
		badge: string;
		label: string;
		background: string;
		ring?: string;
	}
> = {
	todo: {
		dot: "bg-[#6B778C]",
		badge: "bg-neutral-700/60 text-neutral-100",
		label: "Chưa bắt đầu",
		background: "bg-neutral-600/30",
		ring: "ring-neutral-400/40",
	},
	inProgress: {
		dot: "bg-sky-400",
		badge: "bg-sky-500/20 text-sky-100",
		label: "Đang thực hiện",
		background: "bg-blue-500/20",
		ring: "ring-sky-400/40",
	},
	done: {
		dot: "bg-emerald-400",
		badge: "bg-emerald-500/15 text-emerald-100",
		label: "Hoàn tất",
		background: "bg-emerald-500/20",
		ring: "ring-emerald-400/40",
	},
};

type Props = {
	id: string;
	children: React.ReactNode;
	statusId: string;
	statusName: string;
	statusColor?: string;
	isDone?: boolean;
	onAddTask?: (statusId: string) => void;
	className?: string;
};

export default function ColumnDnd({
	id,
	children,
	statusId,
	statusName,
	statusColor,
	isDone,
	onAddTask,
	className,
}: Props) {
	const { ref, isDropTarget } = useDroppable({
		id,
		type: "column",
		accept: ["item"],
	});

	const normalizedStatus = statusName
		.trim()
		.toLowerCase()
		.replace(/[\s_-]+/g, "");

	const statusKey: keyof typeof STATUS_STYLE =
		normalizedStatus === "inprogress"
			? "inProgress"
			: normalizedStatus === "done"
				? "done"
				: "todo";

	const s = STATUS_STYLE[statusKey];

	return (
		<div className='flex flex-col'>
			<div
				ref={ref}
				className={cn(
					"w-80 rounded-md p-4 flex flex-col gap-y-3 group",
					s.background,
					isDropTarget && cn("ring-2", s.ring),
					className,
				)}
			>
				<div className='flex items-center justify-between'>
					<div
						className={cn(
							"px-2 py-1.5 rounded-full inline-flex items-center gap-x-1",
							s.badge,
						)}
					>
						<div
							className={cn("w-2 h-2 rounded-full", s.dot)}
							style={
								statusColor
									? { backgroundColor: statusColor }
									: undefined
							}
						/>
						<div className='text-xs'>
							{s.label}
							{isDone ? " • Done" : ""}
						</div>
					</div>

					<div
						className={cn(
							"flex items-center gap-1",
							"opacity-0 pointer-events-none transition-opacity",
							"group-hover:opacity-100 group-hover:pointer-events-auto",
						)}
					>
						<button
							type='button'
							className='p-1 dark:bg-neutral-800 rounded-sm dark:hover:bg-neutral-700 bg-neutral-400 hover:bg-neutral-500'
						>
							<Ellipsis size={16} />
						</button>

						<button
							type='button'
							onClick={() => onAddTask?.(statusId)}
							className='p-1 dark:bg-neutral-800 rounded-sm dark:hover:bg-neutral-700 bg-neutral-400 hover:bg-neutral-500'
						>
							<Plus size={16} />
						</button>
					</div>
				</div>

				<div className='flex flex-col gap-3 flex-1'>{children}</div>

				<button
					type='button'
					onClick={() => onAddTask?.(statusId)}
					className='mt-3 h-10 rounded-lg border border-neutral-400/30 bg-white/5 hover:bg-white/20 flex items-center gap-3 px-3 text-sm cursor-pointer shrink-0'
				>
					<Plus size={18} />
					<span>Thêm mới</span>
				</button>
			</div>
		</div>
	);
}
