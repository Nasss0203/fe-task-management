"use client";

/**
 * TableStatusGroup
 *
 * Droppable header row for a status section in the table.
 * Tasks dragged over this group will drop into it (cross-status move).
 * Children = <TableRowDnd /> rows.
 */

import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/react";
import { ChevronDown, Plus } from "lucide-react";
import { useState } from "react";

type Props = {
	statusId: string;
	statusName: string;
	statusColor?: string;
	isDone?: boolean;
	count: number;
	onAddTask?: () => void;
	children: React.ReactNode;
};

export function TableStatusGroup({
	statusId,
	statusName,
	statusColor,
	isDone,
	count,
	onAddTask,
	children,
}: Props) {
	const [collapsed, setCollapsed] = useState(false);

	const { ref, isDropTarget } = useDroppable({
		id: `group-${statusId}`,
		type: "status-group",
		accept: ["item"],
	});

	return (
		<div
			ref={ref}
			className={cn(isDropTarget && "ring-1 ring-inset ring-sky-400/50")}
		>
			{/* ── Group header ── */}
			<div
				className='grid grid-cols-[2rem_1fr_10rem_10rem_10rem] items-center px-4 py-2 bg-neutral-800/60 border-b border-neutral-700 hover:bg-neutral-700/40 transition-colors cursor-pointer select-none'
				onClick={() => setCollapsed((v) => !v)}
			>
				<ChevronDown
					size={14}
					className={cn(
						"text-neutral-400 transition-transform",
						collapsed && "-rotate-90",
					)}
				/>

				<div className='flex items-center gap-2'>
					{/* coloured dot */}
					<span
						className='w-2.5 h-2.5 rounded-full shrink-0'
						style={{ backgroundColor: statusColor ?? "#6B778C" }}
					/>
					<span className='text-sm font-semibold text-neutral-100'>
						{statusName}
						{isDone && (
							<span className='ml-1.5 text-[10px] text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded-full'>
								Done
							</span>
						)}
					</span>
					<span className='text-xs text-neutral-400 bg-neutral-700 rounded-full px-2 py-0.5'>
						{count}
					</span>
				</div>

				{/* Add task button (stops propagation so it doesn't toggle collapse) */}
				<button
					type='button'
					className='col-start-5 justify-self-end text-neutral-400 hover:text-neutral-100 transition-colors p-1 rounded'
					onClick={(e) => {
						e.stopPropagation();
						onAddTask?.();
					}}
				>
					<Plus size={14} />
				</button>
			</div>

			{/* ── Rows ── */}
			{!collapsed && children}

			{/* Empty state */}
			{!collapsed && count === 0 && (
				<div className='px-8 py-3 text-xs text-neutral-500 border-b border-neutral-700/50'>
					Chưa có task
				</div>
			)}
		</div>
	);
}
