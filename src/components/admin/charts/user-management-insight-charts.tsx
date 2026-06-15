"use client";

import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";
import type { AdminUserOverviewResponseDto } from "@/services/admin/user/type";
import { Activity, Lock, TrendingUp, UserPlus } from "lucide-react";
import { Cell, Pie, PieChart } from "recharts";

type Props = {
	overview?: AdminUserOverviewResponseDto;
};

const rateChartConfig = {
	active: {
		label: "Đang hoạt động",
		color: "#34d399",
	},
	locked: {
		label: "Bị khóa",
		color: "#fb7185",
	},
	inactive: {
		label: "Không hoạt động",
		color: "#737373",
	},
} satisfies ChartConfig;

const rateColorMap = {
	active: "#34d399",
	locked: "#fb7185",
	inactive: "#737373",
} as const;

const formatPercent = (value: number) => `${Math.round(value)}%`;

const getRate = (value = 0, total = 0) => {
	if (!total) return 0;
	return Math.round((value / total) * 100);
};

const buildRateData = (overview?: AdminUserOverviewResponseDto) => {
	const totalUsers = overview?.totalUsers ?? 0;
	const activeUsers = overview?.activeUsers ?? 0;
	const lockedUsers = overview?.lockedUsers ?? 0;
	const inactiveUsers = Math.max(totalUsers - activeUsers - lockedUsers, 0);

	return [
		{ key: "active", name: "Đang hoạt động", value: activeUsers },
		{ key: "locked", name: "Bị khóa", value: lockedUsers },
		{ key: "inactive", name: "Không hoạt động", value: inactiveUsers },
	].filter((item) => item.value > 0);
};

export function UserManagementInsightCharts({ overview }: Props) {
	const totalUsers = overview?.totalUsers ?? 0;
	const newUsers = overview?.newUsersLast7Days ?? 0;
	const activeToday = overview?.activeToday ?? 0;
	const activeRate = getRate(overview?.activeUsers, totalUsers);
	const lockedRate = getRate(overview?.lockedUsers, totalUsers);
	const rateData = buildRateData(overview);

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
		<section className='rounded-2xl border border-white/10 bg-[#0b0b0b] p-5 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]'>
			<div className='mb-5'>
				<h2 className='text-base font-semibold text-white'>
					Tổng quan tài khoản
				</h2>
				<p className='mt-1 text-sm text-neutral-500'>
					Phân bổ trạng thái và các chỉ số hoạt động gần đây.
				</p>
			</div>

			{rateData.length === 0 ? (
				<div className='flex h-[260px] items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-neutral-500'>
					Chưa có dữ liệu tài khoản.
				</div>
			) : (
				<div className='grid items-center gap-6 lg:grid-cols-[360px_1fr]'>
					<div className='flex flex-col items-center border-white/10 lg:border-r lg:pr-6'>
						<div className='relative'>
								<ChartContainer
									config={rateChartConfig}
									className='h-[220px] w-[220px] shrink-0'
									initialDimension={{ width: 220, height: 220 }}
								>
									<PieChart accessibilityLayer>
										<ChartTooltip
											cursor={false}
											position={{ x: 208, y: 76 }}
											allowEscapeViewBox={{
												x: true,
												y: true,
											}}
											content={
												<ChartTooltipContent
													hideLabel
													nameKey='name'
												/>
											}
										/>
										<Pie
											data={rateData}
											dataKey='value'
											nameKey='name'
											innerRadius={58}
											outerRadius={88}
											paddingAngle={3}
										>
											{rateData.map((item) => (
												<Cell
													key={item.key}
													fill={
														rateColorMap[
															item.key as keyof typeof rateColorMap
														]
													}
												/>
											))}
										</Pie>
									</PieChart>
								</ChartContainer>

							<div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center'>
								<span className='text-3xl font-semibold text-white'>
									{totalUsers}
								</span>
								<span className='text-xs text-neutral-500'>
									tài khoản
								</span>
							</div>
						</div>

						<div className='mt-1 flex flex-wrap justify-center gap-x-4 gap-y-2'>
							{rateData.map((item) => (
								<div
									key={item.key}
									className='flex items-center gap-2 text-sm text-neutral-400'
								>
									<span
										className='h-2.5 w-2.5 rounded-full'
										style={{
											backgroundColor:
												rateColorMap[
													item.key as keyof typeof rateColorMap
												],
										}}
									/>
									<span>{item.name}</span>
									<span className='font-medium text-white'>
										{formatPercent(
											getRate(item.value, totalUsers),
										)}
									</span>
								</div>
							))}
						</div>
					</div>

					<div className='grid gap-3 sm:grid-cols-2'>
						{metricItems.map((item) => {
							const Icon = item.icon;

							return (
								<div
									key={item.label}
									className='flex min-h-24 items-center justify-between rounded-xl border border-white/10 bg-[#101010] p-4'
								>
									<div>
										<p className='text-sm text-neutral-400'>
											{item.label}
										</p>
										<p className='mt-2 text-2xl font-semibold text-white'>
											{item.value}
										</p>
									</div>

									<div className='flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]'>
										<Icon
											className={`h-5 w-5 ${item.color}`}
										/>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</section>
	);
}
