"use client";

import React from "react";
import { Eye, FileText, Lock, Sparkles } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
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

	return (
		<div className='flex flex-col gap-4'>
			{/* Preview Sub-header */}
			<div className='flex items-center justify-between px-1'>
				<div className='flex items-center gap-2'>
					<Sparkles className='size-4 text-primary' />
					<span className='text-sm font-semibold text-foreground'>
						Interactive Preview
					</span>
					{version && (
						<span className='text-xs text-muted-foreground'>
							• Version v{version.version_number} ({version.status.toLowerCase()})
						</span>
					)}
				</div>

				<Badge
					variant='outline'
					className='gap-1.5 bg-background/80 text-[11px] font-medium text-muted-foreground border-border/70 backdrop-blur-xs'
				>
					<Lock className='size-3 text-muted-foreground/70' />
					Mode: Read-only
				</Badge>
			</div>

			{/* Main Preview Document Canvas */}
			<div className='min-h-[640px] rounded-2xl border border-border/80 bg-card p-6 md:p-10 shadow-xs flex flex-col'>
				{/* Cover Image if present */}
				{template?.cover_url && (
					<div className='-mx-6 -mt-6 md:-mx-10 md:-mt-10 mb-8 h-48 md:h-64 overflow-hidden rounded-t-2xl border-b border-border/60 relative'>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={template.cover_url}
							alt={template.name}
							className='h-full w-full object-cover'
						/>
					</div>
				)}

				{/* Template Header: Icon, Title, Description */}
				<div className='space-y-4 mb-6'>
					<div className='flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-2xl shadow-xs'>
						{template?.icon ? (
							<span>{template.icon}</span>
						) : (
							<FileText className='size-7' />
						)}
					</div>

					<div className='space-y-2'>
						<h1 className='text-3xl md:text-4xl font-extrabold tracking-tight text-foreground'>
							{template?.name || "Untitled Template"}
						</h1>

						{template?.description && (
							<p className='text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed'>
								{template.description}
							</p>
						)}
					</div>
				</div>

				<Separator className='mb-8 border-border/60' />

				{/* Render Blocks Tree */}
				{blockTree.length > 0 ? (
					<div className='space-y-2 flex-1'>
						{blockTree.map((block) => (
							<TemplateBlockRenderer key={block.id} block={block} />
						))}
					</div>
				) : (
					<div className='flex-1 flex flex-col items-center justify-center py-16 text-center text-muted-foreground'>
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
	);
}

export function TemplatePreviewSkeleton() {
	return (
		<div className='flex flex-col gap-4'>
			{/* Sub-header skeleton */}
			<div className='flex items-center justify-between px-1'>
				<Skeleton className='h-5 w-48' />
				<Skeleton className='h-5 w-32' />
			</div>

			{/* Canvas skeleton */}
			<div className='min-h-[640px] rounded-2xl border border-border/80 bg-card p-6 md:p-10 shadow-xs flex flex-col space-y-6'>
				<div className='flex size-14 items-center justify-center rounded-2xl bg-muted/40'>
					<Skeleton className='size-8 rounded-lg' />
				</div>

				<div className='space-y-3'>
					<Skeleton className='h-10 w-3/4' />
					<Skeleton className='h-4 w-1/2' />
					<Skeleton className='h-4 w-2/3' />
				</div>

				<Skeleton className='h-px w-full' />

				<div className='space-y-4 pt-2'>
					<Skeleton className='h-6 w-1/3' />
					<Skeleton className='h-4 w-full' />
					<Skeleton className='h-4 w-5/6' />
					<Skeleton className='h-4 w-4/5' />

					<div className='pt-4'>
						<Skeleton className='h-40 w-full rounded-xl' />
					</div>

					<div className='space-y-2 pt-2'>
						<Skeleton className='h-4 w-3/4' />
						<Skeleton className='h-4 w-2/3' />
					</div>
				</div>
			</div>
		</div>
	);
}
