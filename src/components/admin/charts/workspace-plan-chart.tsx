"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";
import type { WorkspacePlanItem } from "@/services/admin/dashboard/type";
import { Pie, PieChart } from "recharts";

type Props = {
	data: WorkspacePlanItem[];
};

const chartConfig = {
	value: {
		label: "Workspaces",
	},
	free: {
		label: "Free",
		color: "#CBD5E1",
	},
	pro: {
		label: "Pro",
		color: "#7C3AED",
	},
} satisfies ChartConfig;

const getPlanKey = (name: string) => {
	return name.toLowerCase();
};

export function WorkspacePlanChart({ data }: Props) {
	const chartData = data
		.filter((item) => ["free", "pro"].includes(getPlanKey(item.name)))
		.map((item) => {
			const key = getPlanKey(item.name);

			return {
				plan: key,
				name: item.name,
				value: item.value,
				fill: `var(--color-${key})`,
			};
		});

	return (
		<Card className='rounded-2xl border border-border bg-white p-0 shadow-sm'>
			<CardHeader className='pt-4 pb-0'>
				<CardTitle className='text-lg font-semibold text-[#0F172A]'>
					Workspace Free / Pro
				</CardTitle>
				<CardDescription className='text-sm text-[#64748B]'>
					Phân bổ workspace theo gói dịch vụ.
				</CardDescription>
			</CardHeader>

			<CardContent
				className='pb-6'
				style={{ paddingLeft: 28, paddingRight: 28 }}
			>
				<div className='h-[280px]'>
					{chartData.length === 0 ? (
						<div className='flex h-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-[#64748B]'>
							Chưa có dữ liệu gói workspace
						</div>
					) : (
						<ChartContainer
							config={chartConfig}
							className='mx-auto aspect-square h-full max-h-[260px]'
						>
							<PieChart>
								<ChartTooltip
									cursor={false}
									content={
										<ChartTooltipContent
											hideLabel
											nameKey='name'
										/>
									}
								/>

								<Pie
									data={chartData}
									dataKey='value'
									nameKey='name'
									innerRadius={65}
									outerRadius={95}
									paddingAngle={4}
								/>
							</PieChart>
						</ChartContainer>
					)}
				</div>

				<div className='mt-3 space-y-2 px-1'>
					{chartData.map((item) => {
						const planKey = item.plan as "free" | "pro";
						return (
							<div
								key={item.plan}
								className='flex items-center justify-between text-sm'
							>
								<div className='flex items-center gap-2 text-[#334155]'>
									<span
										className='h-2.5 w-2.5 rounded-full'
										style={{
											backgroundColor: chartConfig[planKey]?.color,
										}}
									/>
									{item.name}
								</div>

								<span className='text-[#0F172A]'>{item.value}</span>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
