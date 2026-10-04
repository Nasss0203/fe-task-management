"use client";

import React from "react";
import { Globe, Lock, Users } from "lucide-react";
import type { PageTemplate, TemplateStatus, TemplateVisibility } from "@/entities/template";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";

interface TemplateDetailHeaderProps {
	template: PageTemplate;
	className?: string;
}

export function TemplateDetailHeader({
	template,
	className = "",
}: TemplateDetailHeaderProps) {
	const renderStatusBadge = (status: TemplateStatus) => {
		switch (status) {
			case "DRAFT":
				return (
					<Badge
						variant='outline'
						className='bg-amber-500/10 text-amber-500 border-amber-500/30 text-[11px] font-medium'
					>
						Draft
					</Badge>
				);
			case "PUBLISHED":
				return (
					<Badge
						variant='secondary'
						className='bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[11px] font-medium'
					>
						Published
					</Badge>
				);
			case "ARCHIVED":
				return (
					<Badge
						variant='outline'
						className='bg-muted text-muted-foreground border-border/60 text-[11px] font-medium'
					>
						Archived
					</Badge>
				);
			default:
				return null;
		}
	};

	const renderVisibilityBadge = (visibility: TemplateVisibility) => {
		switch (visibility) {
			case "PRIVATE":
				return (
					<Badge
						variant='secondary'
						className='bg-background/90 text-foreground border border-border/60 text-[11px] gap-1 font-medium'
					>
						<Lock className='size-3 text-muted-foreground' />
						Private
					</Badge>
				);
			case "WORKSPACE":
				return (
					<Badge
						variant='secondary'
						className='bg-background/90 text-foreground border border-border/60 text-[11px] gap-1 font-medium'
					>
						<Users className='size-3 text-muted-foreground' />
						Workspace
					</Badge>
				);
			case "PUBLIC":
				return (
					<Badge
						variant='secondary'
						className='bg-background/90 text-foreground border border-border/60 text-[11px] gap-1 font-medium'
					>
						<Globe className='size-3 text-muted-foreground' />
						Public
					</Badge>
				);
			default:
				return null;
		}
	};

	return (
		<div className={`space-y-2 ${className}`}>
			<div className='flex flex-wrap items-center gap-3'>
				<h1 className='text-2xl md:text-3xl font-bold tracking-tight text-foreground'>
					{template.name}
				</h1>
				<div className='flex items-center gap-2'>
					{renderStatusBadge(template.status)}
					{renderVisibilityBadge(template.visibility)}
				</div>
			</div>
			{template.description && (
				<p className='text-sm text-muted-foreground max-w-3xl leading-relaxed'>
					{template.description}
				</p>
			)}
		</div>
	);
}

export function TemplateDetailHeaderSkeleton() {
	return (
		<div className='space-y-2'>
			<div className='flex items-center gap-3'>
				<Skeleton className='h-8 w-64 md:w-80 rounded-lg' />
				<Skeleton className='h-6 w-16 rounded-full' />
				<Skeleton className='h-6 w-20 rounded-full' />
			</div>
			<Skeleton className='h-4 w-full max-w-xl rounded' />
		</div>
	);
}
