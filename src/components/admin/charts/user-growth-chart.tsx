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
	isLoading?: boolean;
};

export function UserGrowthChart({ data, period, onPeriodChange, isLoading }: Props) {
	return (
		<div className='rounded-2xl border border-border bg-white p-5 shadow-sm'>
			<div className='mb-4 flex items-center justify-between gap-4'>
				<div>
					<h2 className='text-lg font-semibold text-[#0F172A]'>
						Tăng trưởng người dùng
					</h2>
					<p className='text-sm text-[#64748B]'>
						Xu hướng đăng ký tài khoản mới.
					</p>
				</div>

				<Select value={period} onValueChange={(val) => onPeriodChange(val as UserGrowthPeriod)}>
					<SelectTrigger className="rounded-lg border border-input bg-white px-3 py-2 text-sm text-[#1E293B] outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
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

			<div className='h-70 relative'>
				{isLoading ? (
					<div className='flex h-full items-center justify-center rounded-xl bg-muted/30 animate-pulse'>
						<div className='flex flex-col items-center gap-2 text-sm text-[#64748B]'>
							<svg className='animate-spin h-5 w-5 text-primary' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
								<circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
								<path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z' />
							</svg>
							Đang tải dữ liệu...
						</div>
					</div>
				) : data.length === 0 ? (
					<div className='flex h-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-[#64748B]'>
						Chưa có dữ liệu tăng trưởng người dùng
					</div>
				) : (
					<ResponsiveContainer width='100%' height='100%'>
						<LineChart data={data}>
							<CartesianGrid
								strokeDasharray='3 3'
								stroke='#E2E8F0'
							/>
							<XAxis dataKey='name' stroke='#64748B' />
							<YAxis stroke='#64748B' allowDecimals={false} />
							<Tooltip
								contentStyle={{
									background: "#ffffff",
									border: "1px solid #E2E8F0",
									borderRadius: 12,
									color: "#1E293B",
									boxShadow: "0 10px 20px -12px rgba(15, 23, 42, 0.25)",
								}}
							/>
							<Line
								type='monotone'
								dataKey='users'
								stroke='#2563EB'
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
