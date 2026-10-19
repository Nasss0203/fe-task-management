"use client";

import axios from "axios";
import { ArrowLeft, Calendar, ExternalLink, Heart, Star, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
	CREATOR_LINK_KEYS,
	CreatorAvatar,
	type CreatorLinkKey,
	type PublicCreatorProfile,
	usePublicCreator,
} from "@/entities/creator";
import { useInfinitePublicTemplates } from "@/entities/template";
import type { PublicTemplateSort } from "@/entities/template/model/template.types";
import { formatRatingSummary } from "@/features/template-feedback";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

import { CategoryChip, SORT_OPTIONS } from "./public-template-gallery";
import TemplateCard from "./template-card";

const LINK_LABELS: Record<CreatorLinkKey, string> = {
	website: "Website",
	x: "X",
	github: "GitHub",
	linkedin: "LinkedIn",
	youtube: "YouTube",
	facebook: "Facebook",
};

const joinedFormatter = new Intl.DateTimeFormat("en-US", {
	month: "short",
	year: "numeric",
});

const countFormatter = new Intl.NumberFormat("en", { notation: "compact" });

export function PublicCreatorPage({ handle }: { handle: string }) {
	const query = usePublicCreator(handle);
	const isNotFound =
		axios.isAxiosError(query.error) && query.error.response?.status === 404;

	if (query.isPending) {
		return (
			<div className='mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-10 lg:px-8'>
				<Skeleton className='h-48 w-full rounded-2xl' />
				<Skeleton className='h-8 w-64 rounded-lg' />
				<Skeleton className='h-4 w-96 max-w-full rounded' />
			</div>
		);
	}

	if (isNotFound || !query.data) {
		return (
			<div className='mx-auto max-w-xl px-4 py-16 text-center sm:px-6 sm:py-20'>
				<div
					role={isNotFound ? undefined : "alert"}
					className='space-y-4 rounded-2xl border border-border/80 bg-card/60 p-8 sm:p-10'
				>
					<div className='mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground'>
						<UserRound className='size-6' />
					</div>
					<h1 className='text-2xl font-bold tracking-tight text-foreground'>
						{isNotFound ? "Creator not found" : "Unable to load creator"}
					</h1>
					<div className='flex justify-center gap-2 pt-2'>
						{!isNotFound && (
							<Button variant='outline' onClick={() => query.refetch()}>
								Try again
							</Button>
						)}
						<Button asChild variant='outline'>
							<Link href='/templates'>
								<ArrowLeft className='mr-2 size-4' />
								Browse templates
							</Link>
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8'>
			<CreatorHeader creator={query.data} />
			<CreatorTemplates handle={query.data.handle} />
		</div>
	);
}

function CreatorHeader({ creator }: { creator: PublicCreatorProfile }) {
	const links = CREATOR_LINK_KEYS.filter((key) => creator.links[key]);
	const { stats } = creator;

	return (
		<section aria-labelledby='creator-name' className='overflow-hidden rounded-2xl border border-border/80 bg-card/60'>
			<div className='relative h-36 w-full bg-gradient-to-br from-primary/25 via-primary/10 to-muted sm:h-48'>
				{creator.cover_url && (
					/* eslint-disable-next-line @next/next/no-img-element */
					<img
						src={creator.cover_url}
						alt=''
						className='h-full w-full object-cover'
					/>
				)}
			</div>

			<div className='space-y-4 px-5 pb-6 sm:px-8'>
				<div className='-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end'>
					<CreatorAvatar
						src={creator.avatar_url}
						name={creator.display_name}
						className='size-24 shrink-0 rounded-2xl border-4 border-background sm:size-28'
					/>
					<div className='min-w-0 space-y-1'>
						<h1
							id='creator-name'
							className='break-words text-2xl font-bold tracking-tight text-foreground sm:text-3xl'
						>
							{creator.display_name}
						</h1>
						<p className='text-sm text-muted-foreground'>@{creator.handle}</p>
					</div>
				</div>

				{creator.headline && (
					<p className='text-base font-medium text-foreground'>
						{creator.headline}
					</p>
				)}

				{creator.bio && (
					<p className='max-w-3xl whitespace-pre-line text-sm leading-relaxed text-muted-foreground'>
						{creator.bio}
					</p>
				)}

				{links.length > 0 && (
					<ul aria-label='Links' className='flex flex-wrap gap-2'>
						{links.map((key) => (
							<li key={key}>
								<a
									href={creator.links[key] ?? undefined}
									target='_blank'
									rel='noopener noreferrer nofollow ugc'
									className='inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
								>
									{LINK_LABELS[key]}
									<ExternalLink className='size-3' aria-hidden />
								</a>
							</li>
						))}
					</ul>
				)}

				<dl className='flex flex-wrap gap-x-6 gap-y-2 border-t border-border/50 pt-4 text-sm'>
					<div className='flex items-center gap-1.5'>
						<dt className='sr-only'>Templates</dt>
						<dd className='font-semibold text-foreground'>
							{countFormatter.format(stats.template_count)}
						</dd>
						<span className='text-muted-foreground'>
							{stats.template_count === 1 ? "template" : "templates"}
						</span>
					</div>
					<div className='flex items-center gap-1.5'>
						<dt className='sr-only'>Average rating</dt>
						<Star
							className={
								stats.rating_count
									? "size-4 fill-amber-400 text-amber-400"
									: "size-4 text-muted-foreground"
							}
							aria-hidden
						/>
						<dd className='text-foreground'>
							{formatRatingSummary(stats.rating_average, stats.rating_count)}
						</dd>
					</div>
					<div className='flex items-center gap-1.5'>
						<dt className='sr-only'>Likes</dt>
						<Heart className='size-4 text-muted-foreground' aria-hidden />
						<dd className='text-foreground'>
							{countFormatter.format(stats.like_count)}{" "}
							{stats.like_count === 1 ? "like" : "likes"}
						</dd>
					</div>
					<div className='flex items-center gap-1.5 text-muted-foreground'>
						<dt className='sr-only'>Joined</dt>
						<Calendar className='size-4' aria-hidden />
						<dd>Joined {joinedFormatter.format(new Date(creator.joined_at))}</dd>
					</div>
				</dl>
			</div>
		</section>
	);
}

function CreatorTemplates({ handle }: { handle: string }) {
	const [sort, setSort] = useState<PublicTemplateSort>("newest");
	const {
		data,
		isLoading,
		isError,
		refetch,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
	} = useInfinitePublicTemplates({ creator: handle, sort, limit: 12 });
	const templates = data?.pages.flatMap((page) => page.items) ?? [];

	return (
		<section aria-labelledby='creator-templates-title' className='mt-10 space-y-5'>
			<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
				<h2
					id='creator-templates-title'
					className='text-xl font-semibold tracking-tight text-foreground'
				>
					Templates
				</h2>
				<div role='group' aria-label='Sort templates' className='flex flex-wrap gap-2'>
					{SORT_OPTIONS.map((option) => (
						<CategoryChip
							key={option.value}
							label={option.label}
							selected={sort === option.value}
							onClick={() => setSort(option.value)}
						/>
					))}
				</div>
			</div>

			{isLoading ? (
				<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
					{[0, 1, 2].map((index) => (
						<Skeleton key={index} className='h-72 rounded-2xl' />
					))}
				</div>
			) : isError ? (
				<div role='alert' className='py-12 text-center text-sm text-destructive'>
					<p>Unable to load templates.</p>
					<Button variant='outline' className='mt-4' onClick={() => refetch()}>
						Try again
					</Button>
				</div>
			) : templates.length === 0 ? (
				<p className='rounded-2xl border border-dashed border-border/80 bg-card/40 p-10 text-center text-sm text-muted-foreground'>
					This creator has not published any templates yet.
				</p>
			) : (
				<>
					<div className='grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3'>
						{templates.map((template) => (
							<TemplateCard
								key={template.id}
								item={template}
								href={`/templates/${template.id}`}
							/>
						))}
					</div>
					{hasNextPage && (
						<div className='flex justify-center'>
							<Button
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
		</section>
	);
}
