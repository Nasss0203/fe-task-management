"use client";

import axios from "axios";
import { Heart, Star } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
	useDeleteTemplateReview,
	useSetTemplateLike,
	useUpsertTemplateReview,
} from "@/entities/template/model/template.mutations";
import { usePublicTemplateReviews } from "@/entities/template/model/template.queries";
import type {
	TemplateReview,
	TemplateReviewsResponse,
} from "@/entities/template/model/template.types";
import { useUser } from "@/features/auth";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

const MAX_BODY_LENGTH = 2000;

const ratingFormatter = new Intl.NumberFormat("en", {
	minimumFractionDigits: 1,
	maximumFractionDigits: 1,
});

const countFormatter = new Intl.NumberFormat("en", { notation: "compact" });

const reviewDateFormatter = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "short",
	day: "numeric",
});

export function Stars({
	value,
	className,
}: {
	value: number;
	className?: string;
}) {
	return (
		<span
			className={cn("inline-flex items-center gap-0.5", className)}
			aria-hidden
		>
			{[1, 2, 3, 4, 5].map((star) => (
				<Star
					key={star}
					className={cn(
						"size-3.5",
						star <= Math.round(value)
							? "fill-amber-400 text-amber-400"
							: "text-muted-foreground/40",
					)}
				/>
			))}
		</span>
	);
}

export function formatRatingSummary(
	ratingAverage: number | null | undefined,
	ratingCount: number | undefined,
) {
	return ratingAverage === null || ratingAverage === undefined || !ratingCount
		? "No ratings yet"
		: `${ratingFormatter.format(ratingAverage)} (${countFormatter.format(ratingCount)})`;
}

function useSignInHref() {
	const pathname = usePathname();
	return `/sign-in?next=${encodeURIComponent(pathname)}`;
}

export function TemplateFeedbackSummary({ templateId }: { templateId: string }) {
	const { user } = useUser();
	const signInHref = useSignInHref();
	const { data, isPending } = usePublicTemplateReviews(templateId, user?.id, 1);
	const likeMutation = useSetTemplateLike(templateId);

	if (isPending || !data) {
		return <Skeleton className='h-8 w-48 rounded-lg' />;
	}

	const liked = data.viewer?.liked ?? false;
	const isCreator = data.viewer?.is_creator ?? false;
	const likeLabel = `${countFormatter.format(data.like_count)} ${data.like_count === 1 ? "like" : "likes"}`;

	return (
		<div className='flex flex-wrap items-center justify-between gap-3'>
			<a
				href='#reviews'
				className='inline-flex items-center gap-2 rounded-lg text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
			>
				<Stars value={data.rating_average ?? 0} />
				<span className='font-medium text-foreground'>
					{formatRatingSummary(data.rating_average, data.rating_count)}
				</span>
			</a>

			{!user ? (
				<Button asChild variant='outline' size='sm' className='rounded-full'>
					<Link href={signInHref}>
						<Heart className='mr-1.5 size-4' aria-hidden />
						{likeLabel}
					</Link>
				</Button>
			) : (
				<Button
					variant='outline'
					size='sm'
					className={cn(
						"rounded-full",
						liked && "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400",
					)}
					aria-pressed={liked}
					disabled={isCreator || likeMutation.isPending}
					title={isCreator ? "You cannot like your own template" : undefined}
					onClick={() => likeMutation.mutate(!liked)}
				>
					<Heart
						className={cn("mr-1.5 size-4", liked && "fill-current")}
						aria-hidden
					/>
					{likeLabel}
				</Button>
			)}
		</div>
	);
}

