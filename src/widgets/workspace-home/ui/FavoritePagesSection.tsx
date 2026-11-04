"use client";

import { useRouter } from "next/navigation";

import { usePageFavorites } from "@/entities/page/model/page.queries";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";

interface FavoritePagesSectionProps {
	workspaceId?: string;
}

export function FavoritePagesSection({ workspaceId }: FavoritePagesSectionProps) {
	const router = useRouter();
	const { data: favorites = [], isLoading, isError } = usePageFavorites(workspaceId);

	return (
		<section className='space-y-3' aria-labelledby='favorites-heading'>
			<h2
				id='favorites-heading'
				className='text-[11.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground'
			>
				Favorites
			</h2>

			{isLoading ? (
				<div className='divide-y divide-border rounded-xl border border-border bg-card'>
					{Array.from({ length: 3 }).map((_, idx) => (
						<div key={idx} className='flex items-center gap-3 p-3'>
							<Skeleton className='size-4 rounded' />
							<Skeleton className='h-4 w-48' />
						</div>
					))}
				</div>
			) : isError ? (
				<p className='text-xs text-muted-foreground'>
					Unable to load favorite pages.
				</p>
			) : favorites.length === 0 ? (
				<div className='rounded-xl border border-dashed border-border p-5 text-center'>
					<p className='text-xs text-muted-foreground'>
						No favorites yet. Star a page to find it quickly here.
					</p>
				</div>
			) : (
				<div className='divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-xs'>
					{favorites.slice(0, 6).map((page) => (
						<button
							key={page.id}
							type='button'
							onClick={() => router.push(`/page/${page.id}`)}
							className='flex h-11.5 w-full items-center justify-between px-4 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
						>
							<div className='flex min-w-0 items-center gap-2.5'>
								<span className='text-sm shrink-0'>
									{page.icon || "📄"}
								</span>
								<span className='truncate text-[13.5px] font-medium text-foreground'>
									{page.title || "Untitled"}
								</span>
							</div>

							<span className='ml-4 shrink-0 text-xs text-muted-foreground'>
								Edited {formatRelativeTime(page.updatedAt)}
							</span>
						</button>
					))}
				</div>
			)}
		</section>
	);
}
