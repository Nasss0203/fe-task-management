"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import {
	analyticsCountFormatter,
	sumAnalyticsTotals,
	TemplateAnalyticsStats,
	useCreatorTemplatesAnalytics,
} from "@/entities/template";
import { useUser } from "@/features/auth";
import { Button } from "@/shared/ui/button";

/** Last-30-days summary; periods and per-template detail live on /creator/analytics. */
export function CreatorPerformance() {
	const { user } = useUser();
	const query = useCreatorTemplatesAnalytics({
		userId: user?.id,
		period: "30d",
	});
	const totals = sumAnalyticsTotals(query.data?.items ?? []);

	return (
		<section
			aria-labelledby='creator-performance-title'
			className='flex flex-col gap-3'
		>
			<div className='flex items-end justify-between gap-3'>
				<div className='flex flex-col gap-0.5'>
					<h2
						id='creator-performance-title'
						className='text-base font-semibold'
					>
						Performance
					</h2>
					<p className='text-xs text-muted-foreground'>
						Last 30 days · all your templates
					</p>
				</div>
				<Link
					href='/creator/analytics'
					className='inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground hover:text-foreground'
				>
					View analytics
					<ArrowRight className='size-3.5' />
				</Link>
			</div>

			{query.isError ? (
				<div
					role='alert'
					className='flex flex-col items-start gap-3 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between'
				>
					<p className='text-sm text-muted-foreground'>
						Unable to load analytics.
					</p>
					<Button
						variant='outline'
						size='sm'
						onClick={() => query.refetch()}
					>
						Try again
					</Button>
				</div>
			) : (
				<TemplateAnalyticsStats
					totals={totals}
					viewsCaption={`${analyticsCountFormatter.format(totals.guestViews)} from guests`}
					isLoading={query.isPending}
					isStale={false}
				/>
			)}
		</section>
	);
}
