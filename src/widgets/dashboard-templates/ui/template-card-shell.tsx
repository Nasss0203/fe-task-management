import React from "react";
import { cn } from "@/shared/lib/utils";

interface TemplateCardShellProps {
	preview: React.ReactNode;
	badgeOverlay?: React.ReactNode;
	meta?: React.ReactNode;
	title: React.ReactNode;
	description?: React.ReactNode;
	footer: React.ReactNode;
	className?: string;
	onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function TemplateCardShell({
	preview,
	badgeOverlay,
	meta,
	title,
	description,
	footer,
	className,
	onClick,
}: TemplateCardShellProps) {
	return (
		<div
			onClick={onClick}
			className={cn(
				"group flex flex-col h-full rounded-2xl border border-border/80 bg-card p-4 shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1",
				onClick && "cursor-pointer",
				className,
			)}
		>
			{/* Preview Container */}
			<div className='relative h-44 w-full shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted/20 mb-3.5'>
				{preview}

				{badgeOverlay && (
					<div className='absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5'>
						{badgeOverlay}
					</div>
				)}
			</div>

			{/* Meta Row (e.g. Tags or Status) */}
			{meta && (
				<div className='flex flex-wrap items-center gap-1.5 mb-2 min-h-5'>
					{meta}
				</div>
			)}

			{/* Content Area */}
			<div className='flex flex-col flex-1'>
				<h3 className='text-base font-semibold text-foreground group-hover:text-primary transition-colors tracking-tight line-clamp-1'>
					{title}
				</h3>

				<p className='mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1'>
					{description}
				</p>

				{/* Footer / Actions */}
				<div className='mt-5 pt-3 border-t border-border/60'>
					{footer}
				</div>
			</div>
		</div>
	);
}
