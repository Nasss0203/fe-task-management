import React from "react";

interface MarketingContainerProps {
	children: React.ReactNode;
	className?: string;
	id?: string;
}

export function MarketingContainer({
	children,
	className = "",
	id,
}: MarketingContainerProps) {
	return (
		<div
			id={id}
			className={`mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}
		>
			{children}
		</div>
	);
}
