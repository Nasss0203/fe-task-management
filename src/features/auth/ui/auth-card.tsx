import GoogleLoginButton from "./google-login-button";
import { Separator } from "@/shared/ui/separator";
import { cn } from "@/shared/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";

export const authInputClassName =
	"h-11 rounded-xl border border-input bg-background px-3.5 text-sm text-foreground placeholder:text-faint md:text-sm shadow-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20";

export const authSubmitButtonClassName =
	"h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-none transition-colors hover:bg-primary/90";

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
				"relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_16px_20px_rgba(0,0,0,0.06)] dark:shadow-black/20",
				className
			)}
		>
			{/* Fixed / pinned Card Header */}
			{(title || description || icon) && (
				<div className='flex shrink-0 flex-col gap-2 px-6 pt-6 pb-2.5 sm:px-8 sm:pt-7'>
					{icon && <div className='mb-1 flex'>{icon}</div>}
					{title && (
						<h1 className='text-xl font-bold leading-9 tracking-tight text-foreground sm:text-2xl'>
							{title}
						</h1>
					)}
					{description && (
						<p className='text-[13.5px] leading-5 text-muted-foreground'>
							{description}
						</p>
					)}
				</div>
			)}

			{children && (
				<div className='px-6 pt-2 pb-4 sm:px-8'>
					{children}
				</div>
			)}

			{/* Fixed / pinned Card Footer */}
			{hasFooter && (
				<div className='flex shrink-0 flex-col gap-3.5 border-t border-border px-6 pt-3.5 pb-6 sm:px-8 sm:pb-7'>
					{footer}

					{googleLabel && (
						<>
							<div className='flex w-full items-center gap-2.5'>
								<Separator className='flex-1' />
								<span className='text-[11px] font-medium uppercase tracking-[0.6px] text-muted-foreground'>
									Hoặc tiếp tục với
								</span>
								<Separator className='flex-1' />
							</div>

							<GoogleLoginButton label={googleLabel} />
						</>
					)}

					{alternateText && alternateHref && alternateLabel && (
						<div className='flex items-center justify-center gap-1.5 text-[12.5px] text-muted-foreground'>
							<span>{alternateText}</span>
							<Link
								href={alternateHref}
								className='font-semibold text-foreground hover:underline'
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
