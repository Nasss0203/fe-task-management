"use client";

import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";
import type {
	UserGrowthItem,
	UserGrowthPeriod,
} from "@/services/admin/dashboard/type";
import type { AdminUserOverviewResponseDto } from "@/services/admin/user/type";
import { Activity, Lock, TrendingUp, UserPlus } from "lucide-react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Line,
	LineChart,
	XAxis,
	YAxis,
} from "recharts";

type Props = {
	overview?: AdminUserOverviewResponseDto;
	growthData: UserGrowthItem[];
	period: UserGrowthPeriod;
	onPeriodChange: (period: UserGrowthPeriod) => void;
};

const areaChartConfig = {
	users: {
		label: "Người dùng mới",
		color: "#38bdf8",
	},
} satisfies ChartConfig;

const rateChartConfig = {
	activeRate: {
		label: "Tỷ lệ hoạt động",
		color: "#34d399",
	},
	lockedRate: {
		label: "Tỷ lệ bị khóa",
		color: "#fb7185",
	},
} satisfies ChartConfig;

const periodOptions: Array<{ label: string; value: UserGrowthPeriod }> = [
	{ label: "7 ngày", value: "7d" },
	{ label: "30 ngày", value: "30d" },
	{ label: "60 ngày", value: "60d" },
	{ label: "1 năm", value: "1y" },
];

const formatPercent = (value: number) => `${Math.round(value)}%`;

const getRate = (value = 0, total = 0) => {
	if (!total) return 0;
	return Math.round((value / total) * 100);
};

const formatXAxisLabel = (value: string, period: UserGrowthPeriod) => {
	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return value;
	}

	if (period === "7d") {
		return date.toLocaleDateString("vi-VN", {
			weekday: "short",
		});
	}

	if (period === "1y") {
		return date.toLocaleDateString("vi-VN", {
			month: "short",
		});
	}

	return date.toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
	});
};

const getXAxisInterval = (period: UserGrowthPeriod) => {
	if (period === "7d") return 0;
	if (period === "30d") return 3;
	if (period === "60d") return 6;
	return 1;
};

const buildRateData = (
	growthData: UserGrowthItem[],
	overview?: AdminUserOverviewResponseDto,
) => {
	const totalUsers = overview?.totalUsers ?? 0;
	const activeRate = getRate(overview?.activeUsers, totalUsers);
	const lockedRate = getRate(overview?.lockedUsers, totalUsers);

	if (!growthData.length) {
		return [
			{ name: "Hiện tại", activeRate, lockedRate },
			{ name: "Tổng quan", activeRate, lockedRate },
		];
	}

	return growthData.map((item) => ({
		name: item.date,
		activeRate,
		lockedRate,
	}));
};

