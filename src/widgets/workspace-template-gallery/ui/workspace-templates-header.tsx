"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/lib/utils";

const TABS = [
	{ href: "/dashboard/templates", label: "Marketplace" },
	{ href: "/dashboard/templates/library", label: "Your library" },
];

/** Shared header for the workspace marketplace and the claimed-templates library. */
export function WorkspaceTemplatesHeader({ description }: { description: string }) {
	const pathname = usePathname();

	return (
		<header className='flex flex-col gap-4'>
			<div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
				<div className='flex flex-col gap-1'>
					<h1 className='text-2xl font-semibold tracking-tight'>Templates</h1>
					<p className='text-sm text-muted-foreground'>{description}</p>
				</div>
				<Link
					href='/creator/templates'
					className='inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground'
				>
					Manage your own templates
					<ArrowRight className='size-3.5' />
				</Link>
			</div>

			<nav aria-label='Templates sections' className='flex gap-1 border-b'>
				{TABS.map((tab) => {
					const active = pathname === tab.href;
					return (
						<Link
							key={tab.href}
							href={tab.href}
							aria-current={active ? "page" : undefined}
							className={cn(
								"-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
								active
									? "border-foreground text-foreground"
									: "border-transparent text-muted-foreground hover:text-foreground",
							)}
						>
							{tab.label}
						</Link>
					);
				})}
			</nav>
		</header>
	);
}
