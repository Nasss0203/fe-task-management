"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { usePagesByWorkspace } from "@/entities/page/model/page.queries";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatRelativeTime } from "../lib/format-relative-time";

interface RecentContentSectionProps {
	workspaceId?: string;
}

export function RecentContentSection({ workspaceId }: RecentContentSectionProps) {
	const router = useRouter();
	const { data: pages = [], isLoading, isError } = usePagesByWorkspace(workspaceId);

	const recentPages = useMemo(() => {
		return [...pages]
			.sort(
				(a, b) =>
					new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
			)
			.slice(0, 4);
	}, [pages]);

	return (
		<section className='space-y-3' aria-labelledby='recent-content-heading'>
			<h2
				id='recent-content-heading'
				className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'
			>
				Recently updated
			</h2>

			{isLoading ? (
				<div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
					{Array.from({ length: 4 }).map((_, idx) => (
						<Skeleton key={idx} className='h-20 w-full rounded-lg' />
					))}
				</div>
			) : isError ? (
				<p className='text-xs text-muted-foreground'>
					Unable to load recent pages.
				</p>
			) : recentPages.length === 0 ? (
				<div className='rounded-lg border border-dashed border-border/60 p-5 text-center'>
					<p className='text-xs text-muted-foreground'>
						No pages updated recently.
					</p>
				</div>
			) : (
				<div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
					{recentPages.map((page) => (
						<button
							key={page.id}
							type='button'
							onClick={() => router.push(`/page/${page.id}`)}
							className='flex flex-col justify-between rounded-lg border border-border/60 bg-card p-3.5 text-left transition-colors hover:border-border hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
						>
							<div className='flex items-center gap-2 overflow-hidden'>
								<span className='shrink-0 text-base'>
									{page.icon || "📄"}
								</span>
								<span className='truncate text-sm font-medium text-foreground'>
									{page.title || "Untitled"}
								</span>
							</div>

							<span className='mt-3 text-xs text-muted-foreground'>
								Edited {formatRelativeTime(page.updatedAt)}
							</span>
						</button>
					))}
				</div>
			)}
		</section>
	);
}
