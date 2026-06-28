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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";


const chartConfig = {
	workspaces: {
		label: "Workspaces",
		color: "#2563EB",
	},
} satisfies ChartConfig;

type Props = {
	data: WorkspaceGrowthItem[];
	period: WorkspaceGrowthPeriod;
	onPeriodChange: (period: WorkspaceGrowthPeriod) => void;
	isLoading?: boolean;
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

export function WorkspaceGrowthChart({ data, period, onPeriodChange, isLoading }: Props) {
	return (
		<div className='rounded-2xl border border-border bg-white p-5 shadow-sm'>
			<div className='mb-4 flex items-center justify-between gap-4'>
				<div>
					<h2 className='text-lg font-semibold text-[#0F172A]'>
						Workspace mới
					</h2>
					<p className='text-sm text-[#64748B]'>
						Xu hướng tạo workspace mới.
					</p>
				</div>

				<Select value={period} onValueChange={(val) => onPeriodChange(val as WorkspaceGrowthPeriod)}>
					<SelectTrigger className="rounded-lg border border-input bg-white px-3 py-2 text-sm text-[#1E293B] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="7d">7 ngày</SelectItem>
						<SelectItem value="30d">1 tháng</SelectItem>
						<SelectItem value="60d">2 tháng</SelectItem>
						<SelectItem value="1y">1 năm</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className='h-[280px] relative'>
				{isLoading ? (
					<div className='flex h-full items-center justify-center rounded-xl bg-muted/30 animate-pulse'>
						<div className='flex flex-col items-center gap-2 text-sm text-[#64748B]'>
							<svg className='animate-spin h-5 w-5 text-primary' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
								<circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
								<path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z' />
							</svg>
							Đang tải dữ liệu...
						</div>
					</div>
				) : data.length === 0 ? (
					<div className='flex h-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-[#64748B]'>
						Chưa có dữ liệu tăng trưởng workspace
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
								stroke='#E2E8F0'
							/>

							<XAxis
								dataKey='date'
								tickLine={false}
								axisLine={false}
								tickMargin={10}
								stroke='#64748B'
								interval={getXAxisInterval(period)}
								tickFormatter={(value) =>
									formatXAxisLabel(String(value), period)
								}
							/>

							<YAxis
								tickLine={false}
								axisLine={false}
								stroke='#64748B'
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
