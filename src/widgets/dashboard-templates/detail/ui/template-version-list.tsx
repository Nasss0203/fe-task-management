"use client";

import React from "react";
import { format } from "date-fns";
import { Check, Eye, GitBranch, Sparkles } from "lucide-react";
import type { PageTemplate, TemplateVersion } from "@/entities/template";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

interface TemplateVersionListProps {
	template: PageTemplate;
	versions: TemplateVersion[];
	selectedVersionId?: string;
	onPreviewVersion: (versionId: string) => void;
	onPublishVersion?: (version: TemplateVersion) => void;
}

export function TemplateVersionList({
	versions,
	selectedVersionId,
	onPreviewVersion,
	onPublishVersion,
}: TemplateVersionListProps) {
	const activeVersionId = selectedVersionId || versions[0]?.id;

	const formatSafeDate = (dateStr?: string | null) => {
		if (!dateStr) return null;
		try {
			return format(new Date(dateStr), "MMM d, yyyy");
		} catch {
			return null;
		}
	};

	return (
		<div className='w-full space-y-4'>
			{/* Tab Header (Full Width) */}
			<div className='flex items-center justify-between'>
				<div>
					<h2 className='text-lg font-semibold tracking-tight text-foreground'>
						Versions
					</h2>
					<p className='text-xs text-muted-foreground mt-0.5'>
						Manage saved versions of this template.
					</p>
				</div>
			</div>

			{/* Versions Table / Card List (Full Width) */}
			{versions.length === 0 ? (
				<div className='rounded-2xl border border-border/70 bg-card p-12 text-center text-muted-foreground'>
					<div className='flex size-12 items-center justify-center rounded-full bg-muted/40 mx-auto mb-3 text-muted-foreground'>
						<GitBranch className='size-5' />
					</div>
					<p className='text-sm font-medium text-foreground'>
						No versions available
					</p>
					<p className='text-xs text-muted-foreground mt-1'>
						This template does not have any saved versions yet.
					</p>
				</div>
			) : (
				<div className='w-full rounded-2xl border border-border/80 bg-card divide-y divide-border/60 overflow-hidden shadow-xs'>
					{versions.map((version) => {
						const isPreviewing = version.id === activeVersionId;
						const createdDate = formatSafeDate(version.created_at);
						const publishedDate = formatSafeDate(version.published_at);
						const isDraft = version.status === "DRAFT";
						const isPublished = version.status === "PUBLISHED";

						return (
							<div
								key={version.id}
								className={`p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
									isPreviewing ? "bg-primary/5" : "hover:bg-muted/15"
								}`}
							>
								{/* Left: Version Metadata */}
								<div className='space-y-1.5 min-w-0'>
									<div className='flex items-center gap-2.5 flex-wrap'>
										<span className='font-mono font-bold text-base text-foreground'>
											v{version.version_number}
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

										{isPreviewing && (
											<Badge
												variant='secondary'
												className='bg-primary/20 text-primary border-transparent gap-1 text-[10px] font-medium'
											>
												<Check className='size-2.5' />
												Previewing
											</Badge>
										)}
									</div>

									<div className='flex items-center gap-3 text-xs text-muted-foreground flex-wrap'>
										{createdDate && <span>Created {createdDate}</span>}
										{publishedDate ? (
											<>
												<span>•</span>
												<span>Published {publishedDate}</span>
											</>
										) : (
											<>
												<span>•</span>
												<span>Published —</span>
											</>
										)}
									</div>
								</div>

								{/* Right: Actions */}
								<div className='flex items-center gap-2 self-end sm:self-center shrink-0'>
									{isDraft && onPublishVersion && (
										<Button
											variant='outline'
											size='sm'
											onClick={() => onPublishVersion(version)}
											className='h-8 text-xs gap-1.5 border-border/80 hover:bg-accent'
										>
											<Sparkles className='size-3 text-primary' />
											Publish
										</Button>
									)}

									{!isPreviewing && (
										<Button
											variant='secondary'
											size='sm'
											onClick={() => onPreviewVersion(version.id)}
											className='h-8 text-xs font-medium gap-1.5'
										>
											<Eye className='size-3.5' />
											Preview
										</Button>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
