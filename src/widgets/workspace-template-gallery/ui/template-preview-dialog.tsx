"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
	ExternalLink,
	FileText,
	Globe,
	Lock,
	Users,
	Sparkles,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import type { PageTemplate, TemplateVersionStatus } from "@/entities/template";
import { TemplateVersionStatusBadge } from "./template-version-status-badge";

interface TemplatePreviewDialogProps {
	template:
		| (Pick<
				PageTemplate,
				"id" | "name" | "description" | "icon" | "visibility"
		  > & {
				source_page_id?: string | null;
				updated_at?: string;
				claimed_at?: string;
				version?: { status: TemplateVersionStatus; version_number?: number } | null;
				isUnpublished?: boolean;
				isRestricted?: boolean;
				isArchived?: boolean;
				allowUseAttempt?: boolean;
		  })
		| null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUse?: () => void;
}

export function TemplatePreviewDialog({
	template,
	open,
	onOpenChange,
	onUse,
}: TemplatePreviewDialogProps) {
	if (!template) return null;

	const formattedDate = (() => {
		try {
			return format(
				new Date(template.claimed_at ?? template.updated_at ?? ""),
				"MMMM d, yyyy",
			);
		} catch {
			return "Recently";
		}
	})();

	const isUnpublished = Boolean(template.isUnpublished);
	const isRestricted = Boolean(template.isRestricted);
	const isArchived = Boolean(template.isArchived);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-lg rounded-2xl border-border/80 bg-background p-6 shadow-xl'>
				<DialogHeader className='space-y-2 text-left'>
					<div className='flex items-center gap-2'>
						{template.visibility === "PRIVATE" && (
							<Badge variant='secondary' className='gap-1 text-[10px]'>
								<Lock className='size-3 text-muted-foreground' />
								Private
							</Badge>
						)}
						{template.visibility === "WORKSPACE" && (
							<Badge variant='secondary' className='gap-1 text-[10px]'>
								<Users className='size-3 text-muted-foreground' />
								Workspace
							</Badge>
						)}
						{template.visibility === "PUBLIC" && (
							<Badge variant='secondary' className='gap-1 text-[10px]'>
								<Globe className='size-3 text-muted-foreground' />
								Public
							</Badge>
						)}
						{isUnpublished && (
							<Badge variant='secondary' className='text-[10px]'>
								Unpublished · In your library
							</Badge>
						)}
						{template.version?.status && !isUnpublished && (
							<TemplateVersionStatusBadge status={template.version.status} />
						)}
					</div>

					<DialogTitle className='text-xl font-bold text-foreground flex items-center gap-2'>
						<div className='flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary'>
							{isRestricted ? (
								<Lock className='size-4 text-muted-foreground' />
							) : template.icon ? (
								<span>{template.icon}</span>
							) : (
								<FileText className='size-4' />
							)}
						</div>
						<span>
							{isRestricted
								? "Restricted Template"
								: isArchived
									? "Archived Template"
									: template.name}
						</span>
					</DialogTitle>

					<DialogDescription className='text-xs text-muted-foreground leading-relaxed pt-1'>
						{isRestricted
							? "This template is no longer publicly accessible."
							: isArchived
								? "This template is no longer available for use."
								: template.description ||
									"No description provided for this template."}
					</DialogDescription>
				</DialogHeader>

				{/* Visual Overview Shell - Real permitted metadata only, no fake skeleton bars */}
				{isUnpublished ? (
					<div className='rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3 select-none my-2'>
						<div className='flex items-center justify-between text-[11px] text-muted-foreground pb-2 border-b border-border/40'>
							<span className='font-medium text-foreground/80'>
								Template information
							</span>
							<span>Claimed {formattedDate}</span>
						</div>
						<div className='space-y-1 text-xs'>
							<p className='font-medium text-foreground'>
								This template is no longer listed on the public Marketplace.
							</p>
							<p className='text-muted-foreground'>
								You previously claimed this template.
							</p>
						</div>
						{template.version && (
							<div className='pt-2 border-t border-border/40 text-[10px] text-muted-foreground flex items-center justify-between'>
								<span>Published version</span>
								<span className='font-medium text-foreground'>
									v{template.version.version_number ?? 1}
								</span>
							</div>
						)}
					</div>
				) : !isRestricted && !isArchived ? (
					<div className='rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2 select-none my-2'>
						<div className='flex items-center justify-between text-[11px] text-muted-foreground pb-2 border-b border-border/40'>
							<span className='font-medium text-foreground/80'>
								Template Overview
							</span>
							<span>
								{template.claimed_at ? "Claimed" : "Updated"} {formattedDate}
							</span>
						</div>

						<div className='flex items-center justify-between pt-1 text-[10px] text-muted-foreground'>
							<div className='flex items-center gap-1.5'>
								<Sparkles className='size-3 text-primary' />
								<span>Standard Workspace Format</span>
							</div>
							{template.version?.version_number && (
								<span className='font-medium text-foreground'>
									v{template.version.version_number}
								</span>
							)}
						</div>
					</div>
				) : null}

				{/* Dialog Actions */}
				<div className='flex items-center justify-end gap-2 pt-2'>
					{template.source_page_id && (
						<Link href={`/page/${template.source_page_id}`} target='_blank'>
							<Button
								variant='outline'
								size='sm'
								className='rounded-lg text-xs gap-1.5'
							>
								<ExternalLink className='size-3.5' />
								Source Page
							</Button>
						</Link>
					)}
					<Button
						variant='outline'
						size='sm'
						onClick={() => onOpenChange(false)}
						className='rounded-lg text-xs'
					>
						Close
					</Button>
					{isUnpublished && template.allowUseAttempt && onUse && (
						<Button
							size='sm'
							onClick={() => {
								onOpenChange(false);
								onUse();
							}}
							className='rounded-lg text-xs bg-primary text-primary-foreground font-semibold hover:bg-primary/90'
						>
							Use template
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
