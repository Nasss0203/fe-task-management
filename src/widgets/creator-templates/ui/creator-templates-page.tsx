"use client";

import { LayoutTemplate, Loader2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useInfiniteTemplates } from "@/entities/template";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import { CreatorTemplateTable } from "./creator-template-table";

export function CreatorTemplatesPage() {
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 350);
	const query = useInfiniteTemplates({
		scope: "mine",
		search: debouncedSearch,
	});
	const templates = query.data?.pages.flatMap((page) => page.items) ?? [];
	const isSearching = Boolean(debouncedSearch.trim());

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

			{query.hasNextPage && (
				<Button
					variant='outline'
					size='sm'
					className='self-center'
					disabled={query.isFetchingNextPage}
					onClick={() => query.fetchNextPage()}
				>
					{query.isFetchingNextPage && (
						<Loader2 className='size-3.5 animate-spin' />
					)}
					Load more
				</Button>
			)}
		</div>
	);
}
