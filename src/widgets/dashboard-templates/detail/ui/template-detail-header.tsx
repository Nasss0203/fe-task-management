"use client";

import React from "react";
import { Globe, Lock, Users } from "lucide-react";
import type { PageTemplate, TemplateVersion, TemplateVisibility } from "@/entities/template";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { TemplateVersionStatusBadge } from "../../ui/template-version-status-badge";

export interface TemplateDetailHeaderProps {
	template: PageTemplate;
	selectedVersion?: TemplateVersion | null;
	className?: string;
}

export function TemplateDetailHeader({
	template,
	selectedVersion,
	className = "",
}: TemplateDetailHeaderProps) {
	const version = selectedVersion ?? template.version ?? null;
	const isArchived = template.status === "ARCHIVED";

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
					{isArchived ? (
						<>
							<Badge
								variant='outline'
								className='bg-muted text-muted-foreground border-border/60 text-[11px] font-medium'
							>
								Archived
							</Badge>
							{renderVisibilityBadge(template.visibility)}
						</>
					) : (
						<>
							{renderVisibilityBadge(template.visibility)}
							{version && (
								<TemplateVersionStatusBadge
									status={version.status}
									versionNumber={version.version_number}
									className='text-[11px]'
								/>
							)}
						</>
					)}
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
