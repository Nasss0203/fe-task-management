"use client";

import type { MouseEvent, ReactNode, SyntheticEvent } from "react";

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
		if (canEdit) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
	};

	const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
		if (canEdit) {
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
