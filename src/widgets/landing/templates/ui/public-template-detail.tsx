"use client";

import { ArrowLeft, ArrowRight, Eye, LayoutTemplate } from "lucide-react";
import Link from "next/link";

import {
	usePublicTemplate,
	useTemplateVersionThumbnail,
} from "@/entities/template/model/template.queries";
import type { PublicTemplateListItem } from "@/entities/template/model/template.types";
import { useUser } from "@/features/auth";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

interface PublicTemplateDetailPageProps {
	templateId: string;
}

export function PublicTemplateDetailPage({
	templateId,
}: PublicTemplateDetailPageProps) {
	const { template, isLoading, isError, refetch } =
		usePublicTemplate(templateId);

	if (isLoading) {
		return <TemplateDetailSkeleton />;
	}

	if (isError) {
		return (
			<div className='mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 text-center'>
				<div role='alert' className='space-y-4'>
					<p className='text-sm text-destructive'>
						Unable to load template details.
					</p>
					<Button variant='outline' onClick={() => refetch()}>
						Try again
					</Button>
				</div>
			</div>
		);
	}

	if (!template) {
		return (
			<div className='mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 text-center'>
				<div className='mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground'>
					<LayoutTemplate className='size-6' />
				</div>
				<h1 className='text-2xl font-bold tracking-tight text-foreground'>
					Template not found
				</h1>
				<p className='mt-2 text-sm text-muted-foreground'>
					The template you are looking for does not exist or has been removed.
				</p>
				<div className='mt-6'>
					<Link href='/templates'>
						<Button variant='outline'>
							<ArrowLeft className='mr-2 size-4' />
							Back to templates
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	return <TemplateDetailContent template={template} />;
}

function TemplateDetailContent({
	template,
}: {
	template: PublicTemplateListItem;
}) {
	const { user } = useUser();
	const ctaHref = user ? "/dashboard" : "/sign-up";

	const { data: thumbnail } = useTemplateVersionThumbnail(
		template.id,
		template.version?.id,
	);

	const visualUrl = thumbnail?.url || template.cover_url;
	const versionNumber = template.version?.version_number ?? 1;
	const previewHref = template.version?.id
		? `/templates/${template.id}/versions/${template.version.id}/preview`
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
		<div className='mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8'>
			{/* Back navigation */}
			<div className='mb-6 sm:mb-8'>
				<Link
					href='/templates'
					className='inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
				>
					<ArrowLeft className='size-4' />
					Back to templates
				</Link>
			</div>

			{/* Responsive 2-column layout */}
			<div className='grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12'>
				{/* Left Column on Desktop (Order 2 on Mobile): Media & About */}
				<div className='order-2 space-y-8 lg:order-1 lg:col-span-7'>
					{/* Large Thumbnail */}
					<div className='relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border/80 bg-muted/20 shadow-xs'>
						{visualUrl ? (
							<div
								className='h-full w-full bg-cover bg-center bg-no-repeat'
								style={{
									backgroundImage: `url("${visualUrl}")`,
								}}
							/>
						) : (
							<div className='flex h-full w-full items-center justify-center bg-muted/20 text-muted-foreground/40'>
								{template.icon ? (
									<span className='text-6xl select-none'>
										{template.icon}
									</span>
								) : (
									<LayoutTemplate className='size-14' />
								)}
							</div>
						)}
					</div>

					{/* About this template section */}
					{template.description && (
						<div className='border-t border-border/60 pt-8 space-y-3'>
							<h2 className='text-lg font-semibold tracking-tight text-foreground'>
								About this template
							</h2>
							<p className='whitespace-pre-line text-sm leading-relaxed text-muted-foreground'>
								{template.description}
							</p>
						</div>
					)}
				</div>

				{/* Right Column on Desktop (Order 1 on Mobile): Title, Meta & CTAs */}
				<div className='order-1 space-y-6 lg:order-2 lg:col-span-5'>
					{/* Header Info */}
					<div className='space-y-3'>
						<div className='flex items-center gap-3'>
							{template.icon && (
								<span
									className='text-3xl select-none'
									aria-hidden='true'
								>
									{template.icon}
								</span>
							)}
							<h1 className='text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
								{template.name}
							</h1>
						</div>

						{template.description && (
							<p className='text-base leading-relaxed text-muted-foreground'>
								{template.description}
							</p>
						)}
					</div>

					{/* Metadata Pills */}
					<div className='flex flex-wrap items-center gap-2'>
						<Badge
							variant='secondary'
							className='text-xs font-medium text-foreground bg-secondary'
						>
							Version v{versionNumber}
						</Badge>

						{formattedDate && (
							<span className='text-xs text-muted-foreground'>
								Updated {formattedDate}
							</span>
						)}
					</div>

					{/* CTAs */}
					<div className='flex flex-col gap-3 pt-2 sm:flex-row lg:flex-col'>
						{previewHref && (
							<Link href={previewHref} className='w-full'>
								<Button
									variant='outline'
									size='lg'
									className='h-11 w-full rounded-xl font-medium'
								>
									<Eye className='mr-2 size-4' />
									Preview
								</Button>
							</Link>
						)}

						<Link href={ctaHref} className='w-full'>
							<Button
								size='lg'
								className='h-11 w-full rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90'
							>
								Use template
								<ArrowRight className='ml-2 size-4' />
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

function TemplateDetailSkeleton() {
	return (
		<div className='mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8'>
			{/* Back navigation skeleton */}
			<div className='mb-6 sm:mb-8'>
				<Skeleton className='h-5 w-32 rounded' />
			</div>

			<div className='grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12'>
				{/* Media skeleton */}
				<div className='order-2 space-y-8 lg:order-1 lg:col-span-7'>
					<Skeleton className='aspect-[16/10] w-full rounded-2xl' />
					<div className='space-y-3 pt-6 border-t border-border/60'>
						<Skeleton className='h-6 w-44 rounded' />
						<Skeleton className='h-4 w-full rounded' />
						<Skeleton className='h-4 w-5/6 rounded' />
					</div>
				</div>

				{/* Info skeleton */}
				<div className='order-1 space-y-6 lg:order-2 lg:col-span-5'>
					<div className='space-y-3'>
						<Skeleton className='h-9 w-3/4 rounded-lg' />
						<Skeleton className='h-5 w-full rounded' />
						<Skeleton className='h-5 w-4/5 rounded' />
					</div>

					<div className='flex gap-2'>
						<Skeleton className='h-6 w-24 rounded-full' />
						<Skeleton className='h-6 w-32 rounded-full' />
					</div>

					<div className='space-y-3 pt-2'>
						<Skeleton className='h-11 w-full rounded-xl' />
						<Skeleton className='h-11 w-full rounded-xl' />
					</div>
				</div>
			</div>
		</div>
	);
}
