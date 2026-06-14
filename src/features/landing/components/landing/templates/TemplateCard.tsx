"use client";

import { Button } from "@/components/ui/button";
import { TemplateItem } from "./template-data";
import TemplatePreview from "./TemplatePreview";
import Link from "next/link";

type TemplateCardProps = {
	item: TemplateItem;
};

export default function TemplateCard({ item }: TemplateCardProps) {
	return (
		<div className='group h-full'>
			<div className='flex h-full flex-col relative overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:bg-muted'>
				<div className='relative h-[210px] shrink-0 overflow-hidden rounded-xl'>
					<TemplatePreview variant={item.variant} />

					<div className='pointer-events-none absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/45 dark:group-hover:bg-black/60' />

					<div className='pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100'>
						<div className='flex w-full max-w-[220px] flex-col gap-3 px-4'>
							<Button
								className='pointer-events-auto h-11 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90'
								onClick={() =>
									console.log("Use Template:", item.title)
								}
							>
								Use Template
							</Button>

							<Link href={`/templates/${item.id}`} className="w-full pointer-events-auto">
								<Button
									variant='outline'
									className='h-11 w-full rounded-xl border-border bg-background/50 text-foreground hover:bg-secondary hover:text-foreground backdrop-blur-sm'
								>
									Preview
								</Button>
							</Link>
						</div>
					</div>
				</div>

				<div className='flex flex-col flex-grow px-1 pb-1 pt-5'>
					<h3 className='text-base font-semibold text-foreground'>
						{item.title}
					</h3>
					<p className='mt-3 line-clamp-4 text-sm leading-6 text-muted-foreground'>
						{item.description}
					</p>
				</div>
			</div>
		</div>
	);
}
