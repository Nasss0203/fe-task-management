"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Lock } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import type { ClaimedTemplateCardModel } from "../model/claimed-template-card.model";
import { TemplateCardShell } from "./template-card-shell";

interface ClaimedTemplateCardProps {
	template: ClaimedTemplateCardModel;
	onDetails: () => void;
	onUse: () => void;
}

export function ClaimedTemplateCard({
	template,
	onDetails,
	onUse,
}: ClaimedTemplateCardProps) {
	const [failedCover, setFailedCover] = useState<string | null>(null);
	const coverUrl = getCoverUrl(template.cover_url);
	let date = "Unknown date";
	try {
		date = format(new Date(template.claimed_at), "MMM d, yyyy");
	} catch {
		/* Invalid dates use the fallback. */
	}

	const consumerDetailHref = template.canNavigateToPublicDetail
		? `/dashboard/templates/${template.id}`
		: null;

	const previewVisual =
		coverUrl && failedCover !== coverUrl ? (
			// Only the allowed cover supplied by the library; no snapshot or thumbnail lookup.
			// eslint-disable-next-line @next/next/no-img-element
			<img
				src={coverUrl}
				alt=''
				className='h-full w-full object-cover'
				onError={() => setFailedCover(coverUrl)}
			/>
		) : (
			<div
				className='flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-muted/40 to-background p-6'
				aria-hidden='true'
			>
				<div className='flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-background/80 text-3xl text-primary shadow-xs'>
					{template.isRestricted ? (
						<Lock className='size-7 text-muted-foreground' />
					) : template.icon ? (
						<span className='max-w-full truncate px-2'>
							{template.icon}
						</span>
					) : (
						<FileText className='size-7' />
					)}
				</div>
			</div>
		);

	return (
		<TemplateCardShell
			onClick={
				template.allowDetails
					? () => onDetails()
					: undefined
			}
			className='min-w-0 overflow-hidden [&_h3]:min-w-0 [&_h3]:break-all [&_p]:break-words'
			preview={
				consumerDetailHref ? (
					<Link
						href={consumerDetailHref}
						tabIndex={-1}
						aria-hidden='true'
						onClick={(e) => e.stopPropagation()}
						className='block h-full w-full'
					>
						{previewVisual}
					</Link>
				) : (
					previewVisual
				)
			}
			badgeOverlay={
				<>
					<Badge
						variant='secondary'
						className='bg-background/90 text-foreground border border-border/60 text-[10px] backdrop-blur-md shadow-xs font-medium'
					>
						Claimed
					</Badge>
					{template.isFree && (
						<Badge
							variant='secondary'
							className='bg-background/90 text-foreground border border-border/60 text-[10px] backdrop-blur-md shadow-xs font-medium'
						>
							FREE
						</Badge>
					)}
				</>
			}
			meta={
				<div className='w-full min-w-0 text-[10px] text-muted-foreground'>
					<div className='flex min-h-5 flex-wrap items-center justify-between gap-x-2 gap-y-1'>
						<span className='min-w-0 truncate'>
							Claimed <time dateTime={template.claimed_at}>{date}</time>
						</span>
						{template.version && (
							<span className='shrink-0 font-medium'>
								v{template.version.version_number}
							</span>
						)}
					</div>
					<p
						className='min-h-4 line-clamp-1'
						title={template.statusMessage ?? undefined}
					>
						{template.statusMessage}
					</p>
				</div>
			}
			title={
				consumerDetailHref ? (
					<Link
						href={consumerDetailHref}
						onClick={(e) => e.stopPropagation()}
						title={template.name}
						className='hover:underline focus-visible:outline-2 focus-visible:outline-ring rounded-xs'
					>
						{template.name}
					</Link>
				) : (
					<span title={template.name}>{template.name}</span>
				)
			}
			description={template.description || "No description provided."}
			footer={
				<div className='flex items-center justify-between gap-2'>
					<Button
						variant='outline'
						size='sm'
						disabled={!template.allowDetails}
						onClick={(e) => {
							e.stopPropagation();
							onDetails();
						}}
						className='min-w-0 flex-1 rounded-lg text-xs font-medium'
					>
						Details
					</Button>
					<Button
						size='sm'
						disabled={!template.allowUseAttempt}
						onClick={(e) => {
							e.stopPropagation();
							onUse();
						}}
						className='min-w-0 flex-1 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90'
					>
						Use template
					</Button>
				</div>
			}
		/>
	);
}

/** Ignore malformed covers without changing the API or library projection. */
function getCoverUrl(value: string | null): string | null {
	if (!value?.trim()) return null;
	try {
		const url = new URL(value, "https://taskmanly.invalid");
		return url.protocol === "https:" || url.protocol === "http:" ? value : null;
	} catch {
		return null;
	}
}
