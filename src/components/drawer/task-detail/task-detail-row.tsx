"use client";

import { cn } from "@/lib/utils";
import type { DetailRowProps } from "./task-detail-types";

export function DetailRow({
	icon: Icon,
	label,
	children,
	className,
}: DetailRowProps) {
	return (
		<div className={cn("grid gap-3 sm:grid-cols-[136px_minmax(0,1fr)]", className)}>
			<div className='flex items-start gap-2 pt-1 text-sm font-medium text-muted-foreground'>
				<Icon className='mt-0.5 size-4 shrink-0 text-muted-foreground' />
				<span>{label}</span>
			</div>
			<div className='min-w-0'>{children}</div>
		</div>
	);
}
