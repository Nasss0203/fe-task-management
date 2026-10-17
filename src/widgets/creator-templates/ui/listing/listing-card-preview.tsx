"use client";

import { LayoutTemplate } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

import {
	useTemplateVersionThumbnail,
	type PageTemplate,
} from "@/entities/template";

import { formatVnd, type ListingFormValues } from "../../model/listing-form";

interface ListingCardPreviewProps {
	template: PageTemplate;
	thumbnailVersionId?: string;
	categoryNames: string[];
}

/** Live preview of the marketplace card, built from the unsaved form values. */
export function ListingCardPreview({
	template,
	thumbnailVersionId,
	categoryNames,
}: ListingCardPreviewProps) {
	const { control } = useFormContext<ListingFormValues>();
	const [name, description, offerType, price] = useWatch({
		control,
		name: ["name", "description", "offer_type", "price"],
	});
	const { data: thumbnail } = useTemplateVersionThumbnail(
		template.id,
		thumbnailVersionId,
	);
	const amount = Number(price);

	return (
		<div className='flex flex-col gap-2'>
			<p className='text-xs font-medium text-muted-foreground'>
				Marketplace card preview
			</p>
			<div className='overflow-hidden rounded-xl border bg-card'>
				<div className='flex aspect-video items-center justify-center overflow-hidden border-b bg-muted/40'>
					{thumbnail?.url ? (
						// eslint-disable-next-line @next/next/no-img-element -- signed URL from the API
						<img
							src={thumbnail.url}
							alt=''
							className='size-full object-cover object-top'
						/>
					) : (
						<LayoutTemplate className='size-8 text-muted-foreground/60' />
					)}
				</div>
				<div className='flex flex-col gap-2 p-4'>
					<div className='flex items-start justify-between gap-3'>
						<p className='line-clamp-1 text-sm font-semibold'>
							{name.trim() || "Untitled template"}
						</p>
						<span className='shrink-0 text-sm font-semibold'>
							{offerType === "PAID"
								? amount > 0
									? formatVnd(amount)
									: "—"
								: "Free"}
						</span>
					</div>
					<p className='line-clamp-2 min-h-8 text-xs text-muted-foreground'>
						{description.trim() || "No description yet."}
					</p>
					{categoryNames.length > 0 && (
						<div className='flex flex-wrap gap-1'>
							{categoryNames.map((categoryName) => (
								<span
									key={categoryName}
									className='rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground'
								>
									{categoryName}
								</span>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
