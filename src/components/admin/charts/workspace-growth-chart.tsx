"use client";

import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";
import type {
	WorkspaceGrowthItem,
	WorkspaceGrowthPeriod,
} from "@/services/admin/dashboard/type";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
	workspaces: {
		label: "Workspaces",
		color: "#ffffff",
	},
} satisfies ChartConfig;

type Props = {
	data: WorkspaceGrowthItem[];
	period: WorkspaceGrowthPeriod;
	onPeriodChange: (period: WorkspaceGrowthPeriod) => void;
};

const formatXAxisLabel = (value: string, period: WorkspaceGrowthPeriod) => {
	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return value;
	}

	if (period === "7d") {
		return date.toLocaleDateString("en-US", {
			weekday: "short",
		});
	}

	if (period === "1y") {
		return date.toLocaleDateString("en-US", {
			month: "short",
		});
	}

	return date.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "2-digit",
	});
};

const formatTooltipLabel = (value: string) => {
	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return date.toLocaleDateString("en-GB", {
		weekday: "short",
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
};

const getXAxisInterval = (period: WorkspaceGrowthPeriod) => {
	if (period === "7d") return 0;
	if (period === "30d") return 3;
	if (period === "60d") return 6;
	if (period === "1y") return 9;

	return 0;
};

export function WorkspaceGrowthChart({ data, period, onPeriodChange }: Props) {
	return (
		<div className='rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5'>
			<div className='mb-4 flex items-center justify-between gap-4'>
				<div>
					<h2 className='text-lg font-semibold text-white'>
						New Workspaces
					</h2>
					<p className='text-sm text-neutral-400'>
						Workspace creation trend.
					</p>
				</div>

				<select
					value={period}
					onChange={(e) =>
						onPeriodChange(e.target.value as WorkspaceGrowthPeriod)
					}
					className='rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white outline-none'
				>
					<option value='7d'>7 days</option>
					<option value='30d'>1 month</option>
					<option value='60d'>2 months</option>
					<option value='1y'>1 year</option>
				</select>
			</div>

			<div className='h-[280px]'>
				{data.length === 0 ? (
					<div className='flex h-full items-center justify-center rounded-xl border border-dashed border-neutral-800 text-sm text-neutral-500'>
						No workspace growth data
					</div>
				) : (
					<ChartContainer
						config={chartConfig}
						className='h-full w-full'
					>
						<BarChart data={data} accessibilityLayer>
							<CartesianGrid
								vertical={false}
								strokeDasharray='3 3'
								stroke='#262626'
							/>

							<XAxis
								dataKey='date'
								tickLine={false}
								axisLine={false}
								tickMargin={10}
								stroke='#737373'
								interval={getXAxisInterval(period)}
								tickFormatter={(value) =>
									formatXAxisLabel(String(value), period)
								}
							/>

							<YAxis
								tickLine={false}
								axisLine={false}
								stroke='#737373'
								allowDecimals={false}
							/>

							<ChartTooltip
								cursor={false}
								content={
									<ChartTooltipContent
										labelFormatter={(value) =>
											formatTooltipLabel(String(value))
										}
									/>
								}
							/>

							<Bar
								dataKey='workspaces'
								fill='var(--color-workspaces)'
								radius={[8, 8, 0, 0]}
							/>
						</BarChart>
					</ChartContainer>
				)}
			</div>
		</div>
	);
}
