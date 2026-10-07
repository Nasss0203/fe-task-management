"use client";

import React from "react";
import { Lock } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import type {
	PageTemplate,
	TemplateBlock,
	TemplateDatabaseSnapshot,
	TemplateVersion,
} from "@/entities/template";
import { TemplateSnapshotRenderer } from "@/features/template-preview";

interface TemplatePreviewPanelProps {
	template?: PageTemplate | null;
	version?: TemplateVersion | null;
	blocks?: TemplateBlock[];
	databases?: TemplateDatabaseSnapshot[];
	isLoading?: boolean;
}

export function TemplatePreviewPanel({
	template,
	version,
	blocks = [],
	databases = [],
	isLoading = false,
}: TemplatePreviewPanelProps) {
	if (isLoading) {
		return <TemplatePreviewSkeleton />;
	}

	const versionNumber = version?.version_number ?? 1;
	const isDraft = version?.status === "DRAFT";
	const isPublished = version?.status === "PUBLISHED";

	return (
		<div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden flex flex-col min-h-[650px]'>
			{/* Preview Toolbar Strip */}
			<div className='flex items-center justify-between px-5 py-3 border-b border-border/60 bg-muted/20 text-xs'>
				<div className='flex items-center gap-2.5'>
					<span className='font-medium text-foreground'>
						Previewing version v{versionNumber}
					</span>
					{isDraft && (
						<Badge
							variant='outline'
							className='bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px] font-medium'
						>
							Draft
						</Badge>
					)}
					{isPublished && (
						<Badge
							variant='secondary'
							className='bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px] font-medium'
						>
							Published
						</Badge>
					)}
				</div>

				<Badge
					variant='outline'
					className='gap-1.5 bg-background/80 text-[11px] font-medium text-muted-foreground border-border/70 backdrop-blur-xs'
				>
					<Lock className='size-3 text-muted-foreground/70' />
					Read-only
				</Badge>
			</div>

			{/* Main Preview Document Canvas */}
			<TemplateSnapshotRenderer
				template={template}
				blocks={blocks}
				databases={databases}
			/>
		</div>
	);
}

export function TemplatePreviewSkeleton() {
	return (
		<div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden flex flex-col min-h-[650px]'>
			{/* Toolbar skeleton */}
			<div className='flex items-center justify-between px-5 py-3 border-b border-border/60 bg-muted/20'>
				<Skeleton className='h-4 w-40' />
				<Skeleton className='h-4 w-20' />
			</div>

			{/* Canvas skeleton */}
			<div className='w-full px-6 md:px-8 xl:px-10 py-8 md:py-10 space-y-5'>
				<Skeleton className='size-9 rounded-lg' />
				<Skeleton className='h-7 w-2/3' />
				<Skeleton className='h-4 w-full' />
				<Skeleton className='h-4 w-5/6' />
				<Skeleton className='h-4 w-4/5' />

				<div className='pt-3'>
					<Skeleton className='h-36 w-full rounded-xl' />
				</div>

				<div className='space-y-2 pt-2'>
					<Skeleton className='h-4 w-3/4' />
					<Skeleton className='h-4 w-2/3' />
				</div>
			</div>
		</div>
	);
}
