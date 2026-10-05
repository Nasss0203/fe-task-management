"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
	Eye,
	FileText,
	Globe,
	Lock,
	MoreHorizontal,
	Users,
	Sparkles,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import type {
	PageTemplate,
	TemplateStatus,
	TemplateVisibility,
} from "@/entities/template";
import { TemplateCardShell } from "./template-card-shell";

interface AuthenticatedTemplateCardProps {
	template: PageTemplate;
	onPreview?: (template: PageTemplate) => void;
	onUse?: (template: PageTemplate) => void;
}

export function AuthenticatedTemplateCard({
	template,
	onPreview,
	onUse,
}: AuthenticatedTemplateCardProps) {
	const router = useRouter();
	const formattedDate = React.useMemo(() => {
		try {
			return format(new Date(template.updated_at), "MMM d, yyyy");
		} catch {
			return "Recently";
		}
	}, [template.updated_at]);

	const renderVisibilityBadge = (visibility: TemplateVisibility) => {
		switch (visibility) {
			case "PRIVATE":
				return (
					<Badge
						variant='secondary'
						className='bg-background/90 text-foreground border border-border/60 text-[10px] backdrop-blur-md shadow-xs gap-1 font-medium'
					>
						<Lock className='size-3 text-muted-foreground' />
						Private
					</Badge>
				);
			case "WORKSPACE":
				return (
					<Badge
						variant='secondary'
						className='bg-background/90 text-foreground border border-border/60 text-[10px] backdrop-blur-md shadow-xs gap-1 font-medium'
					>
						<Users className='size-3 text-muted-foreground' />
						Workspace
					</Badge>
				);
			case "PUBLIC":
				return (
					<Badge
						variant='secondary'
						className='bg-background/90 text-foreground border border-border/60 text-[10px] backdrop-blur-md shadow-xs gap-1 font-medium'
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
					className='bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-medium'
				>
					Draft
				</Badge>
			);
		}
		if (status === "PUBLISHED") {
			return (
				<Badge
					variant='secondary'
					className='bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-medium'
				>
					Published
				</Badge>
			);
		}
		return null;
	};

	return (
		<TemplateCardShell
			onClick={() => {
				router.push(`/dashboard/templates/${template.id}`);
			}}
			preview={
				template.cover_url ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={template.cover_url}
						alt={template.name}
						className='h-full w-full object-cover'
					/>
				) : (
					<div className='h-full w-full rounded-xl border border-border/80 bg-card p-4 flex flex-col justify-between select-none'>
						{/* Card Header Simulation */}
						<div className='flex items-center justify-between pb-2 border-b border-border/50 text-[10px] text-muted-foreground'>
							<div className='flex items-center gap-1.5'>
								<div className='flex items-center justify-center size-5 rounded bg-primary/10 text-primary font-bold text-xs'>
									{template.icon ? (
										<span>{template.icon}</span>
									) : (
										<FileText className='size-3' />
									)}
								</div>
								<span className='line-clamp-1 max-w-[120px] font-medium text-foreground/80'>
									{template.name}
								</span>
							</div>
							<div className='h-2 w-8 rounded bg-muted-foreground/20' />
						</div>

						{/* Document lines simulation */}
						<div className='space-y-2 py-2'>
							<div className='h-3 w-4/5 rounded bg-foreground/20 font-bold' />
							<div className='h-2 w-full rounded bg-muted-foreground/20' />
							<div className='h-2 w-2/3 rounded bg-muted-foreground/15' />

							<div className='grid grid-cols-2 gap-2 pt-1'>
								<div className='flex items-center gap-1.5 p-1 rounded-md border border-border/50 bg-muted/20'>
									<div className='size-1.5 rounded-full bg-primary/60' />
									<div className='h-1.5 w-12 rounded bg-foreground/20' />
								</div>
								<div className='flex items-center gap-1.5 p-1 rounded-md border border-border/50 bg-muted/20'>
									<div className='size-1.5 rounded-full bg-emerald-500/60' />
									<div className='h-1.5 w-10 rounded bg-foreground/20' />
								</div>
							</div>
						</div>

						{/* Sync footer indicator */}
						<div className='flex items-center justify-between pt-1 border-t border-border/40 text-[9px] text-muted-foreground'>
							<span className='flex items-center gap-1 text-[9px] text-muted-foreground'>
								<Sparkles className='size-2.5 text-primary/70' />
								Workspace Template
							</span>
							<span className='text-[9px] text-muted-foreground/80'>
								v1
							</span>
						</div>
					</div>
				)
			}
			badgeOverlay={renderVisibilityBadge(template.visibility)}
			meta={
				<div className='flex items-center justify-between w-full text-[10px] text-muted-foreground'>
					<div className='flex items-center gap-1.5'>
						{renderStatusBadge(template.status)}
					</div>
					<span className='text-[10px] text-muted-foreground'>
						Updated {formattedDate}
					</span>
				</div>
			}
			title={template.name}
			description={template.description || "No description provided."}
			footer={
				<div
					className='flex items-center justify-between gap-2'
					onClick={(e) => e.stopPropagation()}
				>
					<Button
						variant='outline'
						size='sm'
						onClick={(e) => {
							e.stopPropagation();
							onPreview?.(template);
						}}
						className='flex-1 rounded-lg text-xs font-medium'
					>
						Preview
					</Button>

					<Button
						size='sm'
						onClick={(e) => {
							e.stopPropagation();
							onUse?.(template);
						}}
						className='flex-1 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90'
					>
						Use template
					</Button>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='ghost'
								size='icon-sm'
								onClick={(e) => e.stopPropagation()}
								className='shrink-0 rounded-lg text-muted-foreground hover:text-foreground'
								aria-label={`Actions for ${template.name}`}
							>
								<MoreHorizontal className='size-4' />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end' className='w-40'>
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									onPreview?.(template);
								}}
								className='text-xs'
							>
								<Eye className='size-3.5 mr-2 text-muted-foreground' />
								Preview
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									onUse?.(template);
								}}
								className='text-xs'
							>
								<FileText className='size-3.5 mr-2 text-muted-foreground' />
								Use template
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			}
		/>
	);
}
