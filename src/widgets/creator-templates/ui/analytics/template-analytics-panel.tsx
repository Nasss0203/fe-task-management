"use client";

import axios from "axios";
import { useState } from "react";

import {
	analyticsCountFormatter,
	EMPTY_ANALYTICS_TOTALS,
	TemplateAnalyticsDaily,
	TemplateAnalyticsPeriodPicker,
	TemplateAnalyticsStats,
	type TemplateAnalyticsPeriod,
	useCreatorTemplateAnalytics,
} from "@/entities/template";
import { formatVnd } from "@/shared/lib/currency";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

export function TemplateAnalyticsPanel({ templateId }: { templateId: string }) {
	const [period, setPeriod] = useState<TemplateAnalyticsPeriod>("30d");
	const query = useCreatorTemplateAnalytics({ templateId, period });
	const totals = query.data?.totals ?? EMPTY_ANALYTICS_TOTALS;
	const daily = query.data?.daily ?? [];
	const versions = query.data?.versions ?? [];
	// The API answers 404 for templates you did not create (e.g. a teammate's).
	const isNotOwner =
		axios.isAxiosError(query.error) && query.error.response?.status === 404;

	return (
		<section aria-label='Template analytics' className='flex flex-col gap-6'>
			<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
				<p className='text-xs text-muted-foreground'>
					Vietnam time · your own visits excluded · revenue before platform fees
				</p>
				<TemplateAnalyticsPeriodPicker value={period} onChange={setPeriod} />
			</div>

			{isNotOwner ? (
				<p className='rounded-xl border bg-card p-5 text-sm text-muted-foreground'>
					Only the creator of this template can see its analytics.
				</p>
			) : query.isError ? (
				<div
					role='alert'
					className='flex flex-col items-start gap-3 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between'
				>
					<p className='text-sm text-muted-foreground'>
						Unable to load analytics.
					</p>
					<Button variant='outline' size='sm' onClick={() => query.refetch()}>
						Try again
					</Button>
				</div>
			) : (
				<>
					<TemplateAnalyticsStats
						totals={totals}
						viewsCaption={`${analyticsCountFormatter.format(totals.uniqueViewers)} signed-in · ${analyticsCountFormatter.format(totals.guestViews)} guests`}
						isLoading={query.isPending}
						isStale={query.isPlaceholderData}
					/>

					<TemplateAnalyticsDaily daily={daily} isLoading={query.isPending} />

					<section
						aria-labelledby='template-versions-title'
						className='overflow-hidden rounded-xl border bg-card'
					>
						<h2
							id='template-versions-title'
							className='border-b px-5 py-3 text-sm font-semibold'
						>
							By version
						</h2>
						{query.isPending ? (
							<div className='p-5'>
								<Skeleton className='h-5 w-1/2' />
							</div>
						) : versions.length === 0 ? (
							<p className='px-5 py-6 text-sm text-muted-foreground'>
								No published versions yet.
							</p>
						) : (
							<table className='w-full text-sm'>
								<thead className='bg-muted/40 text-xs text-muted-foreground'>
									<tr>
										<th className='px-5 py-2 text-left font-medium'>Version</th>
										<th className='px-5 py-2 text-right font-medium'>Uses</th>
										<th className='px-5 py-2 text-right font-medium'>
											Purchases
										</th>
										<th className='px-5 py-2 text-right font-medium'>
											Revenue
										</th>
									</tr>
								</thead>
								<tbody className='divide-y'>
									{versions.map((version) => (
										<tr key={version.versionId}>
											<td className='px-5 py-2.5 font-medium'>
												v{version.versionNumber}
											</td>
											<td className='px-5 py-2.5 text-right tabular-nums'>
												{version.uses}
											</td>
											<td className='px-5 py-2.5 text-right tabular-nums'>
												{version.paidPurchases}
											</td>
											<td className='px-5 py-2.5 text-right tabular-nums'>
												{formatVnd(version.grossRevenue)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
						{/* Views happen on the listing, before anyone picks a version. */}
						<p className='border-t px-5 py-2.5 text-xs text-muted-foreground'>
							Views are counted per template, not per version.
						</p>
					</section>
				</>
			)}
		</section>
	);
}
