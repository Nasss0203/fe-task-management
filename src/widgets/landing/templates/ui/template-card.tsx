"use client";

import { LayoutTemplate } from "lucide-react";
import Link from "next/link";

import { useTemplateVersionThumbnail } from "@/entities/template/model/template.queries";
import type { PublicTemplateListItem } from "@/entities/template/model/template.types";
import { useUser } from "@/features/auth";
import { Button } from "@/shared/ui/button";

type TemplateCardProps = {
	item: PublicTemplateListItem;
};

export default function TemplateCard({ item }: TemplateCardProps) {
	const { user } = useUser();

	const { data: thumbnail } = useTemplateVersionThumbnail(
		item.id,
		item.version.id,
	);

	const ctaHref = user ? "/dashboard" : "/sign-up";

	return (
		<div className='group flex h-full flex-col rounded-2xl border border-border/80 bg-card p-4 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg'>
			<div className='relative mb-3.5 h-44 w-full shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted/20'>
				{thumbnail?.url || item.cover_url ? (
					<div
						className='h-full w-full bg-cover bg-center bg-no-repeat'
						style={{
							backgroundImage: `url("${thumbnail?.url || item.cover_url}")`,
						}}
					/>
				) : (
					<div className='flex h-full w-full items-center justify-center'>
						{item.icon ? (
							<span className='text-4xl'>{item.icon}</span>
						) : (
							<LayoutTemplate className='h-10 w-10 text-muted-foreground/40' />
						)}
					</div>
				)}
			</div>

			<div className='flex flex-1 flex-col'>
				<h3 className='line-clamp-1 text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary'>
					{item.name}
				</h3>

				<p className='mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground'>
					{item.description || "No description available."}
				</p>

				<div className='mt-5 flex items-center justify-between gap-2 border-t border-border/60 pt-3'>
					<Link
						href={`/templates/${item.id}/versions/${item.version.id}/preview`}
						className='flex-1'
					>
						<Button variant='outline' size='sm' className='w-full rounded-lg text-xs font-medium'>
							Preview
						</Button>
					</Link>

					<Link href={ctaHref} className='flex-1'>
						<Button
							size='sm'
							className='w-full rounded-lg bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90'
						>
							Use template
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
