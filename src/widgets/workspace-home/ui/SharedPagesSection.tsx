"use client";

import { useRouter } from "next/navigation";

import type { PageShareAccessLevel } from "@/entities/page-share/model/page-share.types";
import { useSharedWithMePages } from "@/entities/page-share/model/page-share.queries";
import { Skeleton } from "@/shared/ui/skeleton";

interface SharedPagesSectionProps {
	workspaceId?: string;
}

function formatAccessLevel(level: PageShareAccessLevel): string {
	switch (level) {
		case "FULL_ACCESS":
			return "Full access";
		case "EDITOR":
			return "Editor";
		case "COMMENTER":
			return "Commenter";
		case "VIEWER":
			return "Viewer";
		default:
			return level;
	}
}

export function SharedPagesSection({ workspaceId }: SharedPagesSectionProps) {
	const router = useRouter();
	const { data: sharedPages = [], isLoading, isError } = useSharedWithMePages();

	// Optionally prioritize/filter pages belonging to the active workspace if present
	const displayedPages =
		workspaceId && sharedPages.some((p) => p.workspace_id === workspaceId)
			? sharedPages.filter((p) => p.workspace_id === workspaceId)
			: sharedPages;

	return (
		<section className='space-y-3' aria-labelledby='shared-pages-heading'>
			<h2
				id='shared-pages-heading'
				className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'
			>
				Shared with me
			</h2>

			{isLoading ? (
				<div className='divide-y divide-border/40 rounded-lg border border-border/60 bg-card p-1'>
					{Array.from({ length: 3 }).map((_, idx) => (
						<div key={idx} className='flex items-center justify-between p-3'>
							<Skeleton className='h-4 w-40' />
							<Skeleton className='h-4 w-16' />
						</div>
					))}
				</div>
			) : isError ? (
				<p className='text-xs text-muted-foreground'>
					Unable to load shared pages.
				</p>
			) : displayedPages.length === 0 ? (
				<div className='rounded-lg border border-dashed border-border/60 p-5 text-center'>
					<p className='text-xs text-muted-foreground'>
						No pages shared with you yet.
					</p>
				</div>
			) : (
				<div className='divide-y divide-border/40 rounded-lg border border-border/60 bg-card overflow-hidden'>
					{displayedPages.slice(0, 6).map((page) => (
						<button
							key={page.id}
							type='button'
							onClick={() => router.push(`/page/${page.id}`)}
							className='flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
						>
							<div className='flex items-center gap-2.5 min-w-0'>
								<span className='text-sm shrink-0'>
									{page.icon || "📄"}
								</span>
								<span className='truncate font-medium text-foreground'>
									{page.title || "Untitled"}
								</span>
							</div>

							<span className='ml-4 inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground shrink-0'>
								{formatAccessLevel(page.accessLevel)}
							</span>
						</button>
					))}
				</div>
			)}
		</section>
	);
}
