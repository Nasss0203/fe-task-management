import { formatVnd } from "@/shared/lib/currency";
import { cn } from "@/shared/lib/utils";
import { Skeleton } from "@/shared/ui/skeleton";

import type { TemplateAnalyticsTotals } from "../model/template.types";

export const analyticsCountFormatter = new Intl.NumberFormat("en", {
	notation: "compact",
});

export const EMPTY_ANALYTICS_TOTALS: TemplateAnalyticsTotals = {
	views: 0,
	uniqueViewers: 0,
	guestViews: 0,
	uses: 0,
	paidPurchases: 0,
	grossRevenue: 0,
	earnings: 0,
};

/**
 * Adds up per-template totals. Unique viewers are distinct per template, so a
 * sum would double-count people; it stays 0 and callers must not show it.
 */
export function sumAnalyticsTotals(
	items: { totals: TemplateAnalyticsTotals }[],
): TemplateAnalyticsTotals {
	return items.reduce<TemplateAnalyticsTotals>(
		(sum, { totals }) => ({
			views: sum.views + totals.views,
			uniqueViewers: 0,
			guestViews: sum.guestViews + totals.guestViews,
			uses: sum.uses + totals.uses,
			paidPurchases: sum.paidPurchases + totals.paidPurchases,
			grossRevenue: sum.grossRevenue + totals.grossRevenue,
			earnings: sum.earnings + totals.earnings,
		}),
		EMPTY_ANALYTICS_TOTALS,
	);
}

/** Four stat tiles: views, uses, purchases, earnings. */
export function TemplateAnalyticsStats({
	totals,
	viewsCaption,
	isLoading,
	isStale,
}: {
	totals: TemplateAnalyticsTotals;
	viewsCaption: string;
	isLoading: boolean;
	/** Previous period still on screen while the next one loads. */
	isStale: boolean;
}) {
	const tiles = [
		{
			label: "Views",
			value: analyticsCountFormatter.format(totals.views),
			caption: viewsCaption,
		},
		{
			label: "Uses",
			value: analyticsCountFormatter.format(totals.uses),
			caption: "Pages created by other users",
		},
		{
			label: "Purchases",
			value: analyticsCountFormatter.format(totals.paidPurchases),
			caption: "Paid orders",
		},
		{
			label: "Earnings",
			value: formatVnd(totals.earnings),
			caption: `${formatVnd(totals.grossRevenue)} gross · after platform fee`,
		},
	];

	return (
		<dl
			aria-busy={isStale || isLoading}
			className={cn(
				"grid grid-cols-2 overflow-hidden rounded-xl border bg-card lg:grid-cols-4",
				"[&>div]:border-border max-lg:[&>div:nth-child(-n+2)]:border-b max-lg:[&>div:nth-child(odd)]:border-r lg:[&>div:not(:last-child)]:border-r",
				isStale && "opacity-60 transition-opacity",
			)}
		>
			{tiles.map((tile) => (
				<div key={tile.label} className='flex min-w-0 flex-col gap-1 p-5'>
					<dt className='text-sm text-muted-foreground'>{tile.label}</dt>
					<dd className='truncate text-2xl font-semibold tracking-tight'>
						{isLoading ? <Skeleton className='h-8 w-20' /> : tile.value}
					</dd>
					<dd className='truncate text-xs text-muted-foreground'>
						{tile.caption}
					</dd>
				</div>
			))}
		</dl>
	);
}
