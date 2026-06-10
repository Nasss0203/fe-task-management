import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
	AlertTriangle,
	CheckCircle2,
	Clock3,
	ListTodo,
} from "lucide-react";
import type { ComponentType } from "react";
import { useMemo } from "react";
import { clampPercent } from "@/features/dashboard/utils/task-style";
import type { DashboardStatsResponseDto } from "@/services/dashboard/type";

type StatCardItem = {
	title: string;
	value: number;
	description: string;
	change: string;
	icon: ComponentType<{ className?: string }>;
	tone: string;
};

type DashboardStatsProps = {
	stats: DashboardStatsResponseDto;
};

export function DashboardStats({ stats }: DashboardStatsProps) {
	const statItems = useMemo<StatCardItem[]>(() => {
		return [
			{
				title: "Việc của tôi",
				value: stats.myTasks,
				description: `${stats.priorityToday} việc ưu tiên hôm nay`,
				change: "Tổng task đang theo dõi",
				icon: ListTodo,
				tone: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300",
			},
			{
				title: "Sắp đến hạn",
				value: stats.upcoming,
				description: `Trong ${stats.upcomingWindowDays} ngày tới`,
				change: "Cần giữ nhịp",
				icon: Clock3,
				tone: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300",
			},
			{
				title: "Quá hạn",
				value: stats.overdue,
				description: "Cần xử lý trước",
				change: stats.overdue ? "Đang có rủi ro" : "Đang ổn",
				icon: AlertTriangle,
				tone: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300",
			},
			{
				title: "Hoàn thành",
				value: stats.completedThisWeek,
				description: "Tuần này",
				change: `${clampPercent(stats.weeklyGoalPercent)}% mục tiêu`,
				icon: CheckCircle2,
				tone: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
			},
		];
	}, [stats]);

	return (
		<section className='grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
			{statItems.map((item) => {
				const Icon = item.icon;

				return (
					<Card
						key={item.title}
						className='transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/40'
					>
						<CardContent className='flex flex-col gap-5'>
							<div className='flex items-start justify-between gap-3'>
								<div
									className={cn(
										"rounded-lg border p-2.5",
										item.tone,
									)}
								>
									<Icon />
								</div>
								<span className='text-xs font-medium text-muted-foreground'>
									{item.change}
								</span>
							</div>
							<div className='flex flex-col gap-1'>
								<p className='text-sm text-muted-foreground'>
									{item.title}
								</p>
								<p className='text-3xl font-semibold'>
									{item.value}
								</p>
								<p className='text-xs text-muted-foreground'>
									{item.description}
								</p>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</section>
	);
}
