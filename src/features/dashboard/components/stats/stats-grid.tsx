"use client";

import { StatItem } from "@/types/type";
import { StatCard } from "./stat-card";

type Props = {
	items: StatItem[];
	workspaceSlug?: string;
};

export function StatsGrid({ items, workspaceSlug }: Props) {
	return (
		<div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
			{items.map((item) => (
				<StatCard
					key={item.title}
					item={item}
					workspaceSlug={workspaceSlug}
				/>
			))}
		</div>
	);
}
