"use client";

import React from "react";
import { Eye, Lock } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import type { PageTemplate, TemplateBlock, TemplateVersion } from "@/entities/template";
import {
	buildTemplateBlockTree,
	TemplateBlockRenderer,
} from "./template-block-renderer";

interface TemplatePreviewPanelProps {
	template?: PageTemplate | null;
	version?: TemplateVersion | null;
	blocks?: TemplateBlock[];
	isLoading?: boolean;
}

export function TemplatePreviewPanel({
	template,
	version,
	blocks = [],
	isLoading = false,
}: TemplatePreviewPanelProps) {
	const blockTree = React.useMemo(() => {
		return buildTemplateBlockTree(blocks);
	}, [blocks]);

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
			<div className='flex-1 flex flex-col'>
				{/* Cover Image if present */}
				{template?.cover_url && (
					<div className='h-48 md:h-64 w-full overflow-hidden border-b border-border/50 relative bg-muted/20'>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={template.cover_url}
							alt={template.name}
							className='h-full w-full object-cover'
						/>
					</div>
				)}

				<div className='w-full px-6 md:px-8 xl:px-10 py-8 md:py-10 flex-1 flex flex-col'>
					{/* Page Icon if present */}
					{template?.icon && (
						<div className='text-3xl mb-4 select-none' aria-hidden='true'>
							{template.icon}
						</div>
					)}

					{/* Render Page Snapshot Blocks */}
					{blockTree.length > 0 ? (
						<div className='space-y-2 flex-1 w-full'>
							{blockTree.map((block) => (
								<TemplateBlockRenderer key={block.id} block={block} />
							))}
						</div>
					) : (
						<div className='flex-1 flex flex-col items-center justify-center py-20 text-center text-muted-foreground'>
							<div className='flex size-12 items-center justify-center rounded-full bg-muted/30 mb-3'>
								<Eye className='size-5 text-muted-foreground/60' />
							</div>
							<p className='text-sm font-medium text-foreground/80'>
								No blocks in this version
							</p>
							<p className='text-xs text-muted-foreground mt-1 max-w-sm'>
								This template version snapshot does not contain any content blocks yet.
							</p>
						</div>
					)}
				</div>
			</div>
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
