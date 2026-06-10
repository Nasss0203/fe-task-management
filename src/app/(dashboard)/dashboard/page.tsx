"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { cn } from "@/lib/utils";
import {
	Activity,
	AlertTriangle,
	ArrowRight,
	CalendarClock,
	CheckCircle2,
	ChevronRight,
	Clock3,
	FolderKanban,
	ListTodo,
	RefreshCw,
	Target,
	TimerReset,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";
import { useMemo } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingDashboard } from "@/features/dashboard/components/overview/LoadingDashboard";
import { DashboardTaskItem } from "@/features/dashboard/components/overview/DashboardTaskItem";
import { DashboardActivityItem } from "@/features/dashboard/components/overview/DashboardActivityItem";
import { toLocalDateInputValue, getClientTimezone, formatDashboardDate } from "@/features/dashboard/utils/date";
import { clampPercent, formatMinutes } from "@/features/dashboard/utils/task-style";

type StatCardItem = {
	title: string;
	value: number;
	description: string;
	change: string;
	icon: ComponentType<{ className?: string }>;
	tone: string;
};

export default function DashboardPage() {
	const timezone = getClientTimezone();

	const query = useMemo(
		() => ({
			date: toLocalDateInputValue(),
			timezone,
			limit: 5,
		}),
		[timezone],
	);

	const {
		myDashboard: { data: dashboardQuery, isLoading, isError, refetch },
	} = useDashboard(query);
	const dashboard = dashboardQuery?.data;

	const stats = useMemo<StatCardItem[]>(() => {
		if (!dashboard) return [];

		return [
			{
				title: "Việc của tôi",
				value: dashboard.stats.myTasks,
				description: `${dashboard.stats.priorityToday} việc ưu tiên hôm nay`,
				change: "Tổng task đang theo dõi",
				icon: ListTodo,
				tone: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300",
			},
			{
				title: "Sắp đến hạn",
				value: dashboard.stats.upcoming,
				description: `Trong ${dashboard.stats.upcomingWindowDays} ngày tới`,
				change: "Cần giữ nhịp",
				icon: Clock3,
				tone: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300",
			},
			{
				title: "Quá hạn",
				value: dashboard.stats.overdue,
				description: "Cần xử lý trước",
				change: dashboard.stats.overdue ? "Đang có rủi ro" : "Đang ổn",
				icon: AlertTriangle,
				tone: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300",
			},
			{
				title: "Hoàn thành",
				value: dashboard.stats.completedThisWeek,
				description: "Tuần này",
				change: `${clampPercent(dashboard.stats.weeklyGoalPercent)}% mục tiêu`,
				icon: CheckCircle2,
				tone: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
			},
		];
	}, [dashboard]);

	if (isLoading) {
		return <LoadingDashboard />;
	}

	if (isError || !dashboard) {
		return (
			<main
				className='flex min-h-0 min-w-0 w-full flex-1 flex-col gap-5 overflow-x-hidden overflow-y-auto pb-10 sm:max-w-full'
				style={{ maxWidth: "calc(100dvw - 2rem)" }}
			>
				<Card>
					<CardHeader>
						<CardTitle>Không tải được dashboard</CardTitle>
						<CardDescription>
							Vui lòng thử lại để lấy dữ liệu mới nhất từ hệ
							thống.
						</CardDescription>
						<CardAction>
							<Button variant='outline' onClick={() => refetch()}>
								<RefreshCw />
								Tải lại
							</Button>
						</CardAction>
					</CardHeader>
				</Card>
			</main>
		);
	}

	const focus = dashboard.focus;
	const dayProgress = clampPercent(focus.dayProgressPercent);
	const weeklyGoal = clampPercent(dashboard.stats.weeklyGoalPercent);
	const MomentumIcon = focus.momentumPercent >= 0 ? TrendingUp : TrendingDown;
	const primaryWorkspace = dashboard.recentWorkspaces[0];

	return (
		<main
			className='flex min-h-0 min-w-0 w-full flex-1 flex-col gap-5 overflow-x-hidden overflow-y-auto pb-10 sm:max-w-full'
			style={{ maxWidth: "calc(100dvw - 2rem)" }}
		>
			<section className='mb-2 rounded-2xl border-none bg-gradient-to-br from-muted/50 to-background p-6 xl:p-8'>
				<div className='flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between'>
					<div className='min-w-0'>
						<p className='text-[13px] font-bold tracking-widest text-primary uppercase'>
							Bảng điều khiển cá nhân
						</p>
						<h1 className='mt-2 text-3xl font-bold tracking-tight md:text-4xl'>
							Chào bạn, {dashboard.greeting.displayName}
						</h1>
						<p className='mt-3 max-w-2xl text-[15px] leading-7 text-muted-foreground'>
							Bạn có <strong className='text-foreground font-semibold'>{dashboard.greeting.todayPriorityCount} việc ưu tiên</strong> hôm nay. Dashboard đang gom deadline, nhịp
							làm việc, workspace gần đây và hoạt động mới nhất
							vào một màn hình.
						</p>
					</div>

					<div className='flex flex-wrap items-center gap-3'>
						<div className='rounded-full border bg-background px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm'>
							{formatDashboardDate(dashboard.greeting.date)}
						</div>
						<Button asChild variant='default' className='rounded-full shadow-sm'>
							<Link href='/dashboard/my-tasks'>
								<ListTodo className="mr-2 h-4 w-4" />
								<span>
									Xem {dashboard.priorityTasks.length} task ưu tiên
								</span>
							</Link>
						</Button>
						{primaryWorkspace ? (
							<Button asChild variant='secondary' className='rounded-full max-w-[240px] shadow-sm'>
								<Link
									href={`/dashboard/${primaryWorkspace.slug}`}
								>
									<FolderKanban className="mr-2 h-4 w-4" />
									<span className='truncate'>
										Mở {primaryWorkspace.name}
									</span>
								</Link>
							</Button>
						) : (
							<Button disabled variant='secondary' className='rounded-full'>
								<FolderKanban className="mr-2 h-4 w-4" />
								Chưa có workspace
							</Button>
						)}
					</div>
				</div>
			</section>

			<section className='grid min-w-0 gap-4 xl:grid-cols-12'>
				<Card className='xl:col-span-8'>
					<CardHeader>
						<CardTitle>{focus.title}</CardTitle>
						<CardDescription>{focus.message}</CardDescription>
					</CardHeader>
					<CardContent className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]'>
						<div className='flex flex-col gap-5'>
							<div className='grid gap-3 md:grid-cols-3'>
								<div className='rounded-lg border bg-muted/35 p-4'>
									<div className='mb-3 flex items-center justify-between gap-3'>
										<Target className='text-muted-foreground' />
										<span className='text-xs font-medium text-muted-foreground'>
											Deep work
										</span>
									</div>
									<p className='text-xl font-semibold'>
										{formatMinutes(focus.deepWorkMinutes)}
									</p>
									<p className='mt-1 text-xs leading-5 text-muted-foreground'>
										Thời lượng tập trung hôm nay
									</p>
								</div>

								<div className='rounded-lg border bg-muted/35 p-4'>
									<div className='mb-3 flex items-center justify-between gap-3'>
										<TimerReset className='text-muted-foreground' />
										<span className='text-xs font-medium text-muted-foreground'>
											Review
										</span>
									</div>
									<p className='text-xl font-semibold'>
										{focus.reviewTaskCount} task
									</p>
									<p className='mt-1 text-xs leading-5 text-muted-foreground'>
										Việc cần xem lại trong ngày
									</p>
								</div>

								<div className='rounded-lg border bg-muted/35 p-4'>
									<div className='mb-3 flex items-center justify-between gap-3'>
										<MomentumIcon className='text-muted-foreground' />
										<span className='text-xs font-medium text-muted-foreground'>
											Momentum
										</span>
									</div>
									<p
										className={cn(
											"text-xl font-semibold",
											focus.momentumPercent < 0
												? "text-red-600 dark:text-red-300"
												: "text-emerald-600 dark:text-emerald-300",
										)}
									>
										{focus.momentumPercent > 0 ? "+" : ""}
										{focus.momentumPercent}%
									</p>
									<p className='mt-1 text-xs leading-5 text-muted-foreground'>
										Đà hoàn thành so với nhịp mục tiêu
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

								{dashboard.rhythmBlocks.length ? (
									<div className='grid gap-2 md:grid-cols-2'>
										{dashboard.rhythmBlocks.map((item) => (
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

				<Card className='xl:col-span-4'>
					<CardHeader>
						<CardTitle>Lịch gần nhất</CardTitle>
						<CardDescription>
							Các mốc nên xử lý trước
						</CardDescription>
						<CardAction>
							<CalendarClock className='text-muted-foreground' />
						</CardAction>
					</CardHeader>
					<CardContent className='flex flex-col gap-3'>
						{dashboard.recentDeadlines.length ? (
							dashboard.recentDeadlines.map((item) => (
								<div
									key={item.id}
									className='flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/20 p-3.5 shadow-sm transition-colors hover:bg-muted/40'
								>
									<div className='min-w-0'>
										<p className='truncate text-[14px] font-semibold text-foreground'>
											{item.title}
										</p>
										<p className='mt-1 truncate text-[12px] text-muted-foreground'>
											{item.workspaceName} /{" "}
											{item.projectName}
										</p>
									</div>
									<Badge
										variant='outline'
										className='shrink-0 border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300'
									>
										{item.remainingLabel}
									</Badge>
								</div>
							))
						) : (
							<EmptyState>Không có deadline gần.</EmptyState>
						)}
					</CardContent>
				</Card>
			</section>

			<section className='grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
				{stats.map((item) => {
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

			<section className='grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-12'>
				<Card id='priority-today' className='scroll-mt-4 xl:col-span-8'>
					<CardHeader>
						<CardTitle>Ưu tiên hôm nay</CardTitle>
						<CardDescription>
							Các task quan trọng nhất đang cần bạn giữ nhịp.
						</CardDescription>
						<CardAction>
							<Button variant='ghost' size='sm' asChild>
								<Link href='#priority-today'>
									Xem danh sách này
									<ArrowRight />
								</Link>
							</Button>
						</CardAction>
					</CardHeader>
					<CardContent className='flex flex-col gap-3'>
						{dashboard.priorityTasks.length ? (
						dashboard.priorityTasks.map((task) => (
							<DashboardTaskItem key={task.id} task={task} />
						))
					) : (
							<EmptyState>
								Chưa có task ưu tiên hôm nay.
							</EmptyState>
						)}
					</CardContent>
				</Card>

				<Card className='xl:col-span-4'>
					<CardHeader>
						<CardTitle>Workspace gần đây</CardTitle>
						<CardDescription>
							Không gian bạn vừa làm việc
						</CardDescription>
					</CardHeader>
					<CardContent className='flex flex-col gap-3'>
						{dashboard.recentWorkspaces.length ? (
							dashboard.recentWorkspaces.map((workspace) => (
								<Link
									key={workspace.id}
									href={`/dashboard/${workspace.slug}`}
									className='group flex items-center justify-between gap-3 rounded-lg border bg-background p-4 transition hover:border-primary/30 hover:bg-muted/30'
								>
									<div className='flex min-w-0 items-center gap-3'>
										<div className='flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/45'>
											<FolderKanban className='text-muted-foreground' />
										</div>
										<div className='min-w-0'>
											<p className='truncate text-sm font-semibold'>
												{workspace.name}
											</p>
											<p className='mt-1 truncate text-xs text-muted-foreground'>
												{workspace.projectCount} dự án /{" "}
												{workspace.openTaskCount} task
												mở
											</p>
										</div>
									</div>
									<ChevronRight className='shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground' />
								</Link>
							))
						) : (
							<EmptyState>Chưa có workspace gần đây.</EmptyState>
						)}
					</CardContent>
				</Card>
			</section>

			<section className='grid min-w-0 gap-4 xl:grid-cols-12'>
				<Card className='xl:col-span-8'>
					<CardHeader>
						<CardTitle>Hoạt động gần đây</CardTitle>
						<CardDescription>
							Các thay đổi mới nhất có liên quan trực tiếp đến
							bạn.
						</CardDescription>
					</CardHeader>
					<CardContent>
						{dashboard.recentActivities.length ? (
						<div className='flex flex-col'>
							{dashboard.recentActivities.map(
								(activity, index) => (
									<DashboardActivityItem
										key={activity.id}
										activity={activity}
										isLast={
											index ===
											dashboard.recentActivities
												.length -
												1
										}
									/>
								),
							)}
						</div>
						) : (
							<EmptyState>Chưa có hoạt động gần đây.</EmptyState>
						)}
					</CardContent>
				</Card>

				<Card className='xl:col-span-4'>
					<CardHeader>
						<CardTitle>Gợi ý hành động</CardTitle>
						<CardDescription>
							Những việc nhỏ giúp bảng của bạn gọn hơn.
						</CardDescription>
					</CardHeader>
					<CardContent className='flex flex-col gap-3'>
						{dashboard.suggestions.length ? (
							dashboard.suggestions.map((suggestion) => (
								<div
									key={`${suggestion.type}-${suggestion.message}`}
									className='flex items-start gap-3 rounded-lg border bg-background p-3'
								>
									<Activity className='mt-0.5 shrink-0 text-muted-foreground' />
									<p className='text-sm leading-6'>
										{suggestion.message}
									</p>
								</div>
							))
						) : (
							<EmptyState>Không có gợi ý mới.</EmptyState>
						)}

						<div className='rounded-lg border bg-muted/25 p-4'>
							<div className='mb-2 flex items-center justify-between text-xs text-muted-foreground'>
								<span>Mục tiêu tuần</span>
								<span>{weeklyGoal}%</span>
							</div>
							<Progress value={weeklyGoal} className='h-2' />
						</div>
					</CardContent>
				</Card>
			</section>
		</main>
	);
}
