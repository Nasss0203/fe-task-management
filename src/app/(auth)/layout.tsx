import { LayoutGrid } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import ThemeToggle from "@/shared/ui/dark-mode";

export default function AuthLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<div className='relative isolate flex h-dvh min-h-dvh flex-col overflow-hidden bg-background text-foreground selection:bg-primary/20'>
			{/* Subtle ambient lighting mesh matching landing page */}
			<div
				aria-hidden='true'
				className='pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.06),transparent_70%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.08),transparent_70%)]'
			/>

			{/* Brand Header */}
			<header className='relative z-10 flex h-14 shrink-0 items-center justify-between px-4 sm:px-6 md:px-8'>
				<Link href='/' className='flex items-center gap-2.5 shrink-0'>
					<div className='flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs'>
						<LayoutGrid className='h-4.5 w-4.5' />
					</div>
					<div className='flex flex-col'>
						<span className='text-sm font-bold tracking-tight text-foreground leading-none'>
							Taskmanly
						</span>
						<span className='hidden sm:block text-[11px] text-muted-foreground mt-0.5 leading-none'>
							The connected workspace
						</span>
					</div>
				</Link>

				<div className='flex items-center gap-2'>
					<ThemeToggle />
				</div>
			</header>

			{/* Main Content Area - strictly bounded within remaining dvh */}
			<main className='relative z-10 flex min-h-0 flex-1 items-center justify-center p-3 sm:p-4 md:p-6'>
				<div className='flex max-h-full w-full justify-center min-h-0'>
					{children}
				</div>
			</main>
		</div>
	);
}
