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

	const pillClass =
		"gap-1 rounded-[10px] px-2 py-0.5 text-[11.5px] font-medium leading-[17px] text-muted-foreground [&>svg]:size-3";
	const hasInfo = isUnpublished || (!isRestricted && !isArchived);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='gap-0 overflow-hidden rounded-xl p-0 sm:max-w-[880px] [&>button:last-child]:right-5 [&>button:last-child]:top-[30px]'>
				<DialogHeader className='flex-row items-center gap-2.5 border-b px-5 py-4 pr-12 text-left'>
					<div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-lg'>
						{isRestricted ? (
							<Lock className='size-4 text-muted-foreground' />
						) : template.icon ? (
							<span>{template.icon}</span>
						) : (
							<FileText className='size-4 text-muted-foreground' />
						)}
					</div>

					<div className='min-w-0 flex-1'>
						<DialogTitle className='truncate text-base font-semibold leading-[23px] text-foreground'>
							{isRestricted
								? "Restricted Template"
								: isArchived
									? "Archived Template"
									: template.name}
						</DialogTitle>

						<div className='flex flex-wrap items-center gap-1.5'>
							{template.visibility === "PRIVATE" && (
								<Badge variant='secondary' className={pillClass}>
									<Lock />
									Private
								</Badge>
							)}
							{template.visibility === "WORKSPACE" && (
								<Badge variant='secondary' className={pillClass}>
									<Users />
									Workspace
								</Badge>
							)}
							{template.visibility === "PUBLIC" && (
								<Badge variant='secondary' className={pillClass}>
									<Globe />
									Public
								</Badge>
							)}
							{isUnpublished && (
								<span className='text-xs leading-[17px] text-muted-foreground'>
									Unpublished · In your library
								</span>
							)}
							{template.version?.status && !isUnpublished && (
								<TemplateVersionStatusBadge status={template.version.status} />
							)}
						</div>
					</div>
				</DialogHeader>

				<div className='flex flex-col sm:min-h-[280px] sm:flex-row'>
					<div className='flex-1 bg-sidebar p-7'>
						<DialogDescription className='whitespace-pre-line text-[13.5px] leading-5 text-muted-foreground'>
							{isRestricted
								? "This template is no longer publicly accessible."
								: isArchived
									? "This template is no longer available for use."
									: template.description ||
										"No description provided for this template."}
						</DialogDescription>
					</div>

					{hasInfo && (
						<div className='flex flex-col gap-3 border-t p-5 sm:w-80 sm:shrink-0 sm:border-l sm:border-t-0'>
							{isUnpublished ? (
								<>
									<p className='text-[13px] font-semibold leading-[19px] text-foreground'>
										Template information
									</p>
									<p className='rounded-lg bg-amber-50 px-2.5 py-2 text-xs leading-[17px] text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'>
										This template is no longer listed on the public Marketplace.
									</p>
									<p className='text-[12.5px] leading-[18px] text-muted-foreground'>
										You previously claimed this template.
									</p>
									<p className='text-[12.5px] leading-[18px] text-muted-foreground'>
										Claimed {formattedDate}
									</p>
									{template.version && (
										<div className='flex items-center justify-between text-[12.5px] leading-[18px]'>
											<span className='text-muted-foreground'>Published version</span>
											<span className='font-medium text-foreground'>
												v{template.version.version_number ?? 1}
											</span>
										</div>
									)}
								</>
							) : (
								<>
									<p className='text-[13px] font-semibold leading-[19px] text-foreground'>
										Template Overview
									</p>
									<p className='text-[12.5px] leading-[18px] text-muted-foreground'>
										{template.claimed_at ? "Claimed" : "Updated"} {formattedDate}
									</p>
									<div className='flex items-center justify-between gap-2 text-[12.5px] leading-[18px]'>
										<span className='text-muted-foreground'>
											Standard Workspace Format
										</span>
										{template.version?.version_number && (
											<span className='font-medium text-foreground'>
												v{template.version.version_number}
											</span>
										)}
									</div>
								</>
							)}
						</div>
					)}
				</div>

				<div className='flex items-center justify-end gap-2 border-t px-5 py-3'>
					{template.source_page_id && (
						<Link href={`/page/${template.source_page_id}`} target='_blank'>
							<Button variant='outline' size='sm' className='h-8 gap-1.5 px-3 text-[13px]'>
								<ExternalLink className='size-3.5' />
								Source Page
							</Button>
						</Link>
					)}
					<Button
						variant='outline'
						size='sm'
						onClick={() => onOpenChange(false)}
						className='h-8 px-3 text-[13px]'
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
							className='h-8 px-3 text-[13px]'
						>
							Use template
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
