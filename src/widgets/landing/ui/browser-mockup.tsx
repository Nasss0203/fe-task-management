import { Lock, ShieldCheck } from "lucide-react";
import React from "react";

interface BrowserMockupProps {
	children: React.ReactNode;
	url?: string;
	className?: string;
	title?: string;
}

export function BrowserMockup({
	children,
	url = "taskmanly.app/workspace/engineering",
	className = "",
	title,
}: BrowserMockupProps) {
	return (
		<div
			className={`relative rounded-xl border border-border bg-card shadow-soft overflow-hidden flex flex-col ${className}`}
		>
			{/* Top Browser Header Bar */}
			<div className='flex h-10 items-center justify-between border-b border-border/60 bg-muted/40 px-4 select-none shrink-0'>
				<div className='flex items-center gap-1.5 w-20'>
					<div className='h-2.5 w-2.5 rounded-full bg-rose-400/80 dark:bg-rose-400/70' />
					<div className='h-2.5 w-2.5 rounded-full bg-amber-400/80 dark:bg-amber-400/70' />
					<div className='h-2.5 w-2.5 rounded-full bg-emerald-400/80 dark:bg-emerald-400/70' />
				</div>

				{/* URL bar */}
				<div className='flex h-6.5 flex-1 max-w-sm sm:max-w-md items-center justify-center gap-2 rounded-md border border-border/60 bg-background px-3 text-xs text-muted-foreground'>
					<Lock className='h-3 w-3 text-emerald-600 dark:text-emerald-400' />
					<span className='font-mono text-[11px] truncate tracking-tight text-foreground/80'>
						{url}
					</span>
				</div>

				<div className='flex items-center justify-end gap-2 w-20 text-muted-foreground/60'>
					{title ? (
						<span className='text-[11px] font-medium text-muted-foreground truncate hidden sm:inline'>
							{title}
						</span>
					) : (
						<ShieldCheck className='h-3.5 w-3.5' />
					)}
				</div>
			</div>

			{/* Main Window Viewport */}
			<div className='relative flex-1 min-h-0 overflow-hidden'>{children}</div>
		</div>
	);
}
