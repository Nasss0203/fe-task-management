import { LayoutGrid } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<div className='relative isolate min-h-screen overflow-hidden'>
			<div
				aria-hidden='true'
				className='absolute inset-0 -z-20 bg-sidebar dark:bg-slate-950'
			/>
			<div
				aria-hidden='true'
				className='absolute inset-0 -z-10 dark:hidden bg-[radial-gradient(circle_at_top_left,rgba(67,97,238,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.18),transparent_28%)]'
			/>
			<div
				aria-hidden='true'
				className='absolute inset-0 -z-10 hidden dark:block bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.16),transparent_28%)]'
			/>
			<div
				aria-hidden='true'
				className='absolute inset-0 -z-10 dark:hidden bg-[linear-gradient(rgba(255,255,255,0.65)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.65)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]'
			/>
			<div
				aria-hidden='true'
				className='absolute inset-0 -z-10 hidden dark:block bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]'
			/>
			<div
				aria-hidden='true'
				className='absolute left-1/2 top-24 -z-10 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-primary/[0.12] blur-[140px] dark:bg-primary/20'
			/>

			<header className='relative z-10 px-6 pt-6 sm:px-8 lg:px-10 xl:px-12'>
				<Link
					href='/'
					className='inline-flex items-center gap-3 text-slate-950 dark:text-white'
				>
					<div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/10 dark:bg-white dark:text-slate-950'>
						<LayoutGrid className='h-4 w-4' />
					</div>
					<div className='space-y-0.5'>
						<div className='text-base font-semibold tracking-tight'>
							Taskmanly
						</div>
						<div className='text-xs text-slate-500 dark:text-slate-400'>
							Project execution without the clutter
						</div>
					</div>
				</Link>
			</header>

			<main className='relative z-10 mx-auto flex w-full min-h-[calc(100vh-5rem)] max-w-7xl items-center justify-center px-6 pb-10 pt-8 sm:px-8 lg:px-10 xl:px-12'>
				<div className='flex w-full justify-center'>{children}</div>
			</main>
		</div>
	);
}
