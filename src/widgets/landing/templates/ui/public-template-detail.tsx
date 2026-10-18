"use client";

import axios from "axios";
import {
	ArrowLeft,
	Calendar,
	CheckCircle2,
	Eye,
	LayoutTemplate,
} from "lucide-react";
import Link from "next/link";

import {
	useMyClaimedTemplates,
	usePublicTemplate,
	useTemplateVersionThumbnail,
} from "@/entities/template/model/template.queries";
import type { PublicTemplateListItem } from "@/entities/template/model/template.types";
import { useUser } from "@/features/auth";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { getTemplatePriceLabel } from "./template-card";
import { TemplateDetailActions } from "./template-detail-actions";

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
			<div className='mx-auto max-w-xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 text-center'>
				<div
					role='alert'
					className='rounded-2xl border border-destructive/20 bg-destructive/5 p-8 sm:p-10 text-center shadow-xs space-y-4'
				>
					<div className='mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive'>
						<LayoutTemplate className='size-6' />
					</div>
					<h1 className='text-xl font-bold tracking-tight text-foreground'>
						Unable to load template
					</h1>
					<p className='text-sm text-destructive'>
						Unable to load template details.
					</p>
					<div className='pt-2'>
						<Button variant='outline' onClick={() => refetch()} className='rounded-xl'>
							Try again
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if (!template || isNotFound) {
		return (
			<div className='mx-auto max-w-xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 text-center'>
				<div className='rounded-2xl border border-border/80 bg-card/60 p-8 sm:p-10 text-center shadow-xs space-y-4'>
					<div className='mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground'>
						<LayoutTemplate className='size-6' />
					</div>
					<h1 className='text-2xl font-bold tracking-tight text-foreground'>
						Template not found
					</h1>
					<p className='text-sm text-muted-foreground max-w-sm mx-auto'>
						The template you are looking for does not exist or has been removed.
					</p>
					<div className='mt-6'>
						<Button asChild variant='outline' className='rounded-xl'>
							<Link href={basePath}>
								<ArrowLeft className='mr-2 size-4' />
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
		<div className='mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8'>
			{/* Back navigation */}
			<div className='mb-6 sm:mb-8'>
				<Link
					href={basePath}
					className='group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg px-2 py-1 -ml-2'
				>
					<ArrowLeft className='size-4 transition-transform group-hover:-translate-x-0.5' />
					<span>Back to templates</span>
				</Link>
			</div>

			{/* Responsive 2-column layout via CSS Grid */}
			<div className='grid grid-cols-1 items-start gap-8 md:grid-cols-12 md:gap-8 lg:gap-10'>
				{/* Block 1: Preview Area (Left Column on Desktop, First on Mobile) */}
				<div className='md:col-span-7 md:col-start-1 md:row-start-1 space-y-6'>
					<div className='relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border/80 bg-muted/20 shadow-xs'>
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
										className='h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.01]'
									/>
								) : (
									<div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-muted/30 via-muted/10 to-background text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/60'>
										{template.icon ? (
											<span className='text-6xl select-none transition-transform duration-200 group-hover:scale-105'>
												{template.icon}
											</span>
										) : (
											<LayoutTemplate className='size-14 transition-transform duration-200 group-hover:scale-105' />
										)}
									</div>
								)}

								{/* Interactive preview hover indicator */}
								<div className='absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full border border-border/60 bg-background/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-md shadow-xs transition-transform duration-200 group-hover:scale-105'>
									<Eye className='size-3.5 text-primary' />
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
							<div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-muted/30 via-muted/10 to-background text-muted-foreground/40'>
								{template.icon ? (
									<span className='text-6xl select-none'>{template.icon}</span>
								) : (
									<LayoutTemplate className='size-14' />
								)}
							</div>
						)}
					</div>
				</div>

				{/* Block 2: Info Panel & CTAs (Sticky Right Column on Desktop, Second on Mobile) */}
				<div className='md:col-span-5 md:col-start-8 md:row-start-1 md:row-span-2 md:sticky md:top-24 space-y-6'>
					<div className='rounded-2xl border border-border/80 bg-card/70 p-5 sm:p-6 lg:p-7 backdrop-blur-xs shadow-xs dark:bg-card/40 dark:border-border/60 space-y-6'>
						{/* Header Info */}
						<div className='space-y-3.5'>
							<div className='flex items-start gap-3.5'>
								{template.icon && (
									<div
										className='flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/40 text-2xl select-none shadow-2xs'
										aria-hidden='true'
									>
										{template.icon}
									</div>
								)}
								<h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight break-words'>
									{template.name}
								</h1>
							</div>

							{/* Metadata Badges */}
							<div className='flex flex-wrap items-center gap-2 pt-1'>
								<Badge
									variant='secondary'
									className={
										isPaid
											? "bg-foreground text-background text-xs font-semibold px-2.5 py-0.5 rounded-full"
											: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold px-2.5 py-0.5 rounded-full"
									}
								>
									{getTemplatePriceLabel(template)}
								</Badge>

								{!isPaid && isClaimed && (
									<Badge
										variant='secondary'
										className='bg-primary/10 text-primary border border-primary/20 text-xs font-semibold px-2.5 py-0.5 rounded-full'
									>
										Claimed
									</Badge>
								)}

								<Badge
									variant='secondary'
									className='text-xs font-medium text-foreground bg-secondary border border-border/60 px-2.5 py-0.5 rounded-full'
								>
									Version v{versionNumber}
								</Badge>

								{formattedDate && (
									<span className='text-xs text-muted-foreground flex items-center gap-1.5 ml-1'>
										<Calendar className='size-3 text-muted-foreground/70' />
										Updated {formattedDate}
									</span>
								)}
							</div>
						</div>

						{template.categories && template.categories.length > 0 && (
							<div className='flex flex-wrap gap-1.5'>
								{template.categories.map((category) => (
									<span
										key={category.id}
										className='rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground'
									>
										{category.name}
									</span>
								))}
							</div>
						)}

						{template.tags && template.tags.length > 0 && (
							<ul aria-label='Tags' className='flex flex-wrap gap-1.5'>
								{template.tags.map((tag) => (
									<li key={tag}>
										<Link
											href={`${basePath}?tag=${encodeURIComponent(tag)}`}
											className='rounded-full border border-border/70 px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
										>
											#{tag}
										</Link>
									</li>
								))}
							</ul>
						)}

						{template.creator && (
							<p className='text-xs text-muted-foreground'>
								By{" "}
								<span className='font-medium text-foreground'>
									{template.creator.username}
								</span>
							</p>
						)}

						{/* CTAs */}
						<TemplateDetailActions
							template={template}
							previewHref={previewHref}
						/>

						{/* Value highlights (FREE claims only) */}
						{!isPaid && (
						<div className='space-y-2.5 pt-4 border-t border-border/40 text-xs text-muted-foreground'>
							<div className='flex items-center gap-2'>
								<CheckCircle2 className='size-3.5 text-emerald-500 shrink-0' />
								<span>Claim once, use across workspaces</span>
							</div>
							<div className='flex items-center gap-2'>
								<CheckCircle2 className='size-3.5 text-emerald-500 shrink-0' />
								<span>Full layout & database views cloning</span>
							</div>
							<div className='flex items-center gap-2'>
								<CheckCircle2 className='size-3.5 text-emerald-500 shrink-0' />
								<span>Non-destructive workspace import</span>
							</div>
						</div>
						)}
					</div>
				</div>

				{/* Block 3: About Section (Left Column on Desktop, Third on Mobile) */}
				{template.description && (
					<div className='md:col-span-7 md:col-start-1 md:row-start-2'>
						<div className='rounded-2xl border border-border/60 bg-card/30 p-6 sm:p-7 backdrop-blur-xs dark:bg-card/20 space-y-3.5'>
							<h2 className='text-lg font-semibold tracking-tight text-foreground'>
								About this template
							</h2>
							<p className='whitespace-pre-line text-sm sm:text-base leading-relaxed text-muted-foreground'>
								{template.description}
							</p>
						</div>
					</div>
				)}
			</div>


		</div>
	);
}

function TemplateDetailSkeleton() {
	return (
		<div className='mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8'>
			{/* Back navigation skeleton */}
			<div className='mb-6 sm:mb-8'>
				<Skeleton className='h-5 w-36 rounded-md' />
			</div>

			<div className='grid grid-cols-1 items-start gap-8 md:grid-cols-12 md:gap-8 lg:gap-10'>
				{/* Media skeleton */}
				<div className='md:col-span-7 md:col-start-1 md:row-start-1 space-y-6'>
					<Skeleton className='aspect-[16/10] w-full rounded-2xl' />
				</div>

				{/* Info skeleton */}
				<div className='md:col-span-5 md:col-start-8 md:row-start-1 md:row-span-2'>
					<div className='rounded-2xl border border-border/80 bg-card/60 p-5 sm:p-6 lg:p-7 space-y-6'>
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
					<div className='rounded-2xl border border-border/60 bg-card/30 p-6 sm:p-7 space-y-3.5'>
						<Skeleton className='h-6 w-44 rounded-md' />
						<Skeleton className='h-4 w-full rounded' />
						<Skeleton className='h-4 w-5/6 rounded' />
					</div>
				</div>
			</div>
		</div>
	);
}

