"use client";

import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
	analyticsCountFormatter,
	sumAnalyticsTotals,
	TemplateAnalyticsDaily,
	TemplateAnalyticsPeriodPicker,
	TemplateAnalyticsStats,
	type TemplateAnalyticsPeriod,
	useCreatorTemplatesAnalytics,
} from "@/entities/template";
import type {
	TemplateAnalyticsTemplateTotals,
	TemplateAnalyticsTotals,
} from "@/entities/template/model/template.types";
import { useUser } from "@/features/auth";
import { formatVnd } from "@/shared/lib/currency";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

const PAGE_SIZE = 10;

type SortKey = keyof Pick<
	TemplateAnalyticsTotals,
	"views" | "uniqueViewers" | "uses" | "paidPurchases" | "grossRevenue" | "earnings"
>;

const COLUMNS: { key: SortKey; label: string; format: (value: number) => string }[] = [
	{ key: "views", label: "Views", format: (v) => analyticsCountFormatter.format(v) },
	{
		key: "uniqueViewers",
		label: "Signed-in viewers",
		format: (v) => analyticsCountFormatter.format(v),
	},
	{ key: "uses", label: "Uses", format: (v) => analyticsCountFormatter.format(v) },
	{
		key: "paidPurchases",
		label: "Purchases",
		format: (v) => analyticsCountFormatter.format(v),
	},
	{ key: "grossRevenue", label: "Gross", format: formatVnd },
	{ key: "earnings", label: "Earnings", format: formatVnd },
];

export function CreatorAnalyticsPage() {
	const { user } = useUser();
	const [period, setPeriod] = useState<TemplateAnalyticsPeriod>("30d");
	const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({
		key: "earnings",
		desc: true,
	});
	const [page, setPage] = useState(0);
	const query = useCreatorTemplatesAnalytics({ userId: user?.id, period });
	const items = query.data?.items ?? [];
	const totals = sumAnalyticsTotals(items);

	const rows = [...items].sort((a, b) => {
		const diff = a.totals[sort.key] - b.totals[sort.key];
		// Ties fall back to name so the order is stable between refetches.
		return (sort.desc ? -diff : diff) || a.name.localeCompare(b.name);
	});
	// shortcut: pages are sliced client-side because the totals and sorting need every
	// template; move paging to the API if a creator ever has thousands of templates.
	const pageCount = Math.max(Math.ceil(rows.length / PAGE_SIZE), 1);
	// Clamp when a new period returns fewer templates.
	const currentPage = Math.min(page, pageCount - 1);
	const pageRows = rows.slice(
		currentPage * PAGE_SIZE,
		(currentPage + 1) * PAGE_SIZE,
	);

	return (
		<div className='flex flex-col gap-8'>
			<header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
				<div className='flex min-w-0 flex-col gap-1'>
					<h1 className='text-2xl font-semibold tracking-tight'>Analytics</h1>
					<p className='text-sm text-muted-foreground'>
						How your templates perform · Vietnam time · your own visits
						excluded
					</p>
				</div>
				<TemplateAnalyticsPeriodPicker
					value={period}
					onChange={(next) => {
						setPeriod(next);
						setPage(0);
					}}
				/>
			</header>

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
				<>
					<TemplateAnalyticsStats
						totals={totals}
						viewsCaption={`${analyticsCountFormatter.format(totals.guestViews)} from guests`}
						isLoading={query.isPending}
						isStale={query.isPlaceholderData}
					/>

					{/* No chart until there is a template to chart. */}
					{(query.isPending || items.length > 0) && (
						<TemplateAnalyticsDaily
							daily={query.data?.daily ?? []}
							isLoading={query.isPending}
						/>
					)}

					<section
						aria-labelledby='creator-analytics-table-title'
						className='flex flex-col gap-3'
					>
						<div className='flex flex-col gap-0.5'>
							<h2
								id='creator-analytics-table-title'
								className='text-base font-semibold'
							>
								By template
							</h2>
							<p className='text-xs text-muted-foreground'>
								Signed-in viewers are counted per template, so they are not
								added up above.
							</p>
						</div>

						<div className='overflow-x-auto rounded-xl border bg-card'>
							{query.isPending ? (
								<div className='flex flex-col gap-3 p-5'>
									<Skeleton className='h-5 w-1/2' />
									<Skeleton className='h-5 w-1/3' />
								</div>
							) : rows.length === 0 ? (
								<p className='px-5 py-10 text-center text-sm text-muted-foreground'>
									No templates yet. Analytics appear once you create one.
								</p>
							) : (
								<ComparisonTable
									rows={pageRows}
									sort={sort}
									onSort={(key) => {
										setSort((current) => ({
											key,
											desc: current.key === key ? !current.desc : true,
										}));
										// A new order starts from the top.
										setPage(0);
									}}
								/>
							)}
						</div>

						{pageCount > 1 && (
							<nav
								aria-label='Template analytics pagination'
								className='flex items-center justify-center gap-3'
							>
								<Button
									variant='outline'
									size='sm'
									disabled={currentPage === 0}
									onClick={() => setPage(currentPage - 1)}
								>
									<ChevronLeft className='size-3.5' />
									Previous
								</Button>
								<span className='text-sm tabular-nums text-muted-foreground'>
									Page {currentPage + 1} of {pageCount}
								</span>
								<Button
									variant='outline'
									size='sm'
									disabled={currentPage >= pageCount - 1}
									onClick={() => setPage(currentPage + 1)}
								>
									Next
									<ChevronRight className='size-3.5' />
								</Button>
							</nav>
						)}
					</section>
				</>
			)}
		</div>
	);
}

function ComparisonTable({
	rows,
	sort,
	onSort,
}: {
	rows: TemplateAnalyticsTemplateTotals[];
	sort: { key: SortKey; desc: boolean };
	onSort: (key: SortKey) => void;
}) {
	return (
		<table className='w-full min-w-[720px] text-sm'>
			<thead className='bg-muted/40 text-xs text-muted-foreground'>
				<tr>
					<th scope='col' className='px-4 py-2 text-left font-medium'>
						Template
					</th>
					{COLUMNS.map((column) => {
						const active = sort.key === column.key;
						const Arrow = sort.desc ? ArrowDown : ArrowUp;
						return (
							<th
								key={column.key}
								scope='col'
								aria-sort={
									active ? (sort.desc ? "descending" : "ascending") : "none"
								}
								className='px-4 py-2 text-right font-medium'
							>
								<button
									type='button'
									onClick={() => onSort(column.key)}
									className={cn(
										"inline-flex items-center gap-1 whitespace-nowrap rounded hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
										active && "text-foreground",
									)}
								>
									{column.label}
									<Arrow
										aria-hidden
										className={cn("size-3", !active && "invisible")}
									/>
								</button>
							</th>
						);
					})}
				</tr>
			</thead>
			<tbody className='divide-y'>
				{rows.map((row) => (
					<tr key={row.templateId} className='hover:bg-muted/50'>
						<th scope='row' className='w-full max-w-0 px-4 py-2.5 text-left font-medium'>
							<Link
								href={`/creator/templates/${row.templateId}?tab=analytics`}
								className='block truncate hover:underline'
							>
								{row.name}
							</Link>
						</th>
						{COLUMNS.map((column) => (
							<td
								key={column.key}
								className='px-4 py-2.5 text-right tabular-nums whitespace-nowrap'
							>
								{column.format(row.totals[column.key])}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
}
