"use client";

import * as React from "react";

import { cn } from "@/shared/lib/utils";
import {
	MAX_SIDEBAR_WIDTH,
	MIN_SIDEBAR_WIDTH,
	useResizableSidebar,
	type UseResizableSidebarOptions,
} from "@/widgets/workspace-sidebar/model/use-resizable-sidebar";

export interface SidebarResizeHandleProps
	extends React.ComponentProps<"div">,
		UseResizableSidebarOptions {}

export function SidebarResizeHandle({
	className,
	width: customWidth,
	setWidth: customSetWidth,
	open: customOpen,
	setOpen: customSetOpen,
	isMobile: customIsMobile,
	isResizing: customIsResizing,
	setIsResizing: customSetIsResizing,
	...props
}: SidebarResizeHandleProps) {
	const {
		handleRef,
		isMobile,
		open,
		width,
		isResizing,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
		handleLostPointerCapture,
		handleKeyDown,
		handleDoubleClick,
	} = useResizableSidebar({
		width: customWidth,
		setWidth: customSetWidth,
		open: customOpen,
		setOpen: customSetOpen,
		isMobile: customIsMobile,
		isResizing: customIsResizing,
		setIsResizing: customSetIsResizing,
	});

	if (isMobile || !open) {
		return null;
	}

	return (
		<div
			ref={handleRef}
			role='separator'
			aria-orientation='vertical'
			aria-valuenow={Math.round(width)}
			aria-valuemin={MIN_SIDEBAR_WIDTH}
			aria-valuemax={MAX_SIDEBAR_WIDTH}
			aria-label='Resize workspace sidebar'
			tabIndex={0}
			data-slot='sidebar-resize-handle'
			data-testid='sidebar-resize-handle'
			data-resizing={isResizing}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
			onLostPointerCapture={handleLostPointerCapture}
			onKeyDown={handleKeyDown}
			onDoubleClick={handleDoubleClick}
			title='Drag to resize sidebar, double-click to reset'
			className={cn(
				"absolute top-0 right-0 z-30 h-full w-2 -mr-1 cursor-col-resize select-none",
				"outline-none transition-colors",
				"after:absolute after:inset-y-0 after:right-1 after:w-[2px] after:transition-colors",
				"hover:after:bg-sidebar-border focus-visible:after:bg-ring",
				isResizing && "after:bg-sidebar-border",
				className,
			)}
			{...props}
		/>
	);
}
