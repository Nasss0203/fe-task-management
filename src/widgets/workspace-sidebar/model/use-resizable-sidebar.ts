"use client";

import * as React from "react";

import { useSidebar } from "@/widgets/workspace-sidebar/ui/sidebar";

export const DEFAULT_SIDEBAR_WIDTH = 288;
export const MIN_SIDEBAR_WIDTH = 220;
export const MAX_SIDEBAR_WIDTH = 420;
export const COLLAPSE_THRESHOLD = 180;
export const SIDEBAR_WIDTH_STORAGE_KEY = "taskmanly:workspace-sidebar-width";

export function parseStoredWidth(raw: string | null): number {
	if (!raw) return DEFAULT_SIDEBAR_WIDTH;
	const parsed = Number(raw);
	if (isNaN(parsed) || !isFinite(parsed)) return DEFAULT_SIDEBAR_WIDTH;
	return Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, parsed));
}

export interface UseResizableSidebarOptions {
	width?: number;
	setWidth?: (width: number | ((prev: number) => number)) => void;
	open?: boolean;
	setOpen?: (open: boolean | ((prev: boolean) => boolean)) => void;
	isMobile?: boolean;
	isResizing?: boolean;
	setIsResizing?: (resizing: boolean | ((prev: boolean) => boolean)) => void;
}

