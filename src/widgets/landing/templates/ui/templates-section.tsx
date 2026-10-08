"use client";

import { LayoutTemplate, Search } from "lucide-react";
import { useDeferredValue, useState } from "react";

import { useInfinitePublicTemplates } from "@/entities/template/model/template.queries";
import { Button } from "@/shared/ui/button";

import TemplateCard from "./template-card";

export default function TemplatesSection() {
	const [searchQuery, setSearchQuery] = useState("");

	const deferredSearch = useDeferredValue(searchQuery);

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
		limit: 20,
	});

	const templates = data?.pages.flatMap((page) => page.items) ?? [];

	return (
		<section className='py-12 sm:py-20'>
			<div className='mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
				{/* Page Hero */}
				<div className='max-w-3xl mb-12 sm:mb-14'>
					<div className='inline-flex items-center gap-1.5 rounded-full border border-teal-500/20 bg-teal-500/5 px-3 py-1 text-xs font-semibold text-teal-600 dark:text-teal-400 mb-4'>
						<LayoutTemplate className='h-3.5 w-3.5' />
						Curated Starter Frameworks
					</div>

					<h1 className='text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]'>
						Templates for every team and workflow
					</h1>

					<p className='mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed'>
						Jumpstart your setup with ready-to-use templates for
						docs, databases, knowledge bases, and team workflows.
					</p>
				</div>

				{/* Search */}
				<div className='mb-10'>
					<div className='relative max-w-md w-full'>
						<Search className='absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />

						<input
							type='search'
							aria-label='Search templates'
							placeholder='Search templates...'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className='w-full h-11 pl-10 pr-4 rounded-xl border border-border/80 bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-xs'
						/>
					</div>
				</div>

				{/* Loading */}
				{isLoading && (
					<div className='py-16 text-center text-sm text-muted-foreground'>
						Loading templates...
					</div>
				)}

				{/* Error */}
				{isError && (
					<div role='alert' className='py-16 text-center text-sm text-destructive'>
						<p>Unable to load templates.</p>
						<Button type='button' variant='outline' className='mt-4' onClick={() => refetch()}>
							Try again
						</Button>
					</div>
				)}

				{/* Template Grid */}
				{!isLoading && !isError && (
					<>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch'>
							{templates.map((template) => (
								<TemplateCard
									key={template.id}
									item={template}
								/>
							))}

							{templates.length === 0 && (
								<div className='col-span-full py-16 text-center text-muted-foreground rounded-2xl border border-dashed border-border/80 bg-card/40 p-8'>
									<p className='text-sm font-medium text-foreground'>
										No templates found
									</p>

									<p className='text-xs text-muted-foreground mt-1'>
										Try another search keyword.
									</p>
								</div>
							)}
						</div>

						{/* Cursor pagination */}
						{hasNextPage && (
							<div className='mt-10 flex justify-center'>
								<Button
									type='button'
									variant='outline'
									disabled={isFetchingNextPage}
									onClick={() => fetchNextPage()}
								>
									{isFetchingNextPage
										? "Loading..."
										: "Load more"}
								</Button>
							</div>
						)}
					</>
				)}
			</div>
		</section>
	);
}
