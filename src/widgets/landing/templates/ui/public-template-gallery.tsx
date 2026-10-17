"use client";

import { Search } from "lucide-react";
import { useDeferredValue, useState } from "react";

import {
	useInfinitePublicTemplates,
	useTemplateCategories,
} from "@/entities/template";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

import TemplateCard from "./template-card";

interface PublicTemplateGalleryProps {
	/** Where a card links to: the landing or the workspace detail page. */
	detailHref: (templateId: string) => string;
}

/**
 * Marketplace gallery shared by the landing page and the workspace. Data comes
 * only from GET /public/templates; search and category are filtered server-side.
 */
export function PublicTemplateGallery({ detailHref }: PublicTemplateGalleryProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [category, setCategory] = useState<string | undefined>();
	const deferredSearch = useDeferredValue(searchQuery);

	const { data: categories = [] } = useTemplateCategories();
	const {
		data,
		isLoading,
		isError,
		refetch,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
	} = useInfinitePublicTemplates({
		search: deferredSearch,
		category,
		limit: 20,
	});

	const templates = data?.pages.flatMap((page) => page.items) ?? [];
	const isFiltered = Boolean(deferredSearch.trim() || category);

	return (
		<div className='flex flex-col gap-6'>
			<div className='flex flex-col gap-4'>
				<div className='relative w-full max-w-md'>
					<Search className='absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
					<input
						type='search'
						aria-label='Search templates'
						placeholder='Search templates...'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='h-11 w-full rounded-xl border border-border/80 bg-background pl-10 pr-4 text-sm text-foreground shadow-xs transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20'
					/>
				</div>

				{categories.length > 0 && (
					<div
						role='group'
						aria-label='Filter by category'
						className='flex flex-wrap gap-2'
					>
						<CategoryChip
							label='All'
							selected={!category}
							onClick={() => setCategory(undefined)}
						/>
						{categories.map((item) => (
							<CategoryChip
								key={item.id}
								label={item.name}
								selected={category === item.slug}
								onClick={() =>
									setCategory(category === item.slug ? undefined : item.slug)
								}
							/>
						))}
					</div>
				)}
			</div>

			{isLoading && (
				<div className='grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3'>
					{Array.from({ length: 6 }).map((_, index) => (
						<div
							key={index}
							className='flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card p-0'
						>
							<Skeleton className='aspect-[16/10] w-full rounded-none' />
							<div className='space-y-3 p-4 sm:p-5'>
								<Skeleton className='h-5 w-3/4 rounded' />
								<Skeleton className='h-4 w-full rounded' />
								<Skeleton className='h-4 w-2/3 rounded' />
								<div className='border-t border-border/40 pt-3'>
									<Skeleton className='h-3 w-1/4 rounded' />
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{isError && (
				<div role='alert' className='py-16 text-center text-sm text-destructive'>
					<p>Unable to load templates.</p>
					<Button
						type='button'
						variant='outline'
						className='mt-4'
						onClick={() => refetch()}
					>
						Try again
					</Button>
				</div>
			)}

			{!isLoading && !isError && (
				<>
					<div className='grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3'>
						{templates.map((template) => (
							<TemplateCard
								key={template.id}
								item={template}
								href={detailHref(template.id)}
							/>
						))}

						{templates.length === 0 && (
							<div className='col-span-full rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 py-16 text-center text-muted-foreground'>
								<p className='text-sm font-medium text-foreground'>
									No templates found
								</p>
								<p className='mt-1 text-xs text-muted-foreground'>
									{isFiltered
										? "Try another search keyword or category."
										: "Templates appear here once creators publish them."}
								</p>
							</div>
						)}
					</div>

					{hasNextPage && (
						<div className='mt-4 flex justify-center'>
							<Button
								type='button'
								variant='outline'
								disabled={isFetchingNextPage}
								onClick={() => fetchNextPage()}
							>
								{isFetchingNextPage ? "Loading..." : "Load more"}
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	);
}

function CategoryChip({
	label,
	selected,
	onClick,
}: {
	label: string;
	selected: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type='button'
			aria-pressed={selected}
			onClick={onClick}
			className={cn(
				"h-8 rounded-full border px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				selected
					? "border-foreground bg-foreground text-background"
					: "border-border/80 text-muted-foreground hover:bg-muted hover:text-foreground",
			)}
		>
			{label}
		</button>
	);
}
