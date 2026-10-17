"use client";

import { ArrowRight, LayoutTemplate } from "lucide-react";
import Link from "next/link";

import { useTemplateVersionThumbnail } from "@/entities/template/model/template.queries";
import type { PublicTemplateListItem } from "@/entities/template/model/template.types";
import { formatVnd } from "@/shared/lib/currency";

type TemplateCardProps = {
	item: PublicTemplateListItem;
	/** Detail page link; landing and workspace galleries differ only here. */
	href?: string;
};

export function getTemplatePriceLabel(
	item: Pick<PublicTemplateListItem, "offer_type" | "price_amount">,
) {
	return item.offer_type === "PAID" && item.price_amount
		? formatVnd(item.price_amount)
		: "Free";
}

export default function TemplateCard({ item, href }: TemplateCardProps) {
	const { data: thumbnail } = useTemplateVersionThumbnail(
		item.id,
		item.version?.id,
		// Paid screenshots are hidden on purpose; fall back to the cover at once.
		{ retryMissing: item.offer_type !== "PAID" },
	);

	const visualUrl = thumbnail?.url || item.cover_url;

	return (
		<Link
			href={href ?? `/templates/${item.id}`}
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

				{item.categories && item.categories.length > 0 && (
					<div className='mt-3 flex flex-wrap gap-1'>
						{item.categories.slice(0, 2).map((category) => (
							<span
								key={category.id}
								className='rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground'
							>
								{category.name}
							</span>
						))}
					</div>
				)}

				<div className='mt-4 flex items-center justify-between gap-2 border-t border-border/40 pt-3 text-xs font-medium'>
					<span
						className={
							item.offer_type === "PAID"
								? "text-foreground"
								: "text-emerald-600 dark:text-emerald-400"
						}
					>
						{getTemplatePriceLabel(item)}
					</span>
					<span className='inline-flex items-center gap-1.5 text-muted-foreground transition-colors group-hover:text-foreground'>
						View template
						<ArrowRight className='h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5' />
					</span>
				</div>
			</div>
		</Link>
	);
}
