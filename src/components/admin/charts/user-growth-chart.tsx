"use client";

import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { UserGrowthItem } from "../shared/types";

type Props = {
	data: UserGrowthItem[];
};

export function UserGrowthChart({ data }: Props) {
	return (
		<div className='rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5'>
			<div className='mb-4'>
				<h2 className='text-lg font-semibold text-white'>
					User Growth
				</h2>
				<p className='text-sm text-neutral-400'>
					Daily active user trend in the last 7 days.
				</p>
			</div>

			<div className='h-[280px]'>
				<ResponsiveContainer width='100%' height='100%'>
					<LineChart data={data}>
						<CartesianGrid strokeDasharray='3 3' stroke='#262626' />
						<XAxis dataKey='name' stroke='#737373' />
						<YAxis stroke='#737373' />
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
			</div>
		</div>
	);
}