export function useResizableSidebar(options?: UseResizableSidebarOptions) {
	let contextSidebar: ReturnType<typeof useSidebar> | null = null;
	try {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		contextSidebar = useSidebar();
	} catch {
		// Allow use outside SidebarProvider in isolated tests
	}

	const open = options?.open ?? contextSidebar?.open ?? true;
	const setOpen = options?.setOpen ?? contextSidebar?.setOpen ?? (() => {});
	const isMobile = options?.isMobile ?? contextSidebar?.isMobile ?? false;
	const width =
		options?.width ?? contextSidebar?.sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH;
	const setWidth =
		options?.setWidth ?? contextSidebar?.setSidebarWidth ?? (() => {});
	const isResizing =
		options?.isResizing ?? contextSidebar?.isResizing ?? false;
	const setIsResizing =
		options?.setIsResizing ?? contextSidebar?.setIsResizing ?? (() => {});

	const setOpenRef = React.useRef(setOpen);
	setOpenRef.current = setOpen;
	const setWidthRef = React.useRef(setWidth);
	setWidthRef.current = setWidth;
	const setIsResizingRef = React.useRef(setIsResizing);
	setIsResizingRef.current = setIsResizing;

	const handleRef = React.useRef<HTMLDivElement | null>(null);
	const isDraggingRef = React.useRef(false);
	const hasMovedRef = React.useRef(false);
	const dragStartXRef = React.useRef(0);
	const lastExpandedWidthRef = React.useRef(width);

	// Keep lastExpandedWidthRef updated with the most recent valid width
	React.useEffect(() => {
		if (width >= MIN_SIDEBAR_WIDTH && width <= MAX_SIDEBAR_WIDTH) {
			lastExpandedWidthRef.current = width;
		}
	}, [width]);

	// Clean up body styles if component unmounts while dragging
	React.useEffect(() => {
		return () => {
			if (isDraggingRef.current) {
				document.body.style.cursor = "";
				document.body.style.userSelect = "";
			}
		};
	}, []);

	const handlePointerDown = React.useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			if (isMobile || event.button !== 0) return;

			event.preventDefault();
			event.stopPropagation();

			isDraggingRef.current = true;
			hasMovedRef.current = false;
			dragStartXRef.current = event.clientX;

			if (width >= MIN_SIDEBAR_WIDTH) {
				lastExpandedWidthRef.current = width;
			}

			setIsResizingRef.current(true);
			document.body.style.cursor = "col-resize";
			document.body.style.userSelect = "none";

			if (event.currentTarget.setPointerCapture) {
				try {
					event.currentTarget.setPointerCapture(event.pointerId);
				} catch {}
			}
		},
		[isMobile, width],
	);

	const handlePointerMove = React.useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			if (!isDraggingRef.current) return;

			if (Math.abs(event.clientX - dragStartXRef.current) > 2) {
				hasMovedRef.current = true;
			}

			const sidebarContainer = handleRef.current?.closest(
				'[data-slot="sidebar-container"]',
			);
			const sidebarLeft =
				sidebarContainer?.getBoundingClientRect().left ?? 0;
			const targetWidth = event.clientX - sidebarLeft;

			if (targetWidth < COLLAPSE_THRESHOLD) {
				setWidthRef.current(Math.max(0, targetWidth));
			} else {
				const clamped = Math.min(
					MAX_SIDEBAR_WIDTH,
					Math.max(MIN_SIDEBAR_WIDTH, targetWidth),
				);
				setWidthRef.current(clamped);
			}
		},
		[],
	);

	const handlePointerUp = React.useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			if (!isDraggingRef.current) return;
			isDraggingRef.current = false;

			if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
				try {
					event.currentTarget.releasePointerCapture(event.pointerId);
				} catch {}
			}

			setIsResizingRef.current(false);
			document.body.style.cursor = "";
			document.body.style.userSelect = "";

			if (!hasMovedRef.current) {
				return;
			}

			const sidebarContainer = handleRef.current?.closest(
				'[data-slot="sidebar-container"]',
			);
			const sidebarLeft =
				sidebarContainer?.getBoundingClientRect().left ?? 0;
			const releasedWidth = event.clientX - sidebarLeft;

			if (releasedWidth < COLLAPSE_THRESHOLD) {
				setOpenRef.current(false);
				setWidthRef.current(lastExpandedWidthRef.current);
				return;
			}

			const finalWidth = Math.min(
				MAX_SIDEBAR_WIDTH,
				Math.max(MIN_SIDEBAR_WIDTH, releasedWidth),
			);
			setWidthRef.current(finalWidth);
			lastExpandedWidthRef.current = finalWidth;
			setOpenRef.current(true);

			try {
				localStorage.setItem(
					SIDEBAR_WIDTH_STORAGE_KEY,
					String(finalWidth),
				);
			} catch {}
		},
		[],
	);

	const handleLostPointerCapture = React.useCallback(() => {
		if (isDraggingRef.current) {
			isDraggingRef.current = false;
			setIsResizingRef.current(false);
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		}
	}, []);

	const handleKeyDown = React.useCallback(
		(event: React.KeyboardEvent<HTMLDivElement>) => {
			if (isMobile || !open) return;

			let nextWidth: number | null = null;
			if (event.key === "ArrowLeft") {
				nextWidth = Math.max(MIN_SIDEBAR_WIDTH, width - 10);
			} else if (event.key === "ArrowRight") {
				nextWidth = Math.min(MAX_SIDEBAR_WIDTH, width + 10);
			} else if (event.key === "Home") {
				nextWidth = MIN_SIDEBAR_WIDTH;
			} else if (event.key === "End") {
				nextWidth = MAX_SIDEBAR_WIDTH;
			}

			if (nextWidth !== null) {
				event.preventDefault();
				setWidthRef.current(nextWidth);
				lastExpandedWidthRef.current = nextWidth;
				try {
					localStorage.setItem(
						SIDEBAR_WIDTH_STORAGE_KEY,
						String(nextWidth),
					);
				} catch {}
			}
		},
		[isMobile, open, width],
	);

	const handleDoubleClick = React.useCallback(() => {
		setWidthRef.current(DEFAULT_SIDEBAR_WIDTH);
		lastExpandedWidthRef.current = DEFAULT_SIDEBAR_WIDTH;
		try {
			localStorage.setItem(
				SIDEBAR_WIDTH_STORAGE_KEY,
				String(DEFAULT_SIDEBAR_WIDTH),
			);
		} catch {}
	}, []);

	const resetWidth = React.useCallback(() => {
		handleDoubleClick();
	}, [handleDoubleClick]);

	return {
		handleRef,
		isMobile,
		open,
		width,
		setWidth,
		isResizing,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
		handleLostPointerCapture,
		handleKeyDown,
		handleDoubleClick,
		resetWidth,
	};
}
