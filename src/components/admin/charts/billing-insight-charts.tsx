"use client";

import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	XAxis,
	YAxis,
} from "recharts";
import type {
	WorkspaceSubscription,
} from "../shared/billing-admin.types";
import { formatCurrency } from "../shared/billing-admin.utils";

type Props = {
	subscriptions: WorkspaceSubscription[];
};

type RevenuePoint = {
	month: string;
	revenue: number;
};

const revenueChartConfig = {
	revenue: {
		label: "Doanh thu",
		color: "#7C3AED",
	},
} satisfies ChartConfig;

const subscriptionChartConfig = {
	active: {
		label: "Active",
		color: "#22C55E",
	},
	expired: {
		label: "Expired",
		color: "#EAB308",
	},
	canceled: {
		label: "Canceled",
		color: "#EF4444",
	},
} satisfies ChartConfig;

const statusColorMap = {
	active: "#22C55E",
	expired: "#EAB308",
	canceled: "#EF4444",
};

const formatMonthLabel = (date: Date) =>
	date.toLocaleDateString("vi-VN", {
		month: "short",
	});

const getRevenueTrend = (subscriptions: WorkspaceSubscription[]) => {
	const current = new Date();
	const points: RevenuePoint[] = Array.from({ length: 6 }, (_, index) => {
		const date = new Date(current.getFullYear(), current.getMonth() - 5 + index, 1);
		return {
			month: formatMonthLabel(date),
			revenue: 0,
		};
	});

	for (const subscription of subscriptions) {
		for (const payment of subscription.paymentHistory) {
			if (payment.status !== "PAID") continue;

			const paidAt = new Date(payment.paidAt);
			const diff =
				(current.getFullYear() - paidAt.getFullYear()) * 12 +
				current.getMonth() -
				paidAt.getMonth();

			const pointIndex = points.length - 1 - diff;

			if (pointIndex >= 0 && pointIndex < points.length) {
				points[pointIndex].revenue += payment.amount;
			}
		}
	}

	return points;
};

const getSubscriptionBreakdown = (subscriptions: WorkspaceSubscription[]) => [
	{
		key: "active",
		name: "Active",
		value: subscriptions.filter((item) => item.status === "ACTIVE").length,
	},
	{
		key: "expired",
		name: "Expired",
		value: subscriptions.filter((item) => item.status === "EXPIRED").length,
	},
	{
		key: "canceled",
		name: "Canceled",
		value: subscriptions.filter((item) => item.status === "CANCELED").length,
	},
];

export function BillingInsightCharts({ subscriptions }: Props) {
	const revenueTrend = getRevenueTrend(subscriptions);
	const subscriptionBreakdown = getSubscriptionBreakdown(subscriptions);
	const totalSubscriptions = subscriptionBreakdown.reduce(
		(sum, item) => sum + item.value,
		0,
	);

	return (
		<section className='grid gap-4 xl:grid-cols-5'>
			<div className='rounded-2xl border border-border bg-white p-5 shadow-sm xl:col-span-3'>
				<div className='mb-4'>
					<h2 className='text-base font-semibold text-[#0F172A]'>
						Doanh thu thanh toán
					</h2>
					<p className='mt-1 text-sm text-[#64748B]'>
						Area chart theo payment đã thanh toán trong 6 tháng gần nhất.
					</p>
				</div>

				<div className='h-[280px]'>
					<ChartContainer
						config={revenueChartConfig}
						className='h-full w-full'
					>
						<AreaChart data={revenueTrend} accessibilityLayer>
							<defs>
								<linearGradient
									id='billingRevenueFill'
									x1='0'
									x2='0'
									y1='0'
									y2='1'
								>
									<stop
										offset='5%'
										stopColor='var(--color-revenue)'
										stopOpacity={0.35}
									/>
									<stop
										offset='95%'
										stopColor='var(--color-revenue)'
										stopOpacity={0.02}
									/>
								</linearGradient>
							</defs>
							<CartesianGrid
								vertical={false}
								strokeDasharray='3 3'
								stroke='#E2E8F0'
							/>
							<XAxis
								dataKey='month'
								tickLine={false}
								axisLine={false}
								tickMargin={10}
								stroke='#64748B'
							/>
							<YAxis
								tickLine={false}
								axisLine={false}
								stroke='#64748B'
								tickFormatter={(value) =>
									formatCurrency(Number(value))
								}
							/>
							<ChartTooltip
								cursor={false}
								content={
									<ChartTooltipContent
										formatter={(value, name) => (
											<div className='flex min-w-32 items-center justify-between gap-4'>
												<span className='text-[#64748B]'>
													{name}
												</span>
												<span className='font-medium text-[#0F172A]'>
													{formatCurrency(
														Number(value),
													)}
												</span>
											</div>
										)}
									/>
								}
							/>
							<Area
								dataKey='revenue'
								type='monotone'
								fill='url(#billingRevenueFill)'
								stroke='var(--color-revenue)'
								strokeWidth={2}
							/>
						</AreaChart>
					</ChartContainer>
				</div>
			</div>

			<div className='rounded-2xl border border-border bg-white p-5 shadow-sm xl:col-span-2'>
				<div className='mb-4'>
					<h2 className='text-base font-semibold text-[#0F172A]'>
						Trạng thái subscription
					</h2>
					<p className='mt-1 text-sm text-[#64748B]'>
						Phân bổ active, expired và canceled.
					</p>
				</div>

				<div className='grid gap-4 md:grid-cols-[1fr_180px] xl:grid-cols-1'>
					<div className='h-[220px]'>
						<ChartContainer
							config={subscriptionChartConfig}
							className='h-full w-full'
						>
							<PieChart accessibilityLayer>
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent hideLabel />}
								/>
								<Pie
									data={subscriptionBreakdown}
									dataKey='value'
									nameKey='key'
									innerRadius={62}
									outerRadius={88}
									paddingAngle={3}
								>
									{subscriptionBreakdown.map((item) => (
										<Cell
											key={item.key}
											fill={
												statusColorMap[
													item.key as keyof typeof statusColorMap
												]
											}
										/>
									))}
								</Pie>
							</PieChart>
						</ChartContainer>
					</div>

					<div className='space-y-2'>
						{subscriptionBreakdown.map((item) => {
							const rate = totalSubscriptions
								? Math.round((item.value / totalSubscriptions) * 100)
								: 0;

							return (
								<div
									key={item.key}
									className='flex items-center justify-between rounded-xl border border-border bg-[#F8FAFC] px-3 py-2'
								>
									<div className='flex items-center gap-2'>
										<span
											className='h-2.5 w-2.5 rounded-full'
											style={{
												backgroundColor:
													statusColorMap[
														item.key as keyof typeof statusColorMap
													],
											}}
										/>
										<span className='text-sm text-[#64748B]'>
											{item.name}
										</span>
									</div>
									<span className='text-sm font-semibold text-[#0F172A]'>
										{item.value} · {rate}%
									</span>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}
