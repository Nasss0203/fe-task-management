"use client";

import { format, parseISO } from "date-fns";
import { useId } from "react";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { formatVnd } from "@/shared/lib/currency";
import { Skeleton } from "@/shared/ui/skeleton";

import type { TemplateAnalyticsDailyPoint } from "../model/template.types";
import { analyticsCountFormatter } from "./template-analytics-stats";

const SERIES = [
	{ key: "views", label: "Views", color: "var(--chart-1)" },
	{ key: "uses", label: "Uses", color: "var(--chart-2)" },
] as const;

const dayLabel = (date: string) => format(parseISO(date), "MMM d");

/** Views/uses line chart with a legend and a table view of every day. */
export function TemplateAnalyticsDaily({
	daily,
	isLoading,
}: {
	daily: TemplateAnalyticsDailyPoint[];
	isLoading: boolean;
}) {
	const titleId = useId();

	return (
		<section
			aria-labelledby={titleId}
			className='flex flex-col gap-4 rounded-xl border bg-card p-5'
		>
			<div className='flex flex-wrap items-center justify-between gap-3'>
				<h2 id={titleId} className='text-sm font-semibold'>
					Views and uses per day
				</h2>
				<ul className='flex items-center gap-4 text-xs text-muted-foreground'>
					{SERIES.map((series) => (
						<li key={series.key} className='flex items-center gap-1.5'>
							<span
								aria-hidden
								className='h-0.5 w-3 rounded-full'
								style={{ backgroundColor: series.color }}
							/>
							{series.label}
						</li>
					))}
				</ul>
			</div>

			{isLoading ? (
				<Skeleton className='h-60 w-full' />
			) : (
				<DailyChart daily={daily} />
			)}

			<details className='group text-sm'>
				<summary className='w-fit cursor-pointer text-xs text-muted-foreground hover:text-foreground'>
					Show as table
				</summary>
				<DailyTable daily={daily} />
			</details>
		</section>
	);
}

function DailyChart({ daily }: { daily: TemplateAnalyticsDailyPoint[] }) {
	return (
		<div className='h-60 w-full'>
			<ResponsiveContainer width='100%' height='100%'>
				<LineChart
					data={daily}
					margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
					accessibilityLayer
				>
					<CartesianGrid
						vertical={false}
						stroke='var(--border)'
						strokeWidth={1}
					/>
					<XAxis
						dataKey='date'
						tickFormatter={dayLabel}
						tickLine={false}
						axisLine={false}
						minTickGap={24}
						tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
					/>
					<YAxis
						allowDecimals={false}
						tickFormatter={(value: number) =>
							analyticsCountFormatter.format(value)
						}
						tickLine={false}
						axisLine={false}
						width={48}
						tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
					/>
					<Tooltip
						cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1 }}
						content={({ active, payload, label }) =>
							active && payload?.length ? (
								<div className='rounded-lg border bg-popover px-3 py-2 text-xs shadow-md'>
									<p className='mb-1 text-muted-foreground'>
										{typeof label === "string" ? dayLabel(label) : null}
									</p>
									{SERIES.map((series) => {
										const point = payload[0]
											.payload as TemplateAnalyticsDailyPoint;
										return (
											<p key={series.key} className='flex items-center gap-2'>
												<span
													aria-hidden
													className='h-0.5 w-3 rounded-full'
													style={{ backgroundColor: series.color }}
												/>
												<span className='font-semibold text-foreground tabular-nums'>
													{point[series.key]}
												</span>
												<span className='text-muted-foreground'>
													{series.label}
												</span>
											</p>
										);
									})}
								</div>
							) : null
						}
					/>
					{SERIES.map((series) => (
						<Line
							key={series.key}
							type='linear'
							dataKey={series.key}
							name={series.label}
							stroke={series.color}
							strokeWidth={2}
							strokeLinecap='round'
							strokeLinejoin='round'
							dot={false}
							activeDot={{ r: 4, stroke: "var(--card)", strokeWidth: 2 }}
							isAnimationActive={false}
						/>
					))}
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}

function DailyTable({ daily }: { daily: TemplateAnalyticsDailyPoint[] }) {
	return (
		<div className='mt-3 max-h-72 overflow-auto rounded-lg border'>
			<table className='w-full text-sm'>
				<thead className='sticky top-0 bg-muted text-xs text-muted-foreground'>
					<tr>
						<th className='px-3 py-2 text-left font-medium'>Date</th>
						<th className='px-3 py-2 text-right font-medium'>Views</th>
						<th className='px-3 py-2 text-right font-medium'>Uses</th>
						<th className='px-3 py-2 text-right font-medium'>Purchases</th>
						<th className='px-3 py-2 text-right font-medium'>Gross</th>
						<th className='px-3 py-2 text-right font-medium'>Earnings</th>
					</tr>
				</thead>
				<tbody className='divide-y'>
					{/* Newest first: the recent days are what people look up. */}
					{[...daily].reverse().map((point) => (
						<tr key={point.date}>
							<td className='px-3 py-1.5'>{dayLabel(point.date)}</td>
							<td className='px-3 py-1.5 text-right tabular-nums'>
								{point.views}
							</td>
							<td className='px-3 py-1.5 text-right tabular-nums'>
								{point.uses}
							</td>
							<td className='px-3 py-1.5 text-right tabular-nums'>
								{point.paidPurchases}
							</td>
							<td className='px-3 py-1.5 text-right tabular-nums'>
								{formatVnd(point.grossRevenue)}
							</td>
							<td className='px-3 py-1.5 text-right tabular-nums'>
								{formatVnd(point.earnings)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
