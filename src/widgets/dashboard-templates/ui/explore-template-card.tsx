"use client";

import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import type { MarketingTemplate } from "@/widgets/landing/data/marketing-data";
import { TemplatePreview } from "@/widgets/landing/templates";
import { TemplateCardShell } from "./template-card-shell";

interface ExploreTemplateCardProps {
	template: MarketingTemplate;
}

export function ExploreTemplateCard({ template }: ExploreTemplateCardProps) {
	const previewHref = `/templates/${template.slug || template.id}`;

	return (
		<TemplateCardShell
			preview={
				<TemplatePreview
					previewType={template.previewType}
					variant={template.variant}
				/>
			}
			badgeOverlay={
				<Badge className='bg-background/90 text-foreground border border-border/60 text-[10px] backdrop-blur-md shadow-xs'>
					{template.category}
				</Badge>
			}
			meta={
				template.tags.slice(0, 3).map((tag) => (
					<span
						key={tag}
						className='text-[10px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium'
					>
						{tag}
					</span>
				))
			}
			title={template.name || template.title}
			description={template.description}
			footer={
				<div className='flex items-center justify-between gap-2'>
					<Link href={previewHref} className='flex-1'>
						<Button
							variant='outline'
							size='sm'
							className='w-full rounded-lg text-xs font-medium'
						>
							Preview
						</Button>
					</Link>

					<Link href={previewHref} className='flex-1'>
						<Button
							size='sm'
							className='w-full rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90'
						>
							Use template
						</Button>
					</Link>
				</div>
			}
		/>
	);
}
