"use client";

import { Heart, LayoutTemplate, Star } from "lucide-react";
import Link from "next/link";

import { useTemplateVersionThumbnail } from "@/entities/template/model/template.queries";
import type { PublicTemplateListItem } from "@/entities/template/model/template.types";
import { formatVnd } from "@/shared/lib/currency";
import { cn } from "@/shared/lib/utils";
import { formatRatingSummary } from "@/features/template-feedback";

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
			className='group flex h-full flex-col overflow-hidden rounded-[14px] border bg-card transition-colors hover:border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
			aria-label={`View template ${item.name}`}
		>
			{/* Thumbnail container */}
			<div className='relative aspect-[2/1] w-full shrink-0 overflow-hidden bg-muted'>
				{visualUrl ? (
					<div
						className='h-full w-full bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-[1.02]'
						style={{
							backgroundImage: `url("${visualUrl}")`,
						}}
					/>
				) : (
					<div className='flex h-full w-full items-center justify-center'>
						<span className='flex size-[60px] items-center justify-center rounded-[14px] border bg-background text-foreground'>
							{item.icon ? (
								<span className='select-none text-[26px] leading-none'>{item.icon}</span>
							) : (
								<LayoutTemplate className='size-[26px]' />
							)}
						</span>
					</div>
				)}
			</div>

			{/* Info container */}
			<div className='flex flex-1 flex-col gap-2.5 p-4'>
				<div className='flex items-start gap-2'>
					{item.icon && (
						<span className='mt-0.5 shrink-0 select-none text-base leading-none' aria-hidden='true'>
							{item.icon}
						</span>
					)}
					<h3 className='line-clamp-1 text-[15px] font-semibold leading-[23px] text-foreground'>
						{item.name}
					</h3>
				</div>

				<p className='line-clamp-2 flex-1 text-[13px] leading-5 text-muted-foreground'>
					{item.description || "Explore and use this template in your workspace."}
				</p>

				{item.categories?.length || item.tags?.length ? (
					<div className='flex min-w-0 flex-wrap items-center gap-1.5 text-[11.5px] leading-[17px]'>
						{item.categories?.slice(0, 2).map((category) => (
							<span
								key={category.id}
								className='rounded-md bg-muted px-2 py-0.5 text-muted-foreground'
							>
								{category.name}
							</span>
						))}

						{item.tags && item.tags.length > 0 && (
							<p className='line-clamp-1 text-faint'>
								{item.tags
									.slice(0, 3)
									.map((tag) => `#${tag}`)
									.join(" ")}
							</p>
						)}
					</div>
				) : null}

				<div className='flex items-center gap-3 border-t pt-1.5 text-[12.5px] leading-[19px] text-muted-foreground'>
					<span className='inline-flex items-center gap-1'>
						<Star
							className={
								item.rating_count
									? "size-[13px] fill-amber-400 text-amber-400"
									: "size-[13px]"
							}
							aria-hidden
						/>
						{formatRatingSummary(item.rating_average, item.rating_count)}
					</span>
					<span className='inline-flex items-center gap-1'>
						<Heart className='size-[13px]' aria-hidden />
						{item.like_count ?? 0}
						<span className='sr-only'>likes</span>
					</span>
					<span
						className={cn(
							"ml-auto text-[13px] font-semibold leading-5",
							item.offer_type === "PAID"
								? "text-foreground"
								: "text-emerald-600 dark:text-emerald-400",
						)}
					>
						{getTemplatePriceLabel(item)}
					</span>
				</div>

				<span className='inline-flex h-8 items-center justify-center rounded-[7px] border border-input text-[13px] font-medium text-foreground transition-colors group-hover:bg-accent'>
					View template
				</span>
			</div>
		</Link>
	);
}
