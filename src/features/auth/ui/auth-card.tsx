import GoogleLoginButton from "./google-login-button";
import { Separator } from "@/shared/ui/separator";
import { cn } from "@/shared/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";

export const authInputClassName =
	"h-11 rounded-xl border border-border/80 bg-background/80 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 shadow-2xs focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all";

export const authSubmitButtonClassName =
	"h-11 w-full rounded-xl text-sm font-semibold bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 active:scale-[0.98] transition-all";

export interface AuthCardProps {
	title?: ReactNode;
	description?: ReactNode;
	icon?: ReactNode;
	alternateText?: string;
	alternateHref?: string;
	alternateLabel?: string;
	googleLabel?: string;
	children?: ReactNode;
	footer?: ReactNode;
	className?: string;
}

export function AuthCard({
	title,
	description,
	icon,
	alternateText,
	alternateHref,
	alternateLabel,
	googleLabel,
	children,
	footer,
	className,
}: AuthCardProps) {
	const hasFooter = Boolean(
		footer || googleLabel || (alternateText && alternateHref && alternateLabel)
	);

	return (
		<div
			className={cn(
				"relative flex max-h-full w-full max-w-md flex-col rounded-2xl border border-border/80 bg-card/90 shadow-xl shadow-black/5 dark:shadow-black/20 backdrop-blur-xl overflow-hidden",
				className
			)}
		>
			{/* Fixed / pinned Card Header */}
			{(title || description || icon) && (
				<div className='shrink-0 px-6 pt-6 pb-2 sm:px-8 sm:pt-7 sm:pb-3 flex flex-col gap-2'>
					{icon && <div className='mb-1 flex'>{icon}</div>}
					{title && (
						<h1 className='text-xl font-bold tracking-tight text-foreground sm:text-2xl'>
							{title}
						</h1>
					)}
					{description && (
						<p className='text-xs sm:text-sm text-muted-foreground leading-relaxed'>
							{description}
						</p>
					)}
				</div>
			)}

			{/* Scrollable Form Content - only scrolls if content overflows available height */}
			{children && (
				<div className='min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-2 sm:px-8 [scrollbar-width:thin]'>
					{children}
				</div>
			)}

			{/* Fixed / pinned Card Footer */}
			{hasFooter && (
				<div className='shrink-0 px-6 pt-2 pb-6 sm:px-8 sm:pb-7 flex flex-col gap-3.5 border-t border-border/50 mt-1'>
					{footer}

					{googleLabel && (
						<>
							<div className='flex w-full items-center gap-3 pt-1'>
								<Separator className='flex-1' />
								<span className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground'>
									Hoặc tiếp tục với
								</span>
								<Separator className='flex-1' />
							</div>

							<GoogleLoginButton label={googleLabel} />
						</>
					)}

					{alternateText && alternateHref && alternateLabel && (
						<div className='flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-0.5'>
							<span>{alternateText}</span>
							<Link
								href={alternateHref}
								className='font-semibold text-foreground transition-colors hover:text-primary hover:underline'
							>
								{alternateLabel}
							</Link>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
