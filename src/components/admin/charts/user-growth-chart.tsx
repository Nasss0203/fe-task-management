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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";


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
						Tăng trưởng người dùng
					</h2>
					<p className='text-sm text-neutral-400'>
						Xu hướng đăng ký tài khoản mới.
					</p>
				</div>

				<Select value={period} onValueChange={(val) => onPeriodChange(val as UserGrowthPeriod)}>
					<SelectTrigger className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white outline-none">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
					<SelectItem value="7d">7 ngày</SelectItem>
					<SelectItem value="30d">30 ngày</SelectItem>
					<SelectItem value="60d">60 ngày</SelectItem>
					<SelectItem value="1y">1 năm</SelectItem>
				</SelectContent>
				</Select>
			</div>

			<div className='h-70'>
				{data.length === 0 ? (
					<div className='flex h-full items-center justify-center rounded-xl border border-dashed border-neutral-800 text-sm text-neutral-500'>
						Chưa có dữ liệu tăng trưởng người dùng
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
