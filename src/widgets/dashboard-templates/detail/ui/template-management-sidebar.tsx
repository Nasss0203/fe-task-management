"use client";

import React from "react";
import { format } from "date-fns";
import {
	Archive,
	ArrowRight,
	Check,
	Edit2,
	Eye,
	FileText,
	Globe,
	Lock,
	MoreHorizontal,
	RotateCcw,
	Sparkles,
	Users,
} from "lucide-react";
import { toast } from "sonner";

import type {
	PageTemplate,
	TemplateStatus,
	TemplateVersion,
	TemplateVisibility,
} from "@/entities/template";
import { useRestoreTemplate } from "@/entities/template";
import { usePage } from "@/entities/page/model/page.queries";
import { useUser } from "@/features/auth";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";

interface TemplateManagementSidebarProps {
	template: PageTemplate;
	versions: TemplateVersion[];
	selectedVersionId?: string;
	onSelectVersion: (versionId: string) => void;
	onOpenPublish: () => void;
	onOpenUse: () => void;
	onOpenEdit: () => void;
	onOpenArchive: () => void;
	onViewAllVersions?: () => void;
}

export function TemplateManagementSidebar({
	template,
	versions,
	selectedVersionId,
	onSelectVersion,
	onOpenPublish,
	onOpenUse,
	onOpenEdit,
	onOpenArchive,
	onViewAllVersions,
}: TemplateManagementSidebarProps) {
	const { user } = useUser();
	const restoreMutation = useRestoreTemplate();

	// Fetch source page detail if source_page_id exists
	const { data: sourcePage } = usePage(
		template.source_page_id ?? undefined,
		Boolean(template.source_page_id),
	);

	// Resolve the active selected version object
	const activeVersion = React.useMemo(() => {
		if (selectedVersionId) {
			const found = versions.find((v) => v.id === selectedVersionId);
			if (found) return found;
		}
		return versions[0] || null;
	}, [selectedVersionId, versions]);

	const formattedUpdated = React.useMemo(() => {
		try {
			return format(new Date(template.updated_at), "MMM d, yyyy");
		} catch {
			return "Recently";
		}
	}, [template.updated_at]);

	const creatorDisplay = React.useMemo(() => {
		if (user?.id && template.created_by === user.id) {
			return "Created by you";
		}
		if (user?.username && template.created_by === user.id) {
			return user.username;
		}
		return "Workspace member";
	}, [user, template.created_by]);

	const sourcePageDisplay = React.useMemo(() => {
		if (!template.source_page_id) return null;
		if (sourcePage?.title) return sourcePage.title;
		return "Available";
	}, [template.source_page_id, sourcePage?.title]);

	const renderVisibilityBadge = (visibility: TemplateVisibility) => {
		switch (visibility) {
			case "PRIVATE":
				return (
					<Badge
						variant='secondary'
						className='bg-background/90 text-foreground border border-border/60 text-[10px] gap-1 font-medium'
					>
						<Lock className='size-3 text-muted-foreground' />
						Private
					</Badge>
				);
			case "WORKSPACE":
				return (
					<Badge
						variant='secondary'
						className='bg-background/90 text-foreground border border-border/60 text-[10px] gap-1 font-medium'
					>
						<Users className='size-3 text-muted-foreground' />
						Workspace
					</Badge>
				);
			case "PUBLIC":
				return (
					<Badge
						variant='secondary'
						className='bg-background/90 text-foreground border border-border/60 text-[10px] gap-1 font-medium'
					>
						<Globe className='size-3 text-muted-foreground' />
						Public
					</Badge>
				);
			default:
				return null;
		}
	};

	const renderStatusBadge = (status: TemplateStatus) => {
		if (status === "DRAFT") {
			return (
				<Badge
					variant='outline'
					className='bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px] font-medium'
				>
					Draft
				</Badge>
			);
		}
		if (status === "PUBLISHED") {
			return (
				<Badge
					variant='secondary'
					className='bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px] font-medium'
				>
					Published
				</Badge>
			);
		}
		if (status === "ARCHIVED") {
			return (
				<Badge
					variant='outline'
					className='bg-muted text-muted-foreground border-border/60 text-[10px] font-medium'
				>
					Archived
				</Badge>
			);
		}
		return null;
	};

	const handleRestore = async () => {
		try {
			await restoreMutation.mutateAsync({ templateId: template.id });
			toast.success("Template restored.");
		} catch {
			toast.error("Unable to restore template.");
		}
	};

	const isArchived = template.status === "ARCHIVED";
	const isDraftVersion = activeVersion?.status === "DRAFT";
	const isPublishedVersion = activeVersion?.status === "PUBLISHED";

	// Show max 4 recent versions in summary card
	const recentVersions = versions.slice(0, 4);

	return (
		<aside className='w-full space-y-4 lg:sticky lg:top-4'>
			{/* CARD 1: TEMPLATE MANAGEMENT (Metadata + Unified Action Hierarchy) */}
			<div className='rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs'>
				<div className='flex items-center justify-between'>
					<h3 className='text-sm font-semibold text-foreground'>
						Template management
					</h3>
				</div>

				{/* Two-Column Definition Layout */}
				<dl className='space-y-2.5 text-xs'>
					<div className='flex items-center justify-between'>
						<dt className='text-muted-foreground font-normal'>Status</dt>
						<dd>{renderStatusBadge(template.status)}</dd>
					</div>

					<div className='flex items-center justify-between'>
						<dt className='text-muted-foreground font-normal'>Visibility</dt>
						<dd>{renderVisibilityBadge(template.visibility)}</dd>
					</div>

					<div className='flex items-center justify-between'>
						<dt className='text-muted-foreground font-normal'>Current version</dt>
						<dd className='flex items-center gap-1.5'>
							<span className='font-mono font-medium text-foreground'>
								v{activeVersion?.version_number ?? 1}
							</span>
							<span className='text-muted-foreground'>·</span>
							{activeVersion?.status === "PUBLISHED" ? (
								<span className='text-emerald-500 font-medium'>Published</span>
							) : (
								<span className='text-amber-500 font-medium'>Draft</span>
							)}
						</dd>
					</div>

					<div className='flex items-center justify-between'>
						<dt className='text-muted-foreground font-normal'>Created by</dt>
						<dd className='text-foreground font-medium'>{creatorDisplay}</dd>
					</div>

					<div className='flex items-center justify-between'>
						<dt className='text-muted-foreground font-normal'>Updated</dt>
						<dd className='text-foreground'>{formattedUpdated}</dd>
					</div>

					{sourcePageDisplay && (
						<div className='flex items-center justify-between'>
							<dt className='text-muted-foreground font-normal'>Source page</dt>
							<dd
								className='text-foreground font-medium truncate max-w-[170px]'
								title={sourcePageDisplay}
							>
								{sourcePageDisplay}
							</dd>
						</div>
					)}
				</dl>

				<Separator className='border-border/60' />

				{/* Action Hierarchy */}
				{isArchived ? (
					<div className='space-y-3 pt-1'>
						<div className='rounded-xl border border-border/70 bg-muted/20 p-3 text-xs text-muted-foreground text-center leading-relaxed'>
							This template is archived. Restore it to make it active and usable.
						</div>
						<Button
							size='sm'
							onClick={handleRestore}
							disabled={restoreMutation.isPending}
							className='w-full bg-primary text-primary-foreground text-xs font-semibold h-9'
						>
							<RotateCcw className='size-3.5 mr-1.5' />
							Restore template
						</Button>
						<Button
							variant='outline'
							size='sm'
							onClick={onOpenEdit}
							className='w-full text-xs font-medium h-9'
						>
							<Edit2 className='size-3.5 mr-1.5' />
							Edit details
						</Button>
					</div>
				) : isDraftVersion ? (
					<div className='space-y-2.5 pt-1'>
						{/* Primary Action */}
						<Button
							size='sm'
							onClick={onOpenPublish}
							className='w-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 gap-1.5 h-9'
						>
							<Sparkles className='size-3.5' />
							Publish version
						</Button>

						{/* Secondary Action + More Menu */}
						<div className='flex items-center gap-2'>
							<Button
								variant='outline'
								size='sm'
								onClick={onOpenEdit}
								className='flex-1 text-xs font-medium h-9'
							>
								<Edit2 className='size-3.5 mr-1.5' />
								Edit details
							</Button>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant='outline'
										size='sm'
										aria-label='More actions'
										className='size-9 px-0 text-muted-foreground hover:text-foreground shrink-0'
									>
										<MoreHorizontal className='size-4' />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align='end' className='w-44'>
									<DropdownMenuItem
										variant='destructive'
										onClick={onOpenArchive}
										className='text-xs'
									>
										<Archive className='size-3.5 mr-1.5' />
										Archive template
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						<p className='text-[11px] text-muted-foreground text-center pt-0.5 leading-normal'>
							This version is a draft. Publish to make it usable.
						</p>
					</div>
				) : isPublishedVersion ? (
					<div className='space-y-2.5 pt-1'>
						{/* Primary Action */}
						<Button
							size='sm'
							onClick={onOpenUse}
							className='w-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 gap-1.5 h-9'
						>
							<FileText className='size-3.5' />
							Use template
							<ArrowRight className='size-3.5 ml-auto' />
						</Button>

						{/* Secondary Action + More Menu */}
						<div className='flex items-center gap-2'>
							<Button
								variant='outline'
								size='sm'
								onClick={onOpenEdit}
								className='flex-1 text-xs font-medium h-9'
							>
								<Edit2 className='size-3.5 mr-1.5' />
								Edit details
							</Button>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant='outline'
										size='sm'
										aria-label='More actions'
										className='size-9 px-0 text-muted-foreground hover:text-foreground shrink-0'
									>
										<MoreHorizontal className='size-4' />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align='end' className='w-44'>
									<DropdownMenuItem
										variant='destructive'
										onClick={onOpenArchive}
										className='text-xs'
									>
										<Archive className='size-3.5 mr-1.5' />
										Archive template
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				) : (
					<div className='flex items-center gap-2 pt-1'>
						<Button
							variant='outline'
							size='sm'
							onClick={onOpenEdit}
							className='flex-1 text-xs font-medium h-9'
						>
							<Edit2 className='size-3.5 mr-1.5' />
							Edit details
						</Button>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant='outline'
									size='sm'
									aria-label='More actions'
									className='size-9 px-0 text-muted-foreground hover:text-foreground shrink-0'
								>
									<MoreHorizontal className='size-4' />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end' className='w-44'>
								<DropdownMenuItem
									variant='destructive'
									onClick={onOpenArchive}
									className='text-xs'
								>
									<Archive className='size-3.5 mr-1.5' />
									Archive template
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				)}
			</div>

			{/* CARD 2: VERSIONS SUMMARY (Max 4 recent versions with View All link) */}
			<div className='rounded-2xl border border-border/80 bg-card p-5 space-y-3.5 shadow-xs'>
				<div className='flex items-center justify-between'>
					<h3 className='text-sm font-semibold text-foreground'>
						Versions ({versions.length})
					</h3>
					{onViewAllVersions && versions.length > 0 && (
						<Button
							variant='ghost'
							size='xs'
							onClick={onViewAllVersions}
							className='h-6 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground'
						>
							View all
						</Button>
					)}
				</div>

				<div className='space-y-2'>
					{recentVersions.map((ver) => {
						const isSelected = ver.id === activeVersion?.id;
						const formattedVerDate = (() => {
							try {
								return format(new Date(ver.created_at), "MMM d");
							} catch {
								return "";
							}
						})();

						return (
							<div
								key={ver.id}
								className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
									isSelected
										? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
										: "border-border/60 bg-muted/10 hover:bg-muted/20"
								}`}
							>
								<div className='flex items-center gap-2 min-w-0'>
									<span className='font-mono font-bold text-foreground text-xs'>
										v{ver.version_number}
									</span>

									{ver.status === "DRAFT" ? (
										<Badge
											variant='outline'
											className='text-[9px] px-1.5 py-0 bg-amber-500/10 text-amber-500 border-amber-500/30 font-medium'
										>
											Draft
										</Badge>
									) : (
										<Badge
											variant='secondary'
											className='text-[9px] px-1.5 py-0 bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-medium'
										>
											Published
										</Badge>
									)}

									{formattedVerDate && (
										<span className='text-[10px] text-muted-foreground'>
											{formattedVerDate}
										</span>
									)}
								</div>

								{isSelected ? (
									<Badge
										variant='secondary'
										className='text-[9px] bg-primary/20 text-primary border-transparent gap-1 px-2 py-0.5'
									>
										<Check className='size-2.5' />
										Previewing
									</Badge>
								) : (
									<Button
										variant='ghost'
										size='xs'
										onClick={() => onSelectVersion(ver.id)}
										className='h-6 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground'
									>
										<Eye className='size-3 mr-1' />
										Preview
									</Button>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</aside>
	);
}

export function TemplateManagementSidebarSkeleton() {
	return (
		<aside className='w-full space-y-4'>
			{/* Management Card Skeleton */}
			<div className='rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs'>
				<Skeleton className='h-4 w-36' />
				<div className='space-y-3 pt-1'>
					<div className='flex justify-between items-center'>
						<Skeleton className='h-3 w-14' />
						<Skeleton className='h-5 w-16 rounded-full' />
					</div>
					<div className='flex justify-between items-center'>
						<Skeleton className='h-3 w-16' />
						<Skeleton className='h-5 w-20 rounded-full' />
					</div>
					<div className='flex justify-between items-center'>
						<Skeleton className='h-3 w-24' />
						<Skeleton className='h-3 w-20' />
					</div>
					<div className='flex justify-between items-center'>
						<Skeleton className='h-3 w-18' />
						<Skeleton className='h-3 w-24' />
					</div>
					<div className='flex justify-between items-center'>
						<Skeleton className='h-3 w-14' />
						<Skeleton className='h-3 w-20' />
					</div>
				</div>

				<Skeleton className='h-px w-full' />

				<div className='space-y-2 pt-1'>
					<Skeleton className='h-9 w-full rounded-lg' />
					<Skeleton className='h-9 w-full rounded-lg' />
				</div>
			</div>

			{/* Versions Card Skeleton */}
			<div className='rounded-2xl border border-border/80 bg-card p-5 space-y-3 shadow-xs'>
				<div className='flex justify-between items-center'>
					<Skeleton className='h-4 w-24' />
					<Skeleton className='h-3 w-12' />
				</div>
				<Skeleton className='h-10 w-full rounded-xl' />
				<Skeleton className='h-10 w-full rounded-xl' />
			</div>
		</aside>
	);
}
