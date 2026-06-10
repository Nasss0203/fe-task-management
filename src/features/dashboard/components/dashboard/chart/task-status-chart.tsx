"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const taskStatusData = [
	{
		name: "Cần làm",
		value: 32,
		color: "#64748B",
	},
	{
		name: "Đang làm",
		value: 18,
		color: "#3B82F6",
	},
	{
		name: "Hoàn thành",
		value: 54,
		color: "#34D399",
	},
	{
		name: "Quá hạn",
		value: 9,
		color: "#EF4444",
	},
];

export const TaskStatusChart = () => {
	const total = taskStatusData.reduce((sum, item) => sum + item.value, 0);

	return (
		<div className='rounded-xl border border-border/80 bg-card/80 p-5 shadow-sm'>
			<div className='mb-4 flex items-start justify-between'>
				<div>
					<h3 className='text-sm font-semibold text-foreground'>
						Trạng thái task
					</h3>
					<p className='text-xs text-muted-foreground'>
						Tổng quan tiến độ trong workspace
					</p>
				</div>

				<div className='rounded-full border border-border px-2 py-1 text-xs text-muted-foreground'>
					4 trạng thái
				</div>
			</div>

			<div className='relative h-[220px]'>
				<ResponsiveContainer width='100%' height='100%'>
					<PieChart>
						<Pie
							data={taskStatusData}
							dataKey='value'
							nameKey='name'
							innerRadius={62}
							outerRadius={86}
							paddingAngle={4}
							strokeWidth={0}
						>
							{taskStatusData.map((item) => (
								<Cell key={item.name} fill={item.color} />
							))}
						</Pie>

						<Tooltip
							cursor={false}
							contentStyle={{
								backgroundColor: "#171717",
								border: "1px solid #333",
								borderRadius: "10px",
								color: "#fff",
							}}
							itemStyle={{
								color: "#fff",
							}}
						/>
					</PieChart>
				</ResponsiveContainer>

				<div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center'>
					<div className='text-2xl font-bold text-foreground'>
						{total}
					</div>
					<div className='text-xs text-muted-foreground'>
						Tổng task
					</div>
				</div>
			</div>

			<div className='mt-4 grid grid-cols-2 gap-3'>
				{taskStatusData.map((item) => (
					<div
						key={item.name}
						className='flex items-center gap-2 rounded-lg border border-border/80 bg-background/50 px-3 py-2'
					>
						<div
							className='size-2 rounded-full'
							style={{ backgroundColor: item.color }}
						/>

						<span className='text-xs text-muted-foreground'>
							{item.name}
						</span>

						<span className='ml-auto text-xs font-semibold text-foreground'>
							{item.value}
							<span className='ml-1 font-normal text-muted-foreground'>
								{Math.round((item.value / total) * 100)}%
							</span>
						</span>
					</div>
				))}
			</div>
		</div>
	);
};
