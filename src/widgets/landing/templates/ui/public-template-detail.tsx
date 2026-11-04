"use client";

import axios from "axios";
import {
	Calendar,
	Check,
	ChevronLeft,
	Eye,
	LayoutTemplate,
} from "lucide-react";
import Link from "next/link";

import { useRecordTemplateView } from "@/entities/template/model/template.mutations";
import {
	useMyClaimedTemplates,
	usePublicTemplate,
	useTemplateVersionThumbnail,
} from "@/entities/template/model/template.queries";
import type { PublicTemplateListItem } from "@/entities/template/model/template.types";
import { useUser } from "@/features/auth";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { getTemplatePriceLabel } from "./template-card";
import { TemplateDetailActions } from "./template-detail-actions";
import {
	TemplateFeedbackSummary,
	TemplateReviewsSection,
} from "@/features/template-feedback";

interface PublicTemplateDetailPageProps {
	templateId: string;
	/** Gallery the page belongs to: the landing marketplace or the workspace. */
	basePath?: "/templates" | "/dashboard/templates";
}

export function PublicTemplateDetailPage({
	templateId,
	basePath = "/templates",
}: PublicTemplateDetailPageProps) {
	const { data: template, isLoading, isError, error, refetch } =
		usePublicTemplate(templateId);

	if (isLoading) {
		return <TemplateDetailSkeleton />;
	}

	const isNotFound = axios.isAxiosError(error) && error.response?.status === 404;
	if (isError && !isNotFound) {
		return (
			<div className='mx-auto w-full max-w-[600px] px-4 py-16 sm:px-6 lg:px-8'>
				<div
					role='alert'
					className='flex flex-col items-center gap-2 rounded-[14px] border bg-card px-6 py-10 text-center'
				>
					<h1 className='text-base font-semibold leading-6 text-foreground'>
						Unable to load template
					</h1>
					<p className='text-[13px] leading-5 text-destructive'>
						Unable to load template details.
					</p>
					<div>
						<Button variant='outline' onClick={() => refetch()} className='rounded-[7px]'>
							Try again
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if (!template || isNotFound) {
		return (
			<div className='mx-auto w-full max-w-[600px] px-4 py-16 sm:px-6 lg:px-8'>
				<div className='flex flex-col items-center gap-2 rounded-[14px] border bg-card px-6 py-10 text-center'>
					<h1 className='text-base font-semibold leading-6 text-foreground'>
						Template not found
					</h1>
					<p className='text-[13px] leading-5 text-muted-foreground'>
						The template you are looking for does not exist or has been removed.
					</p>
					<div>
						<Button asChild variant='outline' className='rounded-[7px]'>
							<Link href={basePath}>
								Back to templates
							</Link>
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return <TemplateDetailContent template={template} basePath={basePath} />;
}

function TemplateDetailContent({
	template,
	basePath,
}: {
	template: PublicTemplateListItem;
	basePath: string;
}) {
	const { user } = useUser();
	// Mounted only once the template loaded, so failed or 404 loads are not views.
	useRecordTemplateView(template.id);

	const { data: claimedData } = useMyClaimedTemplates({
		userId: user?.id,
		enabled: Boolean(user?.id),
	});

	const isClaimed = Boolean(
		user?.id &&
		claimedData?.pages?.some((page) =>
			page.items?.some((item) => item.template_id === template.id),
		),
	);

	const isPaid = template.offer_type === "PAID";
	const { data: thumbnail } = useTemplateVersionThumbnail(
		template.id,
		template.version?.id,
		// Paid screenshots are hidden on purpose; fall back to the cover at once.
		{ retryMissing: template.offer_type !== "PAID" },
	);

	const visualUrl = thumbnail?.url || template.cover_url;
	const versionNumber = template.version?.version_number ?? 1;
	// IMAGE listings have no interactive preview (the backend returns 403).
	const previewHref =
		template.version?.id && template.preview_mode !== "IMAGE"
			? `/templates/${template.id}/versions/${template.version.id}/preview${
					basePath === "/templates"
						? ""
						: `?back=${encodeURIComponent(`${basePath}/${template.id}`)}`
				}`
			: null;

	const formattedDate = template.version?.published_at
		? new Date(template.version.published_at).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		})
		: template.updated_at
			? new Date(template.updated_at).toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
			})
			: null;

	return (
		<div
			className={cn(
				"mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8",
				basePath === "/templates" && "py-6 sm:py-10",
			)}
		>
			{/* Back navigation */}
			<div className='mb-5'>
				<Link
					href={basePath}
					className='group -ml-1.5 inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[13px] leading-5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
				>
					<ChevronLeft className='size-3.5 transition-transform group-hover:-translate-x-0.5' />
					<span>Back to templates</span>
				</Link>
			</div>

			{/* Responsive 2-column layout via CSS Grid */}
			<div className='grid grid-cols-1 items-start gap-6 md:grid-cols-12'>
				{/* Block 1: Preview Area (Left Column on Desktop, First on Mobile) */}
				<div className='md:col-span-7 md:col-start-1 md:row-start-1 space-y-6'>
					<div className='relative aspect-[16/10] w-full overflow-hidden rounded-[18px] border bg-muted/40'>
						{previewHref ? (
							<Link
								href={previewHref}
								aria-label={`Interactive preview of ${template.name}`}
								className='group relative block h-full w-full overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
							>
								{visualUrl ? (
									/* eslint-disable-next-line @next/next/no-img-element */
									<img
										src={visualUrl}
										alt={template.name}
										className='h-full w-full object-cover object-top'
									/>
								) : (
									<div className='flex h-full w-full items-center justify-center'>
										<span className='flex size-20 items-center justify-center rounded-[18px] border bg-background text-foreground'>
											{template.icon ? (
												<span className='select-none text-4xl leading-none'>{template.icon}</span>
											) : (
												<LayoutTemplate className='size-9' />
											)}
										</span>
									</div>
								)}

								{/* Interactive preview hover indicator */}
								<div className='absolute bottom-2.5 right-2.5 flex items-center gap-1.5 rounded-[14px] border bg-background px-2.5 py-[5px] text-xs font-medium leading-[18px] text-foreground transition-colors group-hover:bg-accent'>
									<Eye className='size-[13px] text-brand-indigo' />
									<span>Interactive preview</span>
								</div>
							</Link>
						) : visualUrl ? (
							/* eslint-disable-next-line @next/next/no-img-element */
							<img
								src={visualUrl}
								alt={template.name}
								className='h-full w-full object-cover object-top'
							/>
						) : (
							<div className='flex h-full w-full items-center justify-center'>
								<span className='flex size-20 items-center justify-center rounded-[18px] border bg-background text-foreground'>
									{template.icon ? (
										<span className='select-none text-4xl leading-none'>{template.icon}</span>
									) : (
										<LayoutTemplate className='size-9' />
									)}
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Block 2: Info Panel & CTAs (Sticky Right Column on Desktop, Second on Mobile) */}
				<div
					className={cn(
						"md:sticky md:col-span-5 md:col-start-8 md:row-span-2 md:row-start-1",
						basePath === "/templates" ? "md:top-24" : "md:top-10",
					)}
				>
					<div className='flex flex-col gap-4 rounded-[18px] border bg-sidebar p-6'>
						{/* Header Info */}
						<div className='space-y-4'>
							<div className='flex items-center gap-3'>
								{template.icon && (
									<div
										className='flex size-11 shrink-0 select-none items-center justify-center rounded-[10px] border bg-background text-[22px]'
										aria-hidden='true'
									>
										{template.icon}
									</div>
								)}
								<h1 className='break-words text-[26px] font-bold leading-[39px] text-foreground'>
									{template.name}
								</h1>
							</div>

							{/* Metadata Badges */}
							<div className='flex flex-wrap items-center gap-2'>
								<Badge
									variant='secondary'
									className={
										isPaid
											? "rounded-xl bg-foreground px-2.5 py-0.5 text-xs font-semibold leading-[18px] text-background"
											: "rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold leading-[18px] text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
									}
								>
									{getTemplatePriceLabel(template)}
								</Badge>

								{!isPaid && isClaimed && (
									<Badge
										variant='secondary'
										className='rounded-xl border border-input bg-transparent px-2.5 py-0.5 text-xs font-medium leading-[18px] text-muted-foreground'
									>
										Claimed
									</Badge>
								)}

								<Badge
									variant='secondary'
									className='rounded-xl border border-input bg-transparent px-2.5 py-0.5 text-xs font-medium leading-[18px] text-muted-foreground'
								>
									Version v{versionNumber}
								</Badge>

								{formattedDate && (
									<span className='flex items-center gap-[5px] text-xs leading-[18px] text-muted-foreground'>
										<Calendar className='size-3' />
										Updated {formattedDate}
									</span>
								)}
							</div>
						</div>

						{(template.categories?.length || template.tags?.length) ? (
							<div className='flex flex-wrap items-center gap-1.5'>
								{template.categories?.map((category) => (
									<span
										key={category.id}
										className='rounded-md bg-muted px-2 py-0.5 text-[11.5px] leading-[17px] text-muted-foreground'
									>
										{category.name}
									</span>
								))}

								{template.tags && template.tags.length > 0 && (
									<ul aria-label='Tags' className='flex flex-wrap gap-1.5'>
										{template.tags.map((tag) => (
											<li key={tag}>
												<Link
													href={`${basePath}?tag=${encodeURIComponent(tag)}`}
													className='rounded-sm text-xs leading-[18px] text-faint transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
												>
													#{tag}
												</Link>
											</li>
										))}
									</ul>
								)}
							</div>
						) : null}

						{template.creator && (
							<p className='text-[12.5px] leading-[19px] text-muted-foreground'>
								By{" "}
								<Link
									href={`/creators/${encodeURIComponent(template.creator.handle)}`}
									className='rounded-sm underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
								>
									{template.creator.display_name ?? template.creator.username}
								</Link>
							</p>
						)}

						<TemplateFeedbackSummary templateId={template.id} />

						{/* CTAs */}
						<TemplateDetailActions
							template={template}
							previewHref={previewHref}
						/>

						{/* Value highlights (FREE claims only) */}
						{!isPaid && (
						<div className='space-y-2.5 border-t pt-4 text-[12.5px] leading-[19px] text-muted-foreground'>
							<div className='flex items-center gap-2'>
								<Check className='size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400' />
								<span>Claim once, use across workspaces</span>
							</div>
							<div className='flex items-center gap-2'>
								<Check className='size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400' />
								<span>Full layout & database views cloning</span>
							</div>
							<div className='flex items-center gap-2'>
								<Check className='size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400' />
								<span>Non-destructive workspace import</span>
							</div>
						</div>
						)}
					</div>
				</div>

				{/* Block 3: About Section (Left Column on Desktop, Third on Mobile) */}
				{template.description && (
					<div className='md:col-span-7 md:col-start-1 md:row-start-2'>
						<div className='space-y-3 rounded-[18px] border p-[26px]'>
							<h2 className='text-lg font-semibold leading-[27px] text-foreground'>
								About this template
							</h2>
							<p className='whitespace-pre-line text-sm leading-[21px] text-muted-foreground'>
								{template.description}
							</p>
						</div>
					</div>
				)}

				<div className='md:col-span-7 md:col-start-1 md:row-start-3'>
					<TemplateReviewsSection templateId={template.id} />
				</div>
			</div>


		</div>
	);
}

function TemplateDetailSkeleton() {
	return (
		<div className='mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8'>
			{/* Back navigation skeleton */}
			<div className='mb-5'>
				<Skeleton className='h-5 w-36 rounded-md' />
			</div>

			<div className='grid grid-cols-1 items-start gap-6 md:grid-cols-12'>
				{/* Media skeleton */}
				<div className='md:col-span-7 md:col-start-1 md:row-start-1 space-y-6'>
					<Skeleton className='aspect-[16/10] w-full rounded-[18px]' />
				</div>

				{/* Info skeleton */}
				<div className='md:col-span-5 md:col-start-8 md:row-start-1 md:row-span-2'>
					<div className='space-y-6 rounded-[18px] border bg-sidebar p-6'>
						<div className='space-y-3.5'>
							<div className='flex items-center gap-3'>
								<Skeleton className='size-11 rounded-xl shrink-0' />
								<Skeleton className='h-8 w-3/4 rounded-lg' />
							</div>
							<div className='flex gap-2 pt-1'>
								<Skeleton className='h-5 w-16 rounded-full' />
								<Skeleton className='h-5 w-24 rounded-full' />
								<Skeleton className='h-5 w-28 rounded-md' />
							</div>
						</div>

						<div className='space-y-3 pt-2 border-t border-border/60'>
							<Skeleton className='h-11 sm:h-12 w-full rounded-xl' />
							<Skeleton className='h-11 sm:h-12 w-full rounded-xl' />
						</div>

						<div className='space-y-2 pt-4 border-t border-border/40'>
							<Skeleton className='h-4 w-5/6 rounded' />
							<Skeleton className='h-4 w-4/6 rounded' />
						</div>
					</div>
				</div>

				{/* About skeleton */}
				<div className='md:col-span-7 md:col-start-1 md:row-start-2'>
					<div className='space-y-3 rounded-[18px] border p-[26px]'>
						<Skeleton className='h-6 w-44 rounded-md' />
						<Skeleton className='h-4 w-full rounded' />
						<Skeleton className='h-4 w-5/6 rounded' />
					</div>
				</div>
			</div>
		</div>
	);
}