export function TemplateReviewsSection({ templateId }: { templateId: string }) {
	const { user } = useUser();
	const [page, setPage] = useState(1);
	const query = usePublicTemplateReviews(templateId, user?.id, page);
	const data = query.data;

	return (
		<section
			id='reviews'
			aria-labelledby='template-reviews-title'
			className='scroll-mt-24 rounded-2xl border border-border/60 bg-card/30 p-6 sm:p-7 backdrop-blur-xs dark:bg-card/20 space-y-6'
		>
			<div className='flex flex-wrap items-baseline justify-between gap-2'>
				<h2
					id='template-reviews-title'
					className='text-lg font-semibold tracking-tight text-foreground'
				>
					Reviews
				</h2>
				{data && (
					<span className='text-sm text-muted-foreground'>
						{formatRatingSummary(data.rating_average, data.rating_count)} ·{" "}
						{countFormatter.format(data.like_count)}{" "}
						{data.like_count === 1 ? "like" : "likes"}
					</span>
				)}
			</div>

			{query.isPending ? (
				<div className='space-y-3'>
					<Skeleton className='h-4 w-2/3 rounded' />
					<Skeleton className='h-4 w-1/2 rounded' />
				</div>
			) : axios.isAxiosError(query.error) &&
			  query.error.response?.status === 404 ? (
				<p className='text-sm text-muted-foreground'>
					Reviews appear once this template is public on the marketplace.
				</p>
			) : query.isError || !data ? (
				<div role='alert' className='flex items-center gap-3 text-sm text-muted-foreground'>
					Unable to load reviews.
					<Button variant='outline' size='sm' onClick={() => query.refetch()}>
						Try again
					</Button>
				</div>
			) : (
				<>
					<RatingDistribution data={data} />
					<ReviewForm
						key={user?.id ?? "guest"}
						templateId={templateId}
						data={data}
					/>
					<ReviewList
						items={data.items}
						page={data.page}
						totalPages={data.total_pages}
						onPageChange={setPage}
					/>
				</>
			)}
		</section>
	);
}

function RatingDistribution({ data }: { data: TemplateReviewsResponse }) {
	const max = Math.max(...data.distribution, 1);

	return (
		<ul aria-label='Rating distribution' className='space-y-1.5'>
			{[5, 4, 3, 2, 1].map((star) => {
				const count = data.distribution[star - 1] ?? 0;
				return (
					<li key={star} className='flex items-center gap-3 text-xs text-muted-foreground'>
						<span className='w-8 shrink-0 tabular-nums'>{star} ★</span>
						<span className='h-2 flex-1 overflow-hidden rounded-full bg-muted'>
							<span
								className='block h-full rounded-full bg-amber-400'
								style={{ width: `${(count / max) * 100}%` }}
							/>
						</span>
						<span className='w-8 shrink-0 text-right tabular-nums'>{count}</span>
					</li>
				);
			})}
		</ul>
	);
}

