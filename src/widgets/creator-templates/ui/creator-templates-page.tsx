"use client";

import {
	ChevronLeft,
	ChevronRight,
	LayoutTemplate,
	Loader2,
	Plus,
	Search,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useInfiniteTemplates } from "@/entities/template";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import { CreatorTemplateTable } from "./creator-template-table";

const PAGE_SIZE = 10;

export function CreatorTemplatesPage() {
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 350);
	// The page index belongs to one search; a new search starts at page 1.
	const [paging, setPaging] = useState({ search: "", page: 0 });
	const query = useInfiniteTemplates({
		scope: "mine",
		search: debouncedSearch,
		limit: PAGE_SIZE,
	});
	// shortcut: the API is cursor-based with no total, so only Previous/Next; add page numbers if it returns a count.
	const pages = query.data?.pages ?? [];
	// Clamp when a refetch returns fewer pages (e.g. after archiving).
	const page = Math.min(
		paging.search === debouncedSearch ? paging.page : 0,
		Math.max(pages.length - 1, 0),
	);
	const templates = pages[page]?.items ?? [];
	const hasNext = page < pages.length - 1 || query.hasNextPage;
	const isSearching = Boolean(debouncedSearch.trim());

	const goTo = async (next: number) => {
		if (next >= pages.length) {
			const result = await query.fetchNextPage();
			if (result.isError) return;
		}
		setPaging({ search: debouncedSearch, page: next });
	};

	return (
		<div className='flex flex-col gap-6'>
			<header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
				<div className='flex flex-col gap-1'>
					<h1 className='text-2xl font-semibold tracking-tight'>
						My templates
					</h1>
					<p className='text-sm text-muted-foreground'>
						Manage versions and marketplace listings for templates you
						created.
					</p>
				</div>
				<Button asChild size='sm' className='w-fit shrink-0'>
					<Link href='/dashboard'>
						<Plus className='size-4' />
						Create from a page
					</Link>
				</Button>
			</header>

			<div className='relative w-full sm:max-w-xs'>
				<Search className='pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground' />
				<Input
					type='search'
					value={search}
					onChange={(event) => setSearch(event.target.value)}
					placeholder='Search templates'
					aria-label='Search templates'
					className='pl-8'
				/>
			</div>

			<CreatorTemplateTable
				templates={templates}
				isPending={query.isPending}
				isError={query.isError}
				onRetry={() => query.refetch()}
				skeletonRows={5}
				empty={
					<div className='flex flex-col items-center gap-3 px-6 py-14 text-center'>
						<span className='flex size-10 items-center justify-center rounded-lg bg-muted'>
							<LayoutTemplate className='size-5 text-muted-foreground' />
						</span>
						<div className='flex flex-col gap-1'>
							<p className='text-sm font-medium'>
								{isSearching
									? "No templates match your search"
									: "No templates yet"}
							</p>
							<p className='max-w-sm text-sm text-muted-foreground'>
								{isSearching
									? "Try a different name."
									: "Open a page in your workspace, click ••• and choose Save as template."}
							</p>
						</div>
					</div>
				}
			/>

			{(page > 0 || hasNext) && (
				<nav
					aria-label='Templates pagination'
					className='flex items-center justify-center gap-3'
				>
					<Button
						variant='outline'
						size='sm'
						disabled={page === 0}
						onClick={() => goTo(page - 1)}
					>
						<ChevronLeft className='size-3.5' />
						Previous
					</Button>
					<span className='text-sm tabular-nums text-muted-foreground'>
						Page {page + 1}
					</span>
					<Button
						variant='outline'
						size='sm'
						disabled={!hasNext || query.isFetchingNextPage}
						onClick={() => goTo(page + 1)}
					>
						Next
						{query.isFetchingNextPage ? (
							<Loader2 className='size-3.5 animate-spin' />
						) : (
							<ChevronRight className='size-3.5' />
						)}
					</Button>
				</nav>
			)}
		</div>
	);
}
