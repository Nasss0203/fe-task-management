"use client";

import type {
	UserGrowthItem,
	UserGrowthPeriod,
} from "@/services/admin/dashboard/type";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

type Props = {
	data: UserGrowthItem[];
	period: UserGrowthPeriod;
	onPeriodChange: (period: UserGrowthPeriod) => void;
};

export function UserGrowthChart({ data, period, onPeriodChange }: Props) {
	return (
		<div className='rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5'>
			<div className='mb-4 flex items-center justify-between gap-4'>
				<div>
					<h2 className='text-lg font-semibold text-white'>
						User Growth
					</h2>
					<p className='text-sm text-neutral-400'>
						User registration trend.
					</p>
				</div>

				<select
					value={period}
					onChange={(e) =>
						onPeriodChange(e.target.value as UserGrowthPeriod)
					}
					className='rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white outline-none'
				>
					<option value='7d'>7 days</option>
					<option value='30d'>30 days</option>
					<option value='60d'>60 days</option>
					<option value='1y'>1 year</option>
				</select>
			</div>

			<div className='h-70'>
				{data.length === 0 ? (
					<div className='flex h-full items-center justify-center rounded-xl border border-dashed border-neutral-800 text-sm text-neutral-500'>
						No user growth data
					</div>
				) : (
					<ResponsiveContainer width='100%' height='100%'>
						<LineChart data={data}>
							<CartesianGrid
								strokeDasharray='3 3'
								stroke='#262626'
							/>
							<XAxis dataKey='name' stroke='#737373' />
							<YAxis stroke='#737373' allowDecimals={false} />
							<Tooltip
								contentStyle={{
									background: "#0a0a0a",
									border: "1px solid #262626",
									borderRadius: 12,
								}}
							/>
							<Line
								type='monotone'
								dataKey='users'
								stroke='#ffffff'
								strokeWidth={2}
								dot={{ r: 4 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				)}
			</div>
		</div>
	);
}