function ReviewForm({
	templateId,
	data,
}: {
	templateId: string;
	data: TemplateReviewsResponse;
}) {
	const signInHref = useSignInHref();
	const viewer = data.viewer;
	const upsert = useUpsertTemplateReview(templateId);
	const remove = useDeleteTemplateReview(templateId);
	const [rating, setRating] = useState(viewer?.review?.rating ?? 0);
	const [body, setBody] = useState(viewer?.review?.body ?? "");

	if (!viewer) {
		return (
			<p className='rounded-xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground'>
				<Link href={signInHref} className='font-medium text-primary hover:underline'>
					Sign in
				</Link>{" "}
				to rate this template.
			</p>
		);
	}

	if (viewer.is_creator) {
		return (
			<p className='rounded-xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground'>
				You created this template, so you cannot rate it.
			</p>
		);
	}

	const hasReview = viewer.review !== null;
	const error = upsert.error ?? remove.error;

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (rating < 1) return;
		upsert.mutate({
			rating,
			body: viewer?.can_comment ? body.trim() || null : null,
		});
	}

	return (
		<form
			onSubmit={handleSubmit}
			className='space-y-3 rounded-xl border border-border/70 bg-background/40 p-4'
		>
			<fieldset>
				<legend className='mb-2 text-sm font-medium text-foreground'>
					{hasReview ? "Your rating" : "Rate this template"}
				</legend>
				<div role='radiogroup' aria-label='Rating' className='flex gap-1'>
					{[1, 2, 3, 4, 5].map((star) => (
						<button
							key={star}
							type='button'
							role='radio'
							aria-checked={rating === star}
							aria-label={`${star} star${star === 1 ? "" : "s"}`}
							onClick={() => setRating(star)}
							className='rounded-md p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
						>
							<Star
								className={cn(
									"size-6 transition-colors",
									star <= rating
										? "fill-amber-400 text-amber-400"
										: "text-muted-foreground/40 hover:text-amber-300",
								)}
							/>
						</button>
					))}
				</div>
			</fieldset>

			{viewer.can_comment ? (
				<div className='space-y-1.5'>
					<label htmlFor='template-review-body' className='text-sm font-medium text-foreground'>
						Your review <span className='font-normal text-muted-foreground'>(optional)</span>
					</label>
					<textarea
						id='template-review-body'
						value={body}
						maxLength={MAX_BODY_LENGTH}
						onChange={(event) => setBody(event.target.value)}
						rows={4}
						placeholder='What did you like? What could be better?'
						className='w-full resize-y rounded-xl border border-border/80 bg-background px-3 py-2 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20'
					/>
					<p className='text-right text-[11px] text-muted-foreground tabular-nums'>
						{body.length}/{MAX_BODY_LENGTH}
					</p>
				</div>
			) : (
				<p className='text-xs text-muted-foreground'>
					Anyone can rate. Written reviews are open to people who bought or claimed this template.
				</p>
			)}

			{error && (
				<p role='alert' className='text-sm text-destructive'>
					{getApiErrorMessage(error, "Unable to save your review")}
				</p>
			)}

			<div className='flex flex-wrap gap-2'>
				<Button type='submit' size='sm' disabled={rating < 1 || upsert.isPending}>
					{upsert.isPending ? "Saving…" : hasReview ? "Update review" : "Submit"}
				</Button>
				{hasReview && (
					<Button
						type='button'
						variant='ghost'
						size='sm'
						disabled={remove.isPending}
						onClick={() =>
							remove.mutate(undefined, {
								onSuccess: () => {
									setRating(0);
									setBody("");
								},
							})
						}
					>
						Delete
					</Button>
				)}
			</div>
		</form>
	);
}

function ReviewList({
	items,
	page,
	totalPages,
	onPageChange,
}: {
	items: TemplateReview[];
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}) {
	if (items.length === 0) {
		return (
			<p className='text-sm text-muted-foreground'>
				No reviews yet. Be the first to rate this template.
			</p>
		);
	}

	return (
		<div className='space-y-4'>
			<ul className='divide-y divide-border/60'>
				{items.map((review) => (
					<li key={review.id} className='space-y-1.5 py-4 first:pt-0'>
						<div className='flex flex-wrap items-center gap-2 text-sm'>
							<span className='font-medium text-foreground'>
								{review.author?.username ?? "Deleted user"}
							</span>
							{review.is_owner && (
								<Badge
									variant='secondary'
									title='This reviewer owns the template'
									className='rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0 text-[11px] text-emerald-700 dark:text-emerald-400'
								>
									Verified
									<span className='sr-only'> owner of this template</span>
								</Badge>
							)}
							<Stars value={review.rating} />
							<span className='sr-only'>{review.rating} out of 5 stars</span>
						</div>
						<p className='text-xs text-muted-foreground'>
							{reviewDateFormatter.format(new Date(review.updated_at))}
							{review.version_number !== null && ` · v${review.version_number}`}
						</p>
						{review.body && (
							<p className='whitespace-pre-line text-sm leading-relaxed text-foreground/90'>
								{review.body}
							</p>
						)}
					</li>
				))}
			</ul>

			{totalPages > 1 && (
				<nav aria-label='Review pages' className='flex items-center justify-center gap-3'>
					<Button
						variant='outline'
						size='sm'
						disabled={page <= 1}
						onClick={() => onPageChange(page - 1)}
					>
						Previous
					</Button>
					<span className='text-sm tabular-nums text-muted-foreground'>
						Page {page} of {totalPages}
					</span>
					<Button
						variant='outline'
						size='sm'
						disabled={page >= totalPages}
						onClick={() => onPageChange(page + 1)}
					>
						Next
					</Button>
				</nav>
			)}
		</div>
	);
}
