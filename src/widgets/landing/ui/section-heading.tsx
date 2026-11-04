import React from "react";

interface SectionHeadingProps {
	eyebrow?: React.ReactNode;
	title: React.ReactNode;
	description?: React.ReactNode;
	align?: "center" | "left";
	className?: string;
}

export function SectionHeading({
	eyebrow,
	title,
	description,
	align = "center",
	className = "",
}: SectionHeadingProps) {
	const isCenter = align === "center";

	return (
		<div
			className={`space-y-4 ${
				isCenter ? "mx-auto max-w-2xl text-center" : "max-w-2xl text-left"
			} ${className}`}
		>
			{eyebrow && (
				<div
					className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground ${
						isCenter ? "mx-auto" : ""
					}`}
				>
					{eyebrow}
				</div>
			)}

			<h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.15]'>
				{title}
			</h2>

			{description && (
				<p className='text-base sm:text-lg text-muted-foreground leading-relaxed'>
					{description}
				</p>
			)}
		</div>
	);
}
