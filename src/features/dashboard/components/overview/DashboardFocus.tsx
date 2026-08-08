import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
	CalendarClock,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { clampPercent } from "@/features/dashboard/utils/task-style";
import type {
	DashboardFocusResponseDto,
	DashboardRhythmBlockResponseDto,
	DashboardStatsResponseDto,
} from "@/services/dashboard/type";

type DashboardFocusProps = {
	focus: DashboardFocusResponseDto;
	rhythmBlocks: DashboardRhythmBlockResponseDto[];
	stats: DashboardStatsResponseDto;
};

export function DashboardFocus({ focus, rhythmBlocks, stats }: DashboardFocusProps) {
	const memoizedDerivedState = useMemo(() => {
		const dayProgress = clampPercent(focus.dayProgressPercent);
		const MomentumIcon = focus.momentumPercent >= 0 ? TrendingUp : TrendingDown;

		return { dayProgress, MomentumIcon };
	}, [focus]);

	const { dayProgress, MomentumIcon } = memoizedDerivedState;

	return (
		<Card className='lg:col-span-8'>
			<CardHeader>
				<CardTitle>{focus.title}</CardTitle>
				<CardDescription>{focus.message}</CardDescription>
			</CardHeader>
			<CardContent className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]'>
				<div className='flex flex-col gap-5'>
					<div className='grid gap-3 grid-cols-1'>
						<div className='flex items-center justify-between rounded-lg border bg-muted/35 p-4'>
							<div className='flex items-center gap-4'>
								<div className='flex size-10 items-center justify-center rounded-full bg-background border'>
									<MomentumIcon className='size-5 text-muted-foreground' />
								</div>
								<div>
									<span className='text-sm font-semibold text-foreground'>
										Momentum
									</span>
									<p className='text-xs text-muted-foreground mt-0.5'>
										Đà hoàn thành so với nhịp mục tiêu
									</p>
								</div>
							</div>
							<p
								className={cn(
									"text-2xl font-bold",
									focus.momentumPercent < 0
										? "text-red-600 dark:text-red-300"
										: "text-emerald-600 dark:text-emerald-300",
								)}
							>
								{focus.momentumPercent != null ? (
									<>
										{focus.momentumPercent > 0 ? "+" : ""}
										{focus.momentumPercent}%
									</>
								) : (
									<span className="text-muted-foreground text-sm">—</span>
								)}
							</p>
						</div>
					</div>

					<div className='rounded-lg border bg-muted/30 p-4'>
						<div className='mb-3 flex items-center justify-between gap-3'>
							<div>
								<p className='text-sm font-semibold'>
									Nhịp làm việc đề xuất
								</p>
								<p className='mt-1 text-xs text-muted-foreground'>
									Các block được ưu tiên theo task
									đang chạy.
								</p>
							</div>
							<CalendarClock className='shrink-0 text-muted-foreground' />
						</div>

						{rhythmBlocks.length ? (
							<div className='grid gap-2 md:grid-cols-2'>
								{rhythmBlocks.map((item) => (
									<div
										key={`${item.taskId}-${item.time}`}
										className='rounded-xl border border-border/50 bg-background/80 p-3 shadow-sm transition hover:shadow-md hover:border-primary/40 cursor-default'
									>
										<p className='text-[11px] font-bold text-muted-foreground tracking-wider uppercase'>
											{item.time}
										</p>
										<p className='mt-1 truncate text-sm font-semibold'>
											{item.title}
										</p>
										<p className='mt-1 line-clamp-2 text-[12px] leading-5 text-muted-foreground'>
											{item.subtitle}
										</p>
									</div>
								))}
							</div>
						) : (
							<EmptyState>
								Chưa có block làm việc đề xuất.
							</EmptyState>
						)}
					</div>
				</div>

				<div className='h-full rounded-lg border bg-background p-4'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm font-medium text-muted-foreground'>
								Tiến độ ngày
							</p>
							<p className='mt-1 text-3xl font-semibold'>
								{dayProgress}%
							</p>
						</div>
						<div className='flex size-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600'>
							<TrendingUp />
						</div>
					</div>

					<div className='mt-6 flex flex-col gap-2'>
						<div className='flex items-center justify-between rounded-md bg-muted/40 px-3 py-2'>
							<span className='text-xs text-muted-foreground'>
								Còn lại
							</span>
							<span className='text-xs font-semibold'>
								{focus.remainingTasks} task
							</span>
						</div>
						<div className='flex items-center justify-between rounded-md bg-muted/40 px-3 py-2'>
							<span className='text-xs text-muted-foreground'>
								Quá hạn
							</span>
							<span className='text-xs font-semibold text-amber-600 dark:text-amber-300'>
								{focus.overdueTasks} task
							</span>
						</div>
					</div>

					<Progress
						value={dayProgress}
						className='mt-5 h-2'
					/>
					<p className='mt-3 text-xs leading-5 text-muted-foreground'>
						{focus.completedThisWeek}/{focus.targetThisWeek}{" "}
						task hoàn thành trong mục tiêu tuần này.
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
