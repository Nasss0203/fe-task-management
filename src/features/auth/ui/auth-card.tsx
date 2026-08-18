import GoogleLoginButton from "./google-login-button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { cn } from "@/shared/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";

interface AuthCardProps {
	title: string;
	description: string;
	alternateText: string;
	alternateHref: string;
	alternateLabel: string;
	googleLabel: string;
	children: ReactNode;
	className?: string;
}

const socialButtonClassName =
	"h-11 w-full justify-center rounded-xl border-slate-200/80 bg-white/90 text-sm font-semibold text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10";

export function AuthCard({
	title,
	description,
	alternateText,
	alternateHref,
	alternateLabel,
	googleLabel,
	children,
	className,
}: AuthCardProps) {
	return (
		<Card
			className={cn(
				"relative w-full max-w-xl overflow-hidden border-white/70 bg-white/[0.92] py-0 shadow-[0_36px_90px_-48px_rgba(15,23,42,0.65)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/[0.72]",
				className,
			)}
		>
			<div
				aria-hidden='true'
				className='absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-sky-400 to-emerald-400'
			/>

			<CardHeader className='gap-3 px-6 pb-0 pt-8 sm:px-8'>
				<CardTitle className='text-[1.95rem] font-semibold tracking-tight text-slate-950 dark:text-white sm:text-[2.15rem]'>
					{title}
				</CardTitle>
				<CardDescription className='max-w-sm text-[15px] leading-6 text-slate-500 dark:text-slate-300'>
					{description}
				</CardDescription>
			</CardHeader>

			<CardContent className='px-6 pb-0 pt-6 sm:px-8'>
				{children}

				<div className='mt-6 flex items-center justify-center gap-1.5 text-sm text-slate-500 dark:text-slate-300'>
					<span>{alternateText}</span>
					<Link
						href={alternateHref}
						className='font-semibold text-slate-950 transition-colors hover:text-primary hover:underline dark:text-white'
					>
						{alternateLabel}
					</Link>
				</div>
			</CardContent>

			<CardFooter className='mb-0 flex-col gap-6 border-t border-slate-100 px-6 pb-8 pt-6 sm:px-8 dark:border-white/10'>
				<div className='flex w-full items-center gap-3'>
					<Separator className='flex-1 bg-slate-200 dark:bg-white/10' />
					<span className='text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500'>
						Hoặc tiếp tục với
					</span>
					<Separator className='flex-1 bg-slate-200 dark:bg-white/10' />
				</div>

				<div className='grid w-full gap-3'>
					<GoogleLoginButton
						label={googleLabel}
						variant='outline'
						className={socialButtonClassName}
					/>
				</div>
			</CardFooter>
		</Card>
	);
}
