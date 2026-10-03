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
			className={`relative rounded-2xl border border-border/80 bg-card shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col transition-all duration-300 ${className}`}
		>
			{/* Top Browser Header Bar */}
			<div className='flex h-11 items-center justify-between border-b border-border/60 bg-muted/40 px-4 select-none shrink-0'>
				<div className='flex items-center gap-2 w-20'>
					<div className='h-3 w-3 rounded-full bg-red-400/80 transition-opacity hover:opacity-100' />
					<div className='h-3 w-3 rounded-full bg-amber-400/80 transition-opacity hover:opacity-100' />
					<div className='h-3 w-3 rounded-full bg-emerald-400/80 transition-opacity hover:opacity-100' />
				</div>

				{/* URL bar */}
				<div className='flex h-7 flex-1 max-w-sm sm:max-w-md items-center justify-center gap-2 rounded-lg border border-border/50 bg-background/80 px-3 text-xs text-muted-foreground shadow-xs'>
					<Lock className='h-3 w-3 text-emerald-500' />
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
