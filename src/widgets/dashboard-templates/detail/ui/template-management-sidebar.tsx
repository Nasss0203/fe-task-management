"use client";

import React from "react";
import { format } from "date-fns";
import {
	Archive,
	ArrowRight,
	Calendar,
	Check,
	Clock,
	Edit2,
	Eye,
	FileText,
	Globe,
	Lock,
	MoreHorizontal,
	RotateCcw,
	Sparkles,
	User as UserIcon,
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
import { useUser } from "@/features/auth";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Separator } from "@/shared/ui/separator";

interface TemplateManagementSidebarProps {
	template: PageTemplate;
	versions: TemplateVersion[];
	selectedVersionId?: string;
	onSelectVersion: (versionId: string) => void;
	onOpenPublish: () => void;
	onOpenUse: () => void;
	onOpenEdit: () => void;
	onOpenArchive: () => void;
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
}: TemplateManagementSidebarProps) {
	const { user } = useUser();
	const restoreMutation = useRestoreTemplate();

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

	return (
		<aside className='w-full rounded-2xl border border-border/80 bg-card p-5 space-y-6 shadow-xs sticky top-4'>
			{/* Header: Icon, Name, More menu */}
			<div className='space-y-3'>
				<div className='flex items-start justify-between gap-3'>
					<div className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary text-xl font-bold shrink-0'>
						{template.icon ? (
							<span>{template.icon}</span>
						) : (
							<FileText className='size-5' />
						)}
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='ghost'
								size='icon-sm'
								className='text-muted-foreground hover:text-foreground shrink-0 rounded-lg'
								aria-label='More options'
							>
								<MoreHorizontal className='size-4' />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end' className='w-44'>
							{!isArchived ? (
								<>
									<DropdownMenuItem onClick={onOpenEdit} className='text-xs'>
										<Edit2 className='size-3.5 mr-2 text-muted-foreground' />
										Edit details
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={onOpenArchive}
										className='text-xs text-destructive focus:text-destructive'
									>
										<Archive className='size-3.5 mr-2' />
										Archive template
									</DropdownMenuItem>
								</>
							) : (
								<DropdownMenuItem
									onClick={handleRestore}
									disabled={restoreMutation.isPending}
									className='text-xs'
								>
									<RotateCcw className='size-3.5 mr-2 text-muted-foreground' />
									Restore template
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<div className='space-y-1.5'>
					<h2 className='text-base font-semibold leading-snug text-foreground line-clamp-2'>
						{template.name}
					</h2>
					{template.description && (
						<p className='text-xs text-muted-foreground leading-relaxed line-clamp-3'>
							{template.description}
						</p>
					)}
				</div>

				<div className='flex items-center gap-1.5 pt-1'>
					{renderStatusBadge(template.status)}
					{renderVisibilityBadge(template.visibility)}
				</div>
			</div>

			<Separator className='border-border/60' />

			{/* Metadata list */}
			<div className='space-y-2.5 text-xs'>
				<div className='flex items-center justify-between text-muted-foreground'>
					<div className='flex items-center gap-1.5'>
						<UserIcon className='size-3.5 text-muted-foreground/70' />
						<span>Creator</span>
					</div>
					<span className='font-medium text-foreground'>{creatorDisplay}</span>
				</div>

				<div className='flex items-center justify-between text-muted-foreground'>
					<div className='flex items-center gap-1.5'>
						<Calendar className='size-3.5 text-muted-foreground/70' />
						<span>Updated</span>
					</div>
					<span className='font-medium text-foreground'>{formattedUpdated}</span>
				</div>

				{template.source_page_id && (
					<div className='flex items-center justify-between text-muted-foreground'>
						<div className='flex items-center gap-1.5'>
							<FileText className='size-3.5 text-muted-foreground/70' />
							<span>Source page</span>
						</div>
						<span className='font-medium text-foreground truncate max-w-[140px]'>
							Saved from page
						</span>
					</div>
				)}

				<div className='flex items-center justify-between text-muted-foreground'>
					<div className='flex items-center gap-1.5'>
						<Clock className='size-3.5 text-muted-foreground/70' />
						<span>Current version</span>
					</div>
					<span className='font-medium text-foreground'>
						v{activeVersion?.version_number ?? 1}{" "}
						{activeVersion?.status ? `(${activeVersion.status.toLowerCase()})` : ""}
					</span>
				</div>
			</div>

			<Separator className='border-border/60' />

			{/* Primary Action Buttons */}
			<div className='space-y-2'>
				{isArchived ? (
					<div className='space-y-2'>
						<div className='rounded-lg border border-border/70 bg-muted/20 p-3 text-xs text-muted-foreground text-center'>
							This template is archived. Restore it to publish or use.
						</div>
						<Button
							variant='outline'
							size='sm'
							onClick={handleRestore}
							disabled={restoreMutation.isPending}
							className='w-full text-xs font-semibold'
						>
							<RotateCcw className='size-3.5 mr-1.5' />
							Restore template
						</Button>
					</div>
				) : isDraftVersion ? (
					<>
						<Button
							size='sm'
							onClick={onOpenPublish}
							className='w-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 gap-1.5'
						>
							<Sparkles className='size-3.5' />
							Publish version
						</Button>

						<Button
							variant='outline'
							size='sm'
							onClick={onOpenEdit}
							className='w-full text-xs font-medium'
						>
							<Edit2 className='size-3.5 mr-1.5' />
							Edit details
						</Button>

						<div className='text-[11px] text-muted-foreground/80 text-center px-1'>
							This version is a draft. Publish to make it usable.
						</div>
					</>
				) : isPublishedVersion ? (
					<>
						<Button
							size='sm'
							onClick={onOpenUse}
							className='w-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 gap-1.5'
						>
							<FileText className='size-3.5' />
							Use template
							<ArrowRight className='size-3.5 ml-auto' />
						</Button>

						<Button
							variant='outline'
							size='sm'
							onClick={onOpenEdit}
							className='w-full text-xs font-medium'
						>
							<Edit2 className='size-3.5 mr-1.5' />
							Edit details
						</Button>
					</>
				) : (
					<Button
						variant='outline'
						size='sm'
						onClick={onOpenEdit}
						className='w-full text-xs font-medium'
					>
						<Edit2 className='size-3.5 mr-1.5' />
						Edit details
					</Button>
				)}
			</div>

			<Separator className='border-border/60' />

			{/* Versions Section */}
			<div className='space-y-3'>
				<div className='flex items-center justify-between'>
					<h3 className='text-xs font-semibold text-foreground uppercase tracking-wider'>
						Versions ({versions.length})
					</h3>
				</div>

				<div className='space-y-1.5'>
					{versions.map((ver) => {
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
								className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-colors ${
									isSelected
										? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
										: "border-border/60 bg-muted/10 hover:bg-muted/30"
								}`}
							>
								<div className='flex items-center gap-2 min-w-0'>
									<span className='font-mono font-bold text-foreground text-xs'>
										v{ver.version_number}
									</span>

									{ver.status === "DRAFT" ? (
										<Badge
											variant='outline'
											className='text-[9px] px-1.5 py-0 bg-amber-500/10 text-amber-500 border-amber-500/30'
										>
											Draft
										</Badge>
									) : (
										<Badge
											variant='secondary'
											className='text-[9px] px-1.5 py-0 bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
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
										className='text-[9px] bg-primary/20 text-primary border-transparent gap-1 px-1.5 py-0'
									>
										<Check className='size-2.5' />
										Active
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
		<aside className='w-full rounded-2xl border border-border/80 bg-card p-5 space-y-6 shadow-xs'>
			<div className='space-y-3'>
				<div className='flex items-start justify-between'>
					<div className='size-10 rounded-xl bg-muted/40 animate-pulse' />
					<div className='size-7 rounded-lg bg-muted/40 animate-pulse' />
				</div>
				<div className='space-y-2'>
					<div className='h-5 w-3/4 rounded bg-muted/40 animate-pulse' />
					<div className='h-3 w-full rounded bg-muted/30 animate-pulse' />
					<div className='h-3 w-2/3 rounded bg-muted/30 animate-pulse' />
				</div>
				<div className='flex gap-2 pt-1'>
					<div className='h-4 w-14 rounded-full bg-muted/40 animate-pulse' />
					<div className='h-4 w-16 rounded-full bg-muted/40 animate-pulse' />
				</div>
			</div>

			<Separator className='border-border/60' />

			<div className='space-y-3'>
				<div className='flex justify-between'>
					<div className='h-3 w-16 rounded bg-muted/30 animate-pulse' />
					<div className='h-3 w-24 rounded bg-muted/40 animate-pulse' />
				</div>
				<div className='flex justify-between'>
					<div className='h-3 w-16 rounded bg-muted/30 animate-pulse' />
					<div className='h-3 w-20 rounded bg-muted/40 animate-pulse' />
				</div>
				<div className='flex justify-between'>
					<div className='h-3 w-20 rounded bg-muted/30 animate-pulse' />
					<div className='h-3 w-16 rounded bg-muted/40 animate-pulse' />
				</div>
			</div>

			<Separator className='border-border/60' />

			<div className='space-y-2'>
				<div className='h-9 w-full rounded-lg bg-muted/40 animate-pulse' />
				<div className='h-9 w-full rounded-lg bg-muted/30 animate-pulse' />
			</div>

			<Separator className='border-border/60' />

			<div className='space-y-2'>
				<div className='h-4 w-24 rounded bg-muted/40 animate-pulse' />
				<div className='h-10 w-full rounded-lg bg-muted/30 animate-pulse' />
				<div className='h-10 w-full rounded-lg bg-muted/30 animate-pulse' />
			</div>
		</aside>
	);
}
