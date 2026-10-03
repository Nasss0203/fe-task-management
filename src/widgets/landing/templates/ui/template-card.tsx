"use client";

import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { useUser } from "@/features/auth";
import type { MarketingTemplate } from "../../data/marketing-data";
import TemplatePreview from "./template-preview";

type TemplateCardProps = {
	item: MarketingTemplate;
};

export default function TemplateCard({ item }: TemplateCardProps) {
	const { user } = useUser();
	const ctaHref = user ? "/dashboard" : "/sign-up";
	const detailHref = `/templates/${item.slug || item.id}`;

	return (
		<div className='group flex flex-col h-full rounded-2xl border border-border/80 bg-card p-4 shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1'>
			{/* Preview */}
			<div className='relative h-44 w-full shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted/20 mb-3.5'>
				<TemplatePreview previewType={item.previewType} variant={item.variant} />

				{/* Category badge overlaid top right */}
				<Badge className='absolute top-2.5 right-2.5 bg-background/90 text-foreground border border-border/60 text-[10px] backdrop-blur-md shadow-xs'>
					{item.category}
				</Badge>
			</div>

			{/* Tags Row */}
			<div className='flex flex-wrap items-center gap-1.5 mb-2'>
				{item.tags.slice(0, 3).map((tag) => (
					<span
						key={tag}
						className='text-[10px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium'
					>
						{tag}
					</span>
				))}
			</div>

			{/* Title & Description */}
			<div className='flex flex-col flex-1'>
				<h3 className='text-base font-semibold text-foreground group-hover:text-primary transition-colors tracking-tight line-clamp-1'>
					{item.name || item.title}
				</h3>

				<p className='mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1'>
					{item.description}
				</p>

				{/* Action Buttons */}
				<div className='mt-5 pt-3 border-t border-border/60 flex items-center justify-between gap-2'>
					<Link href={detailHref} className='flex-1'>
						<Button
							variant='outline'
							size='sm'
							className='w-full rounded-lg text-xs font-medium'
						>
							Preview
						</Button>
					</Link>

					<Link href={ctaHref} className='flex-1'>
						<Button
							size='sm'
							className='w-full rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90'
						>
							Use template
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
