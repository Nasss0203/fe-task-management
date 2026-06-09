"use client";

import { getTaskStatusStyle } from "@/lib/task-status-style";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/react";
import { Ellipsis, Plus } from "lucide-react";

type Props = {
	id: string;
	children: React.ReactNode;
	statusId: string;
	statusName: string;
	isDone?: boolean;
	onAddTask?: (statusId: string) => void;
	className?: string;
};

export default function ColumnDnd({
	id,
	children,
	statusId,
	statusName,
	isDone,
	onAddTask,
	className,
}: Props) {
	const { ref, isDropTarget } = useDroppable({
		id,
		type: "column",
		accept: ["item"],
	});

	const s = getTaskStatusStyle(statusName, isDone);

	return (
		<div className='flex flex-col'>
			<div
				ref={ref}
				className={cn(
					"w-80 rounded-md p-4 flex flex-col gap-y-3 group",
					s.columnBackground,
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
						<div className={cn("w-2 h-2 rounded-full", s.dot)} />
						<div className='text-xs'>
							{statusName || s.label}
							{isDone ? " - Done" : ""}
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
							className='p-1 dark:bg-muted rounded-sm dark:hover:hover:bg-accent hover:text-accent-foreground bg-neutral-400 hover:bg-neutral-500'
						>
							<Ellipsis size={16} />
						</button>

						<button
							type='button'
							onClick={() => onAddTask?.(statusId)}
							className='p-1 dark:bg-muted rounded-sm dark:hover:hover:bg-accent hover:text-accent-foreground bg-neutral-400 hover:bg-neutral-500'
						>
							<Plus size={16} />
						</button>
					</div>
				</div>

				<div className='flex flex-col gap-3 flex-1'>{children}</div>

				<button
					type='button'
					onClick={() => onAddTask?.(statusId)}
					className='mt-3 h-10 rounded-lg border border-border bg-background/50 hover:bg-background/80 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 flex items-center gap-3 px-3 text-sm cursor-pointer shrink-0 text-muted-foreground hover:text-foreground transition-colors'
				>
					<Plus size={18} />
					<span>Thêm mới</span>
				</button>
			</div>
		</div>
	);
}
