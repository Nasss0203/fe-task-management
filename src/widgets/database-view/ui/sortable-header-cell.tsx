"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";

import { DatabaseHeaderCell } from "@/entities/database/ui/database-visuals";
import { cn } from "@/shared/lib/utils";

export function SortableHeaderCell({
	id,
	label,
	children,
	resizeHandle,
}: {
	id: string;
	label: string;
	children: ReactNode;
	resizeHandle: ReactNode;
}) {
	const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
		useSortable({ id });

	return (
		<DatabaseHeaderCell
			ref={setNodeRef}
			style={{
				transform: CSS.Translate.toString(transform),
				transition,
			}}
			className={cn(
				"relative p-0 hover:bg-muted/60",
				isDragging && "z-10 bg-muted opacity-80 shadow-sm",
			)}
		>
			<div
				{...attributes}
				{...listeners}
				tabIndex={-1}
				role='presentation'
				aria-label={`Drag to move ${label}`}
				className='cursor-grab active:cursor-grabbing'
			>
				{children}
			</div>
			{resizeHandle}
		</DatabaseHeaderCell>
	);
}
