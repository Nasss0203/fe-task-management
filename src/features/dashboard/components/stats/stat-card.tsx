"use client";

import { Card, CardContent } from "@/components/ui/card";
import { StatItem } from "@/types/type";
import Link from "next/link";

type Props = {
	item: StatItem;
	workspaceSlug?: string;
};

export function StatCard({ item, workspaceSlug }: Props) {
	const Icon = item.icon;

	return (
		<Link href={`/dashboard/${workspaceSlug}/${item.url}`}>
			<Card className='h-full border-border/80 bg-card/80 shadow-sm transition hover:border-primary/40 hover:bg-card hover:shadow-md'>
				<CardContent className='p-5'>
					<div className='flex items-start justify-between'>
						<div className='space-y-1'>
							<p className='text-sm text-muted-foreground'>
								{item.title}
							</p>
							<p className='text-3xl font-bold'>{item.value}</p>
							<p className='text-xs text-muted-foreground'>
								{item.description}
							</p>
						</div>

						<div className='rounded-lg border border-primary/15 bg-primary/10 p-2 text-primary'>
							<Icon className='h-5 w-5' />
						</div>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
