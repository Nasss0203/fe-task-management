"use client";

import { ArrowRight, LayoutTemplate } from "lucide-react";
import Link from "next/link";

import { useTemplateVersionThumbnail } from "@/entities/template/model/template.queries";
import type { PublicTemplateListItem } from "@/entities/template/model/template.types";

type TemplateCardProps = {
	item: PublicTemplateListItem;
};

export default function TemplateCard({ item }: TemplateCardProps) {
	const { data: thumbnail } = useTemplateVersionThumbnail(
		item.id,
		item.version?.id,
	);

	const visualUrl = thumbnail?.url || item.cover_url;

	return (
		<Link
			href={`/templates/${item.id}`}
			className='group flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card transition-all duration-200 hover:border-foreground/20 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
			aria-label={`View template ${item.name}`}
		>
			{/* Thumbnail container */}
			<div className='relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-muted/30 border-b border-border/50'>
				{visualUrl ? (
					<div
						className='h-full w-full bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-[1.02]'
						style={{
							backgroundImage: `url("${visualUrl}")`,
						}}
					/>
				) : (
					<div className='flex h-full w-full items-center justify-center bg-muted/20 text-muted-foreground/50'>
						{item.icon ? (
							<span className='text-3xl select-none'>{item.icon}</span>
						) : (
							<LayoutTemplate className='h-8 w-8' />
						)}
					</div>
				)}
			</div>

			{/* Info container */}
			<div className='flex flex-1 flex-col p-4 sm:p-5'>
				<div className='flex items-start gap-2'>
					{item.icon && (
						<span className='text-lg leading-none mt-0.5 select-none shrink-0' aria-hidden='true'>
							{item.icon}
						</span>
					)}
					<h3 className='line-clamp-1 text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary'>
						{item.name}
					</h3>
				</div>

				<p className='mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground'>
					{item.description || "Explore and use this template in your workspace."}
				</p>

				<div className='mt-4 flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground pt-3 border-t border-border/40'>
					<span>View template</span>
					<ArrowRight className='h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5' />
				</div>
			</div>
		</Link>
	);
}