export function UserManagementInsightCharts({
	overview,
	growthData,
	period,
	onPeriodChange,
}: Props) {
	const totalUsers = overview?.totalUsers ?? 0;
	const newUsers = overview?.newUsersLast7Days ?? 0;
	const activeToday = overview?.activeToday ?? 0;
	const activeRate = getRate(overview?.activeUsers, totalUsers);
	const lockedRate = getRate(overview?.lockedUsers, totalUsers);
	const rateData = buildRateData(growthData, overview);

	const metricItems = [
		{
			label: "Người dùng mới 7 ngày",
			value: newUsers,
			icon: UserPlus,
			color: "text-sky-300",
		},
		{
			label: "Hoạt động hôm nay",
			value: activeToday,
			icon: Activity,
			color: "text-emerald-300",
		},
		{
			label: "Tỷ lệ hoạt động",
			value: formatPercent(activeRate),
			icon: TrendingUp,
			color: "text-emerald-300",
		},
		{
			label: "Tỷ lệ bị khóa",
			value: formatPercent(lockedRate),
			icon: Lock,
			color: "text-rose-300",
		},
	];

	return (
		<section className='space-y-3'>
			<div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
				{metricItems.map((item) => {
					const Icon = item.icon;

					return (
						<div
							key={item.label}
							className='flex items-center justify-between rounded-xl border border-white/10 bg-[#101010] px-4 py-3'
						>
							<div className='flex items-center gap-2'>
								<Icon className={`h-4 w-4 ${item.color}`} />
								<p className='text-sm text-neutral-400'>
									{item.label}
								</p>
							</div>

							<span className='text-sm font-semibold text-white'>
								{item.value}
							</span>
						</div>
					);
				})}
			</div>

			<div className='grid gap-4 xl:grid-cols-5'>
				<div className='rounded-2xl border border-white/10 bg-[#0b0b0b] p-5 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset] xl:col-span-3'>
					<div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
						<div>
							<h2 className='text-base font-semibold text-white'>
								Tăng trưởng người dùng
							</h2>
							<p className='mt-1 text-sm text-neutral-500'>
								Area chart theo số tài khoản đăng ký mới.
							</p>
						</div>

						<select
							value={period}
							onChange={(event) =>
								onPeriodChange(
									event.target.value as UserGrowthPeriod,
								)
							}
							className='h-9 rounded-xl border border-white/10 bg-[#111111] px-3 text-sm text-white outline-none focus:border-sky-500/50'
						>
							{periodOptions.map((option) => (
								<option
									key={option.value}
									value={option.value}
								>
									{option.label}
								</option>
							))}
						</select>
					</div>

					<div className='h-[260px]'>
						{growthData.length === 0 ? (
							<div className='flex h-full items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-neutral-500'>
								Chưa có dữ liệu tăng trưởng người dùng.
							</div>
						) : (
							<ChartContainer
								config={areaChartConfig}
								className='h-full w-full'
							>
								<AreaChart data={growthData} accessibilityLayer>
									<defs>
										<linearGradient
											id='userGrowthFill'
											x1='0'
											x2='0'
											y1='0'
											y2='1'
										>
											<stop
												offset='5%'
												stopColor='var(--color-users)'
												stopOpacity={0.35}
											/>
											<stop
												offset='95%'
												stopColor='var(--color-users)'
												stopOpacity={0.02}
											/>
										</linearGradient>
									</defs>

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
											formatXAxisLabel(
												String(value),
												period,
											)
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
										content={<ChartTooltipContent />}
									/>
									<Area
										dataKey='users'
										type='monotone'
										fill='url(#userGrowthFill)'
										stroke='var(--color-users)'
										strokeWidth={2}
									/>
								</AreaChart>
							</ChartContainer>
						)}
					</div>
				</div>

				<div className='rounded-2xl border border-white/10 bg-[#0b0b0b] p-5 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset] xl:col-span-2'>
					<div className='mb-4'>
						<h2 className='text-base font-semibold text-white'>
							Tỷ lệ tài khoản
						</h2>
						<p className='mt-1 text-sm text-neutral-500'>
							Line chart hiển thị tỷ lệ hiện tại trên tổng user.
						</p>
					</div>

					<div className='h-[260px]'>
						<ChartContainer
							config={rateChartConfig}
							className='h-full w-full'
						>
							<LineChart data={rateData} accessibilityLayer>
								<CartesianGrid
									vertical={false}
									strokeDasharray='3 3'
									stroke='#262626'
								/>
								<XAxis
									dataKey='name'
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
									tickFormatter={(value) =>
										`${Number(value)}%`
									}
									domain={[0, 100]}
								/>
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent />}
								/>
								<Line
									dataKey='activeRate'
									type='monotone'
									stroke='var(--color-activeRate)'
									strokeWidth={2}
									dot={false}
								/>
								<Line
									dataKey='lockedRate'
									type='monotone'
									stroke='var(--color-lockedRate)'
									strokeWidth={2}
									dot={false}
								/>
							</LineChart>
						</ChartContainer>
					</div>
				</div>
			</div>
		</section>
	);
}
