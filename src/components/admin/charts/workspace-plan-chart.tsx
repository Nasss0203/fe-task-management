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
import { Pie, PieChart } from "recharts";
import type { WorkspacePlanItem } from "@/services/admin/dashboard/type";

type Props = {
	data: WorkspacePlanItem[];
};

const chartConfig = {
	value: {
		label: "Workspaces",
	},
	free: {
		label: "Free",
		color: "#ffffff",
	},
	pro: {
		label: "Pro",
		color: "#a3a3a3",
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
		<Card className='rounded-2xl border border-neutral-800 bg-neutral-950/80 p-0 text-white'>
			<CardHeader className='pb-0'>
				<CardTitle className='text-lg font-semibold text-white'>
					Workspace Free / Pro
				</CardTitle>
				<CardDescription className='text-sm text-neutral-400'>
					Phân bổ workspace theo gói dịch vụ.
				</CardDescription>
			</CardHeader>

			<CardContent className='pb-5'>
				<div className='h-[280px]'>
					{chartData.length === 0 ? (
						<div className='flex h-full items-center justify-center rounded-xl border border-dashed border-neutral-800 text-sm text-neutral-500'>
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

				<div className='mt-3 space-y-2'>
					{chartData.map((item) => (
						<div
							key={item.plan}
							className='flex items-center justify-between text-sm'
						>
							<div className='flex items-center gap-2 text-neutral-300'>
								<span
									className='h-2.5 w-2.5 rounded-full'
									style={{
										backgroundColor: item.fill,
									}}
								/>
								{item.name}
							</div>

							<span className='text-white'>{item.value}</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
