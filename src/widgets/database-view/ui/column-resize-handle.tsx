"use client";

import type { PointerEvent as ReactPointerEvent } from "react";

// Must match the backend validation on SetViewPropertyWidthRequest.
export const MIN_COLUMN_WIDTH = 80;
export const MAX_COLUMN_WIDTH = 1200;

const clamp = (width: number) =>
	Math.round(Math.min(MAX_COLUMN_WIDTH, Math.max(MIN_COLUMN_WIDTH, width)));

interface ColumnResizeHandleProps {
	label: string;
	/** Live width while dragging (not persisted). */
	onResize: (width: number) => void;
	/** Final width to persist; null resets the column to auto. */
	onCommit: (width: number | null) => void;
}

export function ColumnResizeHandle({
	label,
	onResize,
	onCommit,
}: ColumnResizeHandleProps) {
	const currentWidth = (element: HTMLElement) =>
		element.closest("th")?.getBoundingClientRect().width ?? MIN_COLUMN_WIDTH;

	const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (event.button !== 0) return;
		event.preventDefault();

		const handle = event.currentTarget;
		const startX = event.clientX;
		const startWidth = currentWidth(handle);
		let width = startWidth;

		handle.setPointerCapture(event.pointerId);
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";

		const move = (moveEvent: PointerEvent) => {
			width = clamp(startWidth + moveEvent.clientX - startX);
			onResize(width);
		};

		const up = () => {
			handle.removeEventListener("pointermove", move);
			handle.removeEventListener("pointerup", up);
			handle.removeEventListener("pointercancel", up);
			document.body.style.cursor = "";
			document.body.style.userSelect = "";

			if (width !== Math.round(startWidth)) onCommit(width);
		};

		handle.addEventListener("pointermove", move);
		handle.addEventListener("pointerup", up);
		handle.addEventListener("pointercancel", up);
	};

	return (
		<div
			role='separator'
			aria-orientation='vertical'
			aria-label={`Resize ${label} column`}
			tabIndex={0}
			title='Drag to resize · double-click to reset'
			onPointerDown={handlePointerDown}
			onDoubleClick={() => onCommit(null)}
			onKeyDown={(event) => {
				if (event.key !== "ArrowLeft" && event.key !== "ArrowRight")
					return;
				event.preventDefault();
				const delta = event.key === "ArrowLeft" ? -16 : 16;
				onCommit(clamp(currentWidth(event.currentTarget) + delta));
			}}
			className='absolute -right-[3px] top-0 z-10 h-full w-[5px] cursor-col-resize touch-none rounded-full outline-none transition-colors hover:bg-primary/60 focus-visible:bg-primary/60 active:bg-primary'
		/>
	);
}
