"use client";

import React, { useState } from "react";
import {
	BarChart3,
	DollarSign,
	Eye,
	FileText,
	Heart,
	MessageSquare,
	Percent,
	ShoppingBag,
	Sparkles,
	Star,
	TrendingUp,
} from "lucide-react";
import type { PageTemplate } from "@/entities/template";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

interface TemplateAnalyticsShellProps {
	template: PageTemplate;
}

type TimeRange = "7d" | "30d" | "90d" | "all";

export function TemplateAnalyticsShell({ template }: TemplateAnalyticsShellProps) {
	const [timeRange, setTimeRange] = useState<TimeRange>("30d");

	return (
		<div className='w-full space-y-6'>
			{/* Tab Header with Time Range Filter Pills */}
			<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
				<div>
					<div className='flex items-center gap-2'>
						<h2 className='text-lg font-semibold tracking-tight text-foreground'>
							Analytics
						</h2>
						<Badge
							variant='outline'
							className='bg-muted/30 text-muted-foreground border-border/70 text-[11px] gap-1 font-medium'
						>
							<Sparkles className='size-3 text-muted-foreground/70' />
							Design Preview
						</Badge>
					</div>
					<p className='text-xs text-muted-foreground mt-0.5'>
						Usage metrics, performance, and revenue insights for &ldquo;{template.name}&rdquo;.
					</p>
				</div>

				{/* Time Range Selector */}
				<div className='flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/40 w-fit'>
					<Button
						variant={timeRange === "7d" ? "secondary" : "ghost"}
						size='xs'
						onClick={() => setTimeRange("7d")}
						className={`h-7 px-2.5 text-xs font-medium rounded-lg ${
							timeRange === "7d" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
						}`}
					>
						7 days
					</Button>
					<Button
						variant={timeRange === "30d" ? "secondary" : "ghost"}
						size='xs'
						onClick={() => setTimeRange("30d")}
						className={`h-7 px-2.5 text-xs font-medium rounded-lg ${
							timeRange === "30d" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
						}`}
					>
						30 days
					</Button>
					<Button
						variant={timeRange === "90d" ? "secondary" : "ghost"}
						size='xs'
						onClick={() => setTimeRange("90d")}
						className={`h-7 px-2.5 text-xs font-medium rounded-lg ${
							timeRange === "90d" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
						}`}
					>
						90 days
					</Button>
					<Button
						variant={timeRange === "all" ? "secondary" : "ghost"}
						size='xs'
						onClick={() => setTimeRange("all")}
						className={`h-7 px-2.5 text-xs font-medium rounded-lg ${
							timeRange === "all" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
						}`}
					>
						All time
					</Button>
				</div>
			</div>

			{/* Top Metric Cards: 4 cols Desktop, 2x2 Tablet, 1 col Mobile */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
				{/* Views */}
				<div className='rounded-2xl border border-border/80 bg-card p-5 space-y-2 shadow-xs'>
					<div className='flex items-center justify-between text-muted-foreground'>
						<span className='text-xs font-medium'>Template views</span>
						<Eye className='size-4' />
					</div>
					<div className='text-2xl font-bold font-mono tracking-tight text-foreground'>
						—
					</div>
					<p className='text-[11px] text-muted-foreground'>
						Data not available yet
					</p>
				</div>

				{/* Uses */}
				<div className='rounded-2xl border border-border/80 bg-card p-5 space-y-2 shadow-xs'>
					<div className='flex items-center justify-between text-muted-foreground'>
						<span className='text-xs font-medium'>Total uses</span>
						<FileText className='size-4' />
					</div>
					<div className='text-2xl font-bold font-mono tracking-tight text-foreground'>
						—
					</div>
					<p className='text-[11px] text-muted-foreground'>
						Data not available yet
					</p>
				</div>

				{/* Purchases */}
				<div className='rounded-2xl border border-border/80 bg-card p-5 space-y-2 shadow-xs'>
					<div className='flex items-center justify-between text-muted-foreground'>
						<span className='text-xs font-medium'>Purchases</span>
						<ShoppingBag className='size-4' />
					</div>
					<div className='text-2xl font-bold font-mono tracking-tight text-foreground'>
						—
					</div>
					<p className='text-[11px] text-muted-foreground'>
						Data not available yet
					</p>
				</div>

				{/* Conversion */}
				<div className='rounded-2xl border border-border/80 bg-card p-5 space-y-2 shadow-xs'>
					<div className='flex items-center justify-between text-muted-foreground'>
						<span className='text-xs font-medium'>Conversion rate</span>
						<Percent className='size-4' />
					</div>
					<div className='text-2xl font-bold font-mono tracking-tight text-foreground'>
						—
					</div>
					<p className='text-[11px] text-muted-foreground'>
						Data not available yet
					</p>
				</div>
			</div>

			{/* Revenue Over Time Chart Area */}
			<div className='rounded-2xl border border-border/80 bg-card p-6 space-y-5 shadow-xs'>
				<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
					<div>
						<div className='flex items-center gap-2'>
							<TrendingUp className='size-4 text-primary' />
							<h3 className='text-sm font-semibold text-foreground'>
								Revenue & earnings over time
							</h3>
						</div>
						<p className='text-xs text-muted-foreground mt-0.5'>
							Aggregated earnings and transaction trends.
						</p>
					</div>

					<div className='flex items-center gap-4 text-xs'>
						<div className='flex items-center gap-1.5'>
							<span className='text-muted-foreground'>Gross revenue:</span>
							<span className='font-mono font-medium text-foreground'>—</span>
						</div>
						<span className='text-border'>•</span>
						<div className='flex items-center gap-1.5'>
							<span className='text-muted-foreground'>Net earnings:</span>
							<span className='font-mono font-medium text-emerald-500'>—</span>
						</div>
					</div>
				</div>

				{/* Empty Chart Placeholder (No fake line graph) */}
				<div className='rounded-xl border border-dashed border-border/70 bg-muted/10 h-64 flex flex-col items-center justify-center p-6 text-center text-muted-foreground'>
					<div className='flex size-12 items-center justify-center rounded-full bg-muted/40 mb-3'>
						<BarChart3 className='size-5 text-muted-foreground/70' />
					</div>
					<p className='text-sm font-medium text-foreground'>
						Analytics chart will appear here once tracking is enabled
					</p>
					<p className='text-xs text-muted-foreground mt-1 max-w-sm leading-relaxed'>
						Event tracking and time-series telemetry for template views, clones, and revenue are not active yet.
					</p>
				</div>
			</div>

			{/* Engagement Section */}
			<div className='rounded-2xl border border-border/80 bg-card p-6 space-y-4 shadow-xs'>
				<h3 className='text-sm font-semibold text-foreground'>
					Audience engagement & ratings
				</h3>

				<div className='grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1'>
					{/* Likes */}
					<div className='rounded-xl border border-border/60 bg-muted/10 p-4 space-y-1.5'>
						<div className='flex items-center justify-between text-muted-foreground'>
							<span className='text-xs'>Likes</span>
							<Heart className='size-3.5' />
						</div>
						<div className='text-lg font-bold font-mono text-foreground'>
							—
						</div>
					</div>

					{/* Reviews */}
					<div className='rounded-xl border border-border/60 bg-muted/10 p-4 space-y-1.5'>
						<div className='flex items-center justify-between text-muted-foreground'>
							<span className='text-xs'>Reviews</span>
							<Star className='size-3.5' />
						</div>
						<div className='text-lg font-bold font-mono text-foreground'>
							—
						</div>
					</div>

					{/* Average Rating */}
					<div className='rounded-xl border border-border/60 bg-muted/10 p-4 space-y-1.5'>
						<div className='flex items-center justify-between text-muted-foreground'>
							<span className='text-xs'>Average rating</span>
							<DollarSign className='size-3.5' />
						</div>
						<div className='text-lg font-bold font-mono text-foreground'>
							—
						</div>
					</div>

					{/* Comments */}
					<div className='rounded-xl border border-border/60 bg-muted/10 p-4 space-y-1.5'>
						<div className='flex items-center justify-between text-muted-foreground'>
							<span className='text-xs'>Comments</span>
							<MessageSquare className='size-3.5' />
						</div>
						<div className='text-lg font-bold font-mono text-foreground'>
							—
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
