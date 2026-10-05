"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
	ExternalLink,
	Eye,
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
import type { PageTemplate } from "@/entities/template";

interface TemplatePreviewDialogProps {
	template: PageTemplate | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function TemplatePreviewDialog({
	template,
	open,
	onOpenChange,
}: TemplatePreviewDialogProps) {
	if (!template) return null;

	const formattedDate = (() => {
		try {
			return format(new Date(template.updated_at), "MMMM d, yyyy");
		} catch {
			return "Recently";
		}
	})();

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
						<Badge
							variant={template.status === "PUBLISHED" ? "secondary" : "outline"}
							className={
								template.status === "PUBLISHED"
									? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]"
									: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px]"
							}
						>
							{template.status === "PUBLISHED" ? "Published" : "Draft"}
						</Badge>
					</div>

					<DialogTitle className='text-xl font-bold text-foreground flex items-center gap-2'>
						<div className='flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary'>
							{template.icon ? (
								<span>{template.icon}</span>
							) : (
								<FileText className='size-4' />
							)}
						</div>
						<span>{template.name}</span>
					</DialogTitle>

					<DialogDescription className='text-xs text-muted-foreground leading-relaxed pt-1'>
						{template.description || "No description provided for this template."}
					</DialogDescription>
				</DialogHeader>

				{/* Visual Preview Shell */}
				<div className='rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3 select-none my-2'>
					<div className='flex items-center justify-between text-[11px] text-muted-foreground pb-2 border-b border-border/40'>
						<span className='font-medium text-foreground/80'>Template Overview</span>
						<span>Updated {formattedDate}</span>
					</div>

					<div className='space-y-2 py-1'>
						<div className='h-3.5 w-3/4 rounded bg-foreground/15' />
						<div className='h-2 w-full rounded bg-muted-foreground/20' />
						<div className='h-2 w-4/5 rounded bg-muted-foreground/15' />
					</div>

					<div className='grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-[10px] text-muted-foreground'>
						<div className='flex items-center gap-1.5'>
							<Sparkles className='size-3 text-primary' />
							<span>Standard Workspace Format</span>
						</div>
						<div className='text-right'>
							ID: {template.id.slice(0, 8)}...
						</div>
					</div>
				</div>

				{/* Dialog Actions */}
				<div className='flex items-center justify-end gap-2 pt-2'>
					{template.source_page_id && (
						<Link href={`/page/${template.source_page_id}`} target='_blank'>
							<Button variant='outline' size='sm' className='rounded-lg text-xs gap-1.5'>
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
				</div>
			</DialogContent>
		</Dialog>
	);
}
