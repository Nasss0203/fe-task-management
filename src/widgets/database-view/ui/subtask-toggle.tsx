"use client";

import { ChevronRight } from "lucide-react";

import { cn } from "@/shared/lib/utils";

import { MAX_INDENT_DEPTH, type RowTreeItem } from "../lib/row-tree";

interface SubtaskToggleProps {
	item: RowTreeItem;
	collapsed: boolean;
	onToggle: () => void;
}

/** Indent for a sub-task plus the ▸ button that shows or hides its sub-tasks. */
export function SubtaskToggle({ item, collapsed, onToggle }: SubtaskToggleProps) {
	return (
		<span
			className='flex shrink-0 items-center'
			style={{ paddingLeft: Math.min(item.depth, MAX_INDENT_DEPTH) * 20 }}
		>
			{item.hasChildren ? (
				<button
					type='button'
					aria-label={collapsed ? "Show sub-tasks" : "Hide sub-tasks"}
					aria-expanded={!collapsed}
					onClick={(event) => {
						event.stopPropagation();
						onToggle();
					}}
					onKeyDown={(event) => event.stopPropagation()}
					className='flex size-5 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground'
				>
					<ChevronRight
						className={cn("size-3.5 transition-transform", !collapsed && "rotate-90")}
					/>
				</button>
			) : (
				<span className='size-5' />
			)}
		</span>
	);
}

/** "2/5" next to a parent task's name. */
export function SubtaskProgress({ progress }: { progress: string | null }) {
	if (!progress) return null;
	return (
		<span
			title='Sub-tasks done'
			className='shrink-0 rounded-sm bg-muted px-1.5 text-xs leading-5 text-muted-foreground'
		>
			{progress}
		</span>
	);
}
