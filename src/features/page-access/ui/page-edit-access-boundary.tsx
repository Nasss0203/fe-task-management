"use client";

import React from "react";

interface PageEditAccessBoundaryProps {
	canEdit: boolean;
	onRequestEdit: () => void;
	children: React.ReactNode;
}

export function PageEditAccessBoundary({
	canEdit,
	onRequestEdit,
	children,
}: PageEditAccessBoundaryProps) {
	const handleClick = () => {
		if (canEdit) {
			return;
		}

		onRequestEdit();
	};

	return (
		<div className='relative' onClickCapture={handleClick}>
			{children}
		</div>
	);
}
