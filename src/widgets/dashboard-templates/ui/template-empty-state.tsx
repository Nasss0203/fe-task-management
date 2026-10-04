import React from "react";
import Link from "next/link";
import { FileText, Layers, Search, Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface TemplateEmptyStateProps {
	variant: "explore" | "mine" | "workspace" | "no-workspace";
	onResetSearch?: () => void;
	hasSearch?: boolean;
}

export function TemplateEmptyState({
	variant,
	onResetSearch,
	hasSearch,
}: TemplateEmptyStateProps) {
	// If empty due to search filter
	if (hasSearch) {
		return (
			<div className='col-span-full flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-border/80 bg-card/40'>
				<div className='flex items-center justify-center size-12 rounded-xl bg-muted/60 text-muted-foreground mb-4'>
					<Search className='size-6' />
				</div>
				<h3 className='text-base font-semibold text-foreground'>
					No templates found
				</h3>
				<p className='text-xs text-muted-foreground mt-1 max-w-sm'>
					{variant === "explore"
						? "Try another search keyword or select a different category filter."
						: "No templates match your search term. Try a different keyword."}
				</p>
				{onResetSearch && (
					<Button
						variant='outline'
						size='sm'
						onClick={onResetSearch}
						className='mt-4 rounded-lg text-xs'
					>
						Clear search
					</Button>
				)}
			</div>
		);
	}

	if (variant === "mine") {
		return (
			<div className='col-span-full flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-border/80 bg-card/40'>
				<div className='flex items-center justify-center size-12 rounded-xl bg-primary/10 text-primary mb-4'>
					<FileText className='size-6' />
				</div>
				<h3 className='text-base font-semibold text-foreground'>
					You don&apos;t have any templates yet.
				</h3>
				<p className='text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed'>
					Save a page as a template to reuse it later.
				</p>
				<Link href='/dashboard' className='mt-5'>
					<Button size='sm' className='rounded-lg text-xs font-semibold'>
						Browse pages
					</Button>
				</Link>
			</div>
		);
	}

	if (variant === "workspace") {
		return (
			<div className='col-span-full flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-border/80 bg-card/40'>
				<div className='flex items-center justify-center size-12 rounded-xl bg-primary/10 text-primary mb-4'>
					<Layers className='size-6' />
				</div>
				<h3 className='text-base font-semibold text-foreground'>
					No workspace templates yet.
				</h3>
				<p className='text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed'>
					Templates shared with this workspace will appear here.
				</p>
				<p className='text-[11px] text-muted-foreground/80 mt-1'>
					Open any page and choose &ldquo;Save as template&rdquo;.
				</p>
				<Link href='/dashboard' className='mt-5'>
					<Button
						variant='outline'
						size='sm'
						className='rounded-lg text-xs font-medium'
					>
						Browse pages
					</Button>
				</Link>
			</div>
		);
	}

	if (variant === "no-workspace") {
		return (
			<div className='col-span-full flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-border/80 bg-card/40'>
				<div className='flex items-center justify-center size-12 rounded-xl bg-amber-500/10 text-amber-600 mb-4'>
					<Layers className='size-6' />
				</div>
				<h3 className='text-base font-semibold text-foreground'>
					No workspace selected
				</h3>
				<p className='text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed'>
					Please select an active workspace from the sidebar to view workspace templates.
				</p>
			</div>
		);
	}

	// explore default
	return (
		<div className='col-span-full flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-border/80 bg-card/40'>
			<div className='flex items-center justify-center size-12 rounded-xl bg-muted/60 text-muted-foreground mb-4'>
				<Sparkles className='size-6' />
			</div>
			<h3 className='text-base font-semibold text-foreground'>
				No templates found.
			</h3>
			<p className='text-xs text-muted-foreground mt-1'>
				Try another search or category.
			</p>
		</div>
	);
}
