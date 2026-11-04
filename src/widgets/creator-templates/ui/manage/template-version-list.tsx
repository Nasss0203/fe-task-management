"use client";

import React from "react";
import { format } from "date-fns";
import { GitBranch, Loader2, Plus } from "lucide-react";
import type { PageTemplate, TemplateVersion } from "@/entities/template";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

interface TemplateVersionListProps {
	template: PageTemplate;
	versions: TemplateVersion[];
	selectedVersionId?: string;
	onPreviewVersion: (versionId: string) => void;
	onPublishVersion?: (version: TemplateVersion) => void;
	onCreateVersion: () => void;
	isCreatingVersion: boolean;
}

export function TemplateVersionList({
	template,
	versions,
	selectedVersionId,
	onPreviewVersion,
	onPublishVersion,
	onCreateVersion,
	isCreatingVersion,
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
		<div className='w-full overflow-hidden rounded-[12px] border bg-card'>
			<div className='flex flex-col justify-between gap-3 border-b px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4'>
				<div className='flex flex-col gap-0.5'>
					<h2 className='text-[14px] font-semibold text-foreground'>
						Versions
					</h2>
					<p className='text-[12.5px] text-muted-foreground'>
						Manage saved versions of this template.
					</p>
				</div>

				<Button
					size='sm'
					onClick={onCreateVersion}
					disabled={isCreatingVersion || template.status === "ARCHIVED"}
					className='shrink-0 gap-1.5 self-start sm:self-auto'
				>
					{isCreatingVersion ? (
						<>
							<Loader2 className='size-3.5 animate-spin' />
							Creating...
						</>
					) : (
						<>
							<Plus className='size-3.5' />
							Create new version
						</>
					)}
				</Button>
			</div>

			{versions.length === 0 ? (
				<div className='p-12 text-center text-muted-foreground'>
					<div className='mx-auto mb-3 flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
						<GitBranch className='size-5' />
					</div>
					<p className='text-sm font-medium text-foreground'>
						No versions available
					</p>
					<p className='mt-1 text-xs text-muted-foreground'>
						This template does not have any saved versions yet.
					</p>
				</div>
			) : (
				<div className='divide-y'>
					{versions.map((version) => {
						const isPreviewing = version.id === activeVersionId;
						const createdDate = formatSafeDate(version.created_at);
						const publishedDate = formatSafeDate(version.published_at);
						const isDraft = version.status === "DRAFT";
						const isPublished = version.status === "PUBLISHED";

						return (
							<div
								key={version.id}
								className={cn(
									"flex min-h-[56px] flex-wrap items-center gap-3 px-4 py-2.5 transition-colors",
									isPreviewing
										? "bg-[#eeeffc]/70 dark:bg-indigo-500/10"
										: "hover:bg-muted/30",
								)}
							>
								<span className='text-[13.5px] font-semibold text-foreground'>
									v{version.version_number}
								</span>

								{isDraft && (
									<span className='rounded-[10px] bg-[#fbf3db] px-2 py-0.5 text-[11.5px] font-medium text-[#8a6500] dark:bg-amber-500/15 dark:text-amber-400'>
										Draft
									</span>
								)}

								{isPublished && (
									<span className='rounded-[10px] bg-[#e9f6ec] px-2 py-0.5 text-[11.5px] font-medium text-[#2f9e44] dark:bg-emerald-500/15 dark:text-emerald-400'>
										Published
									</span>
								)}

								<span className='min-w-[140px] flex-1 text-[13px] text-muted-foreground'>
									{publishedDate
										? `Published ${publishedDate}`
										: createdDate
											? `Created ${createdDate}`
											: "—"}
								</span>

								<div className='ml-auto flex shrink-0 items-center gap-2'>
									{isDraft && onPublishVersion && (
										<Button
											variant='outline'
											size='sm'
											onClick={() => onPublishVersion(version)}
											className='h-[30px] px-2.5 text-[13px]'
										>
											Publish
										</Button>
									)}

									{isPreviewing ? (
										<span className='px-1 text-[12.5px] font-medium text-[#5e6ad2] dark:text-indigo-400'>
											Previewing
										</span>
									) : (
										<Button
											variant='ghost'
											size='sm'
											onClick={() => onPreviewVersion(version.id)}
											className='h-[30px] px-2.5 text-[13px]'
										>
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
