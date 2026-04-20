"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { WorkspacePlanItem } from "../shared/types";

type Props = {
	data: WorkspacePlanItem[];
};

const COLORS = ["#ffffff", "#a3a3a3", "#525252"];

export function WorkspacePlanChart({ data }: Props) {
	return (
		<div className='rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5'>
			<div className='mb-4'>
				<h2 className='text-lg font-semibold text-white'>
					Free vs Paid Workspaces
				</h2>
				<p className='text-sm text-neutral-400'>
					Distribution of workspace subscription plans.
				</p>
			</div>

			<div className='h-[280px]'>
				<ResponsiveContainer width='100%' height='100%'>
					<PieChart>
						<Pie
							data={data}
							dataKey='value'
							nameKey='name'
							innerRadius={65}
							outerRadius={95}
							paddingAngle={4}
						>
							{data.map((_, index) => (
								<Cell
									key={index}
									fill={COLORS[index % COLORS.length]}
								/>
							))}
						</Pie>
						<Tooltip
							contentStyle={{
								background: "#0a0a0a",
								border: "1px solid #262626",
								borderRadius: 12,
							}}
						/>
					</PieChart>
				</ResponsiveContainer>
			</div>

			<div className='mt-3 space-y-2'>
				{data.map((item, index) => (
					<div
						key={item.name}
						className='flex items-center justify-between text-sm'
					>
						<div className='flex items-center gap-2 text-neutral-300'>
							<span
								className='h-2.5 w-2.5 rounded-full'
								style={{
									backgroundColor:
										COLORS[index % COLORS.length],
								}}
							/>
							{item.name}
						</div>
						<span className='text-white'>{item.value}</span>
					</div>
				))}
			</div>
		</div>
	);
}
