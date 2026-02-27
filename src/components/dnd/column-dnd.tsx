"use client";

import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/react";
import { Ellipsis, Plus } from "lucide-react";

export default function ColumnDnd({
	id,
	children,
	isEmpty,
	status,
}: {
	id: string;
	children: React.ReactNode;
	isEmpty: boolean;
	status: string;
}) {
	const { ref, isDropTarget } = useDroppable({
		id,
		type: "column",
		accept: ["item"],
	});

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
			background: "bg-blue-500/30",
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

	const s = STATUS_STYLE[status] ?? STATUS_STYLE.todo;

	return (
		<div className='flex flex-col gap-5'>
			<div
				ref={ref}
				className={cn(
					"w-80 rounded-md p-4 flex flex-col gap-y-3 group",
					s.background,
					isDropTarget ? cn("ring-2", s.ring) : "",
				)}
			>
				<div className={cn("flex items-center justify-between")}>
					<div
						className={cn(
							"px-1.5 py-0.5 rounded-full inline-flex items-center gap-x-1",
							s.badge,
						)}
					>
						<div className={cn("w-2 h-2 rounded-full", s.dot)} />
						<div className='text-xs'>{s.label}</div>
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
							className='p-1 dark:bg-neutral-800 rounded-sm dark:*:hover:bg-neutral-700 bg-neutral-400'
						>
							<Ellipsis size={16} />
						</button>
						<button
							type='button'
							className='p-1 dark:bg-neutral-800 rounded-sm dark:*:hover:bg-neutral-700 bg-neutral-400'
						>
							<Plus size={16} />
						</button>
					</div>
				</div>
				<div className='flex flex-col gap-3'>
					{children}
					{isEmpty && (
						<div className='h-10 rounded-lg border border-dashed border-neutral-400 bg-white/40' />
					)}
				</div>
			</div>
		</div>
	);
}
