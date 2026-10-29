"use client";

import type { PointerEvent as ReactPointerEvent } from "react";

import { clampRowSheetWidth } from "../lib/row-sheet-width";

interface SheetResizeHandleProps {
	width: number;
	/** Live width while dragging. */
	onResize: (width: number) => void;
	/** Final width to remember; null goes back to the default. */
	onCommit: (width: number | null) => void;
}

/** Drag the left edge of a right-side sheet to widen or narrow it. */
export function SheetResizeHandle({ width, onResize, onCommit }: SheetResizeHandleProps) {
	const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (event.button !== 0) return;
		event.preventDefault();

		const handle = event.currentTarget;
		const startX = event.clientX;
		let next = width;

		handle.setPointerCapture(event.pointerId);
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";

		// The sheet grows to the left, so moving the pointer left widens it.
		const move = (moveEvent: PointerEvent) => {
			next = clampRowSheetWidth(
				width + startX - moveEvent.clientX,
				window.innerWidth,
			);
			onResize(next);
		};

		const up = () => {
			handle.removeEventListener("pointermove", move);
			handle.removeEventListener("pointerup", up);
			handle.removeEventListener("pointercancel", up);
			document.body.style.cursor = "";
			document.body.style.userSelect = "";

			if (next !== width) onCommit(next);
		};

		handle.addEventListener("pointermove", move);
		handle.addEventListener("pointerup", up);
		handle.addEventListener("pointercancel", up);
	};

	return (
		<div
			role='separator'
			aria-orientation='vertical'
			aria-label='Resize panel'
			aria-valuenow={width}
			tabIndex={0}
			title='Drag to resize · double-click to reset'
			onPointerDown={handlePointerDown}
			onDoubleClick={() => onCommit(null)}
			onKeyDown={(event) => {
				if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
				event.preventDefault();
				const delta = event.key === "ArrowLeft" ? 32 : -32;
				onCommit(clampRowSheetWidth(width + delta, window.innerWidth));
			}}
			className='absolute inset-y-0 -left-[3px] z-20 hidden w-[6px] cursor-col-resize touch-none rounded-full outline-none transition-colors hover:bg-primary/60 focus-visible:bg-primary/60 active:bg-primary sm:block'
		/>
	);
}
