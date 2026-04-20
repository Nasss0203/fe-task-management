"use client";

import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { WorkspaceGrowthItem } from "../shared/types";

type Props = {
	data: WorkspaceGrowthItem[];
};

export function WorkspaceGrowthChart({ data }: Props) {
	return (
		<div className='rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5'>
			<div className='mb-4'>
				<h2 className='text-lg font-semibold text-white'>
					New Workspaces
				</h2>
				<p className='text-sm text-neutral-400'>
					Workspace creation by month.
				</p>
			</div>

			<div className='h-[280px]'>
				<ResponsiveContainer width='100%' height='100%'>
					<BarChart data={data}>
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
						<Bar
							dataKey='workspaces'
							fill='#ffffff'
							radius={[8, 8, 0, 0]}
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
