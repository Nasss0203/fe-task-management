import React from "react";
import { cn } from "@/shared/lib/utils";

interface TemplateCardShellProps {
	preview: React.ReactNode;
	badges?: React.ReactNode;
	meta?: React.ReactNode;
	title: React.ReactNode;
	description?: React.ReactNode;
	footer: React.ReactNode;
	className?: string;
	onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function TemplateCardShell({
	preview,
	badges,
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
				"group flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:border-input",
				onClick && "cursor-pointer",
				className,
			)}
		>
			<div className='relative h-[150px] w-full shrink-0 overflow-hidden bg-muted'>
				{preview}
			</div>

			<div className='flex flex-1 flex-col gap-2 p-4'>
				<div className='flex min-w-0 items-center gap-2'>
					<h3 className='line-clamp-1 flex-1 text-sm font-semibold leading-[21px] text-foreground'>
						{title}
					</h3>

					{badges && (
						<div className='flex shrink-0 items-center gap-1'>{badges}</div>
					)}
				</div>

				<p className='line-clamp-2 flex-1 text-[13px] leading-5 text-muted-foreground'>
					{description}
				</p>

				{meta}

				<div className='pt-1'>{footer}</div>
			</div>
		</div>
	);
}
