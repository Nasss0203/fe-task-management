"use client";

import type { MouseEvent, ReactNode, SyntheticEvent } from "react";

/** Phần có `data-read-only-allowed` (vd nút / popover comment) vẫn bấm được khi chỉ xem. */
function isReadOnlyAllowed(target: EventTarget): boolean {
	return (
		target instanceof Element &&
		target.closest("[data-read-only-allowed]") !== null
	);
}

interface PageEditAccessBoundaryProps {
	canEdit: boolean;
	onRequestEdit: () => void;
	children: ReactNode;
}

export function PageEditAccessBoundary({
	canEdit,
	onRequestEdit,
	children,
}: PageEditAccessBoundaryProps) {
	const preventEditorInteraction = (
		event: SyntheticEvent<HTMLDivElement>,
	) => {
		// Popover render qua portal nhưng sự kiện React vẫn nổi lên đây
		if (canEdit || isReadOnlyAllowed(event.target)) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
	};

	const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
		if (canEdit || isReadOnlyAllowed(event.target)) {
			return;
		}

		preventEditorInteraction(event);
		onRequestEdit();
	};

	return (
		<div className='relative'>
			<div
				onPointerDownCapture={preventEditorInteraction}
				onMouseDownCapture={preventEditorInteraction}
				onClickCapture={handleClickCapture}
			>
				{children}
			</div>
		</div>
	);
}
