"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useDeferredValue, useState } from "react";

import {
	useInfinitePublicTemplates,
	useTemplateCategories,
	type TemplateOfferType,
} from "@/entities/template";
import type { PublicTemplateSort } from "@/entities/template/model/template.types";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

import TemplateCard from "./template-card";

interface PublicTemplateGalleryProps {
	/** Where a card links to: the landing or the workspace detail page. */
	detailHref: (templateId: string) => string;
}

const TAG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const SORT_OPTIONS: { label: string; value: PublicTemplateSort }[] = [
	{ label: "Newest", value: "newest" },
	{ label: "Top rated", value: "top_rated" },
	{ label: "Most liked", value: "most_liked" },
];

const OFFER_FILTERS: { label: string; value?: TemplateOfferType }[] = [
	{ label: "Any price" },
	{ label: "Free", value: "FREE" },
	{ label: "Paid", value: "PAID" },
];

/**
 * Marketplace gallery shared by the landing page and the workspace. Data comes
 * only from GET /public/templates; search, category, price and tag are
 * filtered server-side. The tag lives in the URL (?tag=) so tag links on a
 * template page open a filtered gallery.
 */
export function PublicTemplateGallery(props: PublicTemplateGalleryProps) {
	return (
		<Suspense fallback={null}>
			<PublicTemplateGalleryContent {...props} />
		</Suspense>
	);
}

function PublicTemplateGalleryContent({ detailHref }: PublicTemplateGalleryProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const rawTag = searchParams.get("tag")?.trim().toLowerCase();
	const tag = rawTag && TAG_PATTERN.test(rawTag) ? rawTag : undefined;

	const [searchQuery, setSearchQuery] = useState("");
	const [category, setCategory] = useState<string | undefined>();
	const [offerType, setOfferType] = useState<TemplateOfferType | undefined>();
	const [sort, setSort] = useState<PublicTemplateSort>("newest");
	const deferredSearch = useDeferredValue(searchQuery);

	const clearTag = () => {
		const params = new URLSearchParams(searchParams.toString());
		params.delete("tag");
		const query = params.toString();
		router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
	};

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
		tag,
		offerType,
		sort,
		limit: 20,
	});

	const templates = data?.pages.flatMap((page) => page.items) ?? [];
	const isFiltered = Boolean(
		deferredSearch.trim() || category || tag || offerType,
	);

	return (
		<div className='flex flex-col gap-6'>
			<div className='flex flex-col gap-3'>
				<div className='flex flex-wrap items-center gap-3'>
					<div className='relative w-full sm:w-[360px]'>
						<Search className='absolute left-3 top-1/2 size-[15px] -translate-y-1/2 text-muted-foreground' />
						<input
							type='search'
							aria-label='Search templates'
							placeholder='Search templates...'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className='h-9 w-full rounded-lg border border-input bg-background pl-[33px] pr-3 text-[13.5px] text-foreground transition-colors placeholder:text-faint focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20'
						/>
					</div>

					<div className='flex flex-wrap items-center gap-1.5 sm:ml-auto'>
						<div role='group' aria-label='Sort templates' className='flex gap-1.5'>
							{SORT_OPTIONS.map((option) => (
								<CategoryChip
									key={option.value}
									label={option.label}
									selected={sort === option.value}
									onClick={() => setSort(option.value)}
								/>
							))}
						</div>
						<span aria-hidden className='mx-1.5 h-5 w-px bg-border' />
						<div role='group' aria-label='Filter by price' className='flex gap-1.5'>
							{OFFER_FILTERS.map((filter) => (
								<CategoryChip
									key={filter.label}
									label={filter.label}
									selected={offerType === filter.value}
									onClick={() => setOfferType(filter.value)}
								/>
							))}
						</div>
					</div>
				</div>

				{(categories.length > 0 || tag) && (
					<div className='flex flex-wrap items-center gap-1.5'>
						<div
							role='group'
							aria-label='Filter by category'
							className='flex flex-wrap gap-1.5'
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

						{tag && (
							<span className='ml-auto inline-flex h-7 items-center gap-1 rounded-full bg-accent-soft pl-2.5 pr-1 text-[12.5px] font-medium text-brand-indigo'>
								#{tag}
								<button
									type='button'
									onClick={clearTag}
									aria-label={`Remove tag filter ${tag}`}
									className='inline-flex size-5 items-center justify-center rounded-full hover:bg-brand-indigo/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
								>
									<X className='size-3' aria-hidden />
								</button>
							</span>
						)}
					</div>
				)}
			</div>

			{isLoading && (
				<div className='grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3'>
					{Array.from({ length: 6 }).map((_, index) => (
						<div
							key={index}
							className='flex flex-col overflow-hidden rounded-[14px] border bg-card p-0'
						>
							<Skeleton className='aspect-[2/1] w-full rounded-none' />
							<div className='space-y-3 p-4'>
								<Skeleton className='h-5 w-3/4 rounded' />
								<Skeleton className='h-4 w-full rounded' />
								<Skeleton className='h-4 w-2/3 rounded' />
								<div className='border-t pt-3'>
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
							<div className='col-span-full rounded-[14px] border border-dashed p-8 py-16 text-center text-muted-foreground'>
								<p className='text-[13.5px] font-medium text-foreground'>
									No templates found
								</p>
								<p className='mt-1 text-[13px] text-muted-foreground'>
									{isFiltered
										? "Try another search keyword, category, price or tag."
										: "Templates appear here once creators publish them."}
								</p>
							</div>
						)}
					</div>

					{hasNextPage && (
						<div className='flex justify-center'>
							<Button
								type='button'
								variant='outline'
								className='h-[34px] rounded-[7px] px-4'
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

export function CategoryChip({
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
				"h-[30px] rounded-full border px-3 text-[12.5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				selected
					? "border-foreground bg-foreground text-background"
					: "border-input text-muted-foreground hover:bg-accent hover:text-foreground",
			)}
		>
			{label}
		</button>
	);
}
