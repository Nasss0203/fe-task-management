"use client";

import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

import { usePageFavorites } from "@/entities/page/model/page.queries";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatRelativeTime } from "../lib/format-relative-time";

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
				className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'
			>
				Favorites
			</h2>

			{isLoading ? (
				<div className='divide-y divide-border/40 rounded-lg border border-border/60 bg-card p-1'>
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
				<div className='rounded-lg border border-dashed border-border/60 p-5 text-center'>
					<p className='text-xs text-muted-foreground'>
						No favorites yet. Star a page to find it quickly here.
					</p>
				</div>
			) : (
				<div className='divide-y divide-border/40 rounded-lg border border-border/60 bg-card overflow-hidden'>
					{favorites.slice(0, 6).map((page) => (
						<button
							key={page.id}
							type='button'
							onClick={() => router.push(`/page/${page.id}`)}
							className='flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
						>
							<div className='flex items-center gap-2.5 min-w-0'>
								<Star className='size-3.5 text-amber-500 fill-amber-500 shrink-0' />
								<span className='text-sm shrink-0'>
									{page.icon || "📄"}
								</span>
								<span className='truncate font-medium text-foreground'>
									{page.title || "Untitled"}
								</span>
							</div>

							<span className='ml-4 text-xs text-muted-foreground shrink-0'>
								Edited {formatRelativeTime(page.updatedAt)}
							</span>
						</button>
					))}
				</div>
			)}
		</section>
	);
}
