"use client";

/**
 * TableRowDnd
 *
 * Một row trong bảng. Kéo được bằng drag handle (⠿) ở cột đầu.
 * Dùng useSortable giống ItemsDnd cũ.
 */

import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/react/sortable";
import { GripVertical } from "lucide-react";
import { useEffect, useState } from "react";

// ── Priority badge colours ─────────────────────────────────────────────────

const PRIORITY_STYLE: Record<string, string> = {
	urgent: "bg-red-500/20 text-red-300",
	high: "bg-orange-500/20 text-orange-300",
	medium: "bg-yellow-500/20 text-yellow-300",
	low: "bg-sky-500/20 text-sky-300",
};

// ── Status dot colour (fallback if no statusColor prop) ────────────────────

const STATUS_DOT: Record<string, string> = {
	todo: "bg-neutral-500",
	inprogress: "bg-sky-400",
	done: "bg-emerald-400",
};

// ── Types ──────────────────────────────────────────────────────────────────

type Task = {
	id: string;
	title?: string;
	priority?: string;
	assignees?: { id: string; name: string; avatarUrl?: string }[];
};

type Props = {
	id: string;
	column: string;
	index: number;
	statusName: string;
	statusColor?: string;
	task: Task | undefined;
	onUpdateName?: (id: string, newName: string) => void;
};

// ── Component ─────────────────────────────────────────────────────────────

export function TableRowDnd({
	id,
	column,
	index,
	statusName,
	statusColor,
	task,
	onUpdateName,
}: Props) {
	const { ref, handleRef, isDragging } = useSortable({
		id,
		index,
		group: column,
		type: "item",
		accept: ["item"],
	});

	// Inline-edit task name (same debounce pattern as ItemView)
	const [localName, setLocalName] = useState(task?.title ?? "");

	useEffect(() => setLocalName(task?.title ?? ""), [task?.title]);

	useEffect(() => {
		const trimmed = localName.trim();
		const original = (task?.title ?? "").trim();
		if (!trimmed || trimmed === original) return;
		const t = setTimeout(() => onUpdateName?.(id, trimmed), 500);
		return () => clearTimeout(t);
	}, [localName, task?.title, id, onUpdateName]);

	const normalizedStatus = statusName
		.trim()
		.toLowerCase()
		.replace(/[\s_-]+/g, "");
	const dotClass =
		STATUS_DOT[
			normalizedStatus === "inprogress"
				? "inprogress"
				: normalizedStatus === "done"
					? "done"
					: "todo"
		];

	const priorityKey = (task?.priority ?? "").toLowerCase();
	const priorityClass =
		PRIORITY_STYLE[priorityKey] ?? "bg-neutral-700 text-neutral-300";

	return (
		<div
			ref={ref}
			className={cn(
				"grid grid-cols-[2rem_1fr_10rem_10rem_10rem] items-center px-4 py-2.5",
				"border-b border-neutral-700/50 bg-neutral-900 hover:bg-neutral-800/50 transition-colors",
				isDragging && "opacity-40",
			)}
		>
			{/* ── Drag handle ── */}
			<button
				ref={handleRef}
				type='button'
				className='cursor-grab active:cursor-grabbing text-neutral-600 hover:text-neutral-300 transition-colors'
			>
				<GripVertical size={16} />
			</button>

			{/* ── Title ── */}
			<input
				type='text'
				value={localName}
				onChange={(e) => setLocalName(e.target.value)}
				onPointerDown={(e) => e.stopPropagation()} // prevent drag on click
				className='bg-transparent text-sm text-neutral-100 outline-none w-full truncate'
			/>

			{/* ── Status ── */}
			<div className='flex items-center gap-1.5'>
				<span
					className={cn("w-2 h-2 rounded-full shrink-0", dotClass)}
					style={
						statusColor
							? { backgroundColor: statusColor }
							: undefined
					}
				/>
				<span className='text-xs text-neutral-300 truncate'>
					{statusName}
				</span>
			</div>

			{/* ── Priority ── */}
			<div>
				{task?.priority ? (
					<span
						className={cn(
							"text-[11px] px-2 py-0.5 rounded-full font-medium",
							priorityClass,
						)}
					>
						{task.priority}
					</span>
				) : (
					<span className='text-xs text-neutral-600'>—</span>
				)}
			</div>

			{/* ── Assignees ── */}
			<div className='flex items-center gap-1'>
				{task?.assignees?.slice(0, 3).map((a) =>
					a.avatarUrl ? (
						<img
							key={a.id}
							src={a.avatarUrl}
							alt={a.name}
							className='w-6 h-6 rounded-full ring-1 ring-neutral-700'
						/>
					) : (
						<span
							key={a.id}
							className='w-6 h-6 rounded-full bg-neutral-700 text-[10px] font-bold flex items-center justify-center ring-1 ring-neutral-600 text-neutral-200'
						>
							{/* {a.name[0]?.toUpperCase()} */}
						</span>
					),
				)}
			</div>
		</div>
	);
}
