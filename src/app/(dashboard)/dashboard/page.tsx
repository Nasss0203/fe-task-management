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
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { cn } from "@/lib/utils";
import type {
	DashboardActivityResponseDto,
	DashboardTaskResponseDto,
} from "@/services/dashboard/type";
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
import type { ComponentType, ReactNode } from "react";
import { useMemo } from "react";

type StatCardItem = {
	title: string;
	value: number;
	description: string;
	change: string;
	icon: ComponentType<{ className?: string }>;
	tone: string;
};

const toLocalDateInputValue = () => {
	const date = new Date();
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
};

const getClientTimezone = () => {
	if (typeof Intl === "undefined") return undefined;

	return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

const clampPercent = (value?: number | null) => {
	if (typeof value !== "number" || Number.isNaN(value)) return 0;

	return Math.min(100, Math.max(0, value));
};

const formatDashboardDate = (dateValue?: string) => {
	if (!dateValue) return "";

	const [year, month, day] = dateValue.split("-").map(Number);

	if (!year || !month || !day) return dateValue;

	return new Intl.DateTimeFormat("vi-VN", {
		weekday: "long",
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(Date.UTC(year, month - 1, day)));
};

const formatDateTime = (dateValue?: string | null) => {
	if (!dateValue) return "Chưa đặt hạn";

	const date = new Date(dateValue);

	if (Number.isNaN(date.getTime())) return "Chưa đặt hạn";

	return new Intl.DateTimeFormat("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
};

const formatMinutes = (minutes: number) => {
	if (minutes < 60) return `${minutes} phút`;

	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;

	return rest ? `${hours}h ${rest}m` : `${hours}h`;
};

const formatRelativeTime = (dateValue: string) => {
	const date = new Date(dateValue);

	if (Number.isNaN(date.getTime())) return "Vừa xong";

	const diffMinutes = Math.max(
		0,
		Math.floor((Date.now() - date.getTime()) / 60000),
	);

	if (diffMinutes < 1) return "Vừa xong";
	if (diffMinutes < 60) return `${diffMinutes} phút trước`;

	const diffHours = Math.floor(diffMinutes / 60);

	if (diffHours < 24) return `${diffHours} giờ trước`;

	const diffDays = Math.floor(diffHours / 24);

	return `${diffDays} ngày trước`;
};

const getPriorityClass = (priorityLevel?: number | null) => {
	if (!priorityLevel) {
		return "border-border bg-muted text-muted-foreground";
	}

	if (priorityLevel >= 3) {
		return "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-300";
	}

	if (priorityLevel === 2) {
		return "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300";
	}

	return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
};

const getStatusClass = (statusName?: string | null) => {
	const normalized = (statusName ?? "").trim().toLowerCase();

	if (normalized.includes("progress")) {
		return "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-300";
	}

	if (normalized.includes("done") || normalized.includes("complete")) {
		return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
	}

	return "border-border bg-muted text-muted-foreground";
};

const getActivityTone = (action: string) => {
	if (action.includes("START")) return "bg-emerald-500";
	if (action.includes("TASK")) return "bg-blue-500";
	if (action.includes("SPRINT")) return "bg-amber-500";

	return "bg-muted-foreground";
};

function EmptyState({ children }: { children: ReactNode }) {
	return (
		<div className='rounded-lg border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground'>
			{children}
		</div>
	);
}

function LoadingDashboard() {
	return (
		<main
			className='flex min-h-0 min-w-0 w-full flex-1 flex-col gap-5 overflow-x-hidden overflow-y-auto pb-10 sm:max-w-full'
			style={{ maxWidth: "calc(100dvw - 2rem)" }}
		>
			<Skeleton className='h-36 w-full rounded-xl' />
			<div className='grid gap-4 xl:grid-cols-12'>
				<Skeleton className='h-80 rounded-xl xl:col-span-8' />
				<Skeleton className='h-80 rounded-xl xl:col-span-4' />
			</div>
			<div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
				{Array.from({ length: 4 }).map((_, index) => (
					<Skeleton key={index} className='h-40 rounded-xl' />
				))}
			</div>
			<div className='grid gap-4 xl:grid-cols-12'>
				<Skeleton className='h-96 rounded-xl xl:col-span-8' />
				<Skeleton className='h-96 rounded-xl xl:col-span-4' />
			</div>
		</main>
	);
}

function TaskItem({ task }: { task: DashboardTaskResponseDto }) {
	const progress = clampPercent(task.progressPercent);

	return (
		<div className='rounded-lg border bg-background p-4 transition hover:border-primary/30 hover:bg-muted/30'>
			<div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_170px] lg:items-start'>
				<div className='min-w-0'>
					<div className='flex flex-wrap items-center gap-2'>
						<h3 className='min-w-0 truncate text-sm font-semibold md:text-base'>
							{task.title}
						</h3>
						<Badge
							variant='outline'
							className={getPriorityClass(task.priorityLevel)}
						>
							{task.priorityName ?? "No priority"}
						</Badge>
						<Badge
							variant='outline'
							className={getStatusClass(task.statusName)}
						>
							{task.statusName ?? "No status"}
						</Badge>
					</div>
					<p className='mt-2 truncate text-sm text-muted-foreground'>
						{task.workspaceName} / {task.projectName}
					</p>
				</div>

				<div className='text-left lg:text-right'>
					<p className='text-sm font-medium'>
						{formatDateTime(task.dueAt)}
					</p>
					<p className='mt-1 text-xs text-muted-foreground'>
						{progress}% hoàn thành
					</p>
				</div>
			</div>
			<Progress value={progress} className='mt-4 h-1.5 bg-muted' />
		</div>
	);
}

function ActivityItem({
	activity,
	isLast,
}: {
	activity: DashboardActivityResponseDto;
	isLast: boolean;
}) {
	return (
		<div className='flex gap-3'>
			<div className='flex flex-col items-center'>
				<div
					className={cn(
						"mt-1 size-2.5 rounded-full",
						getActivityTone(activity.action),
					)}
				/>
				{isLast ? null : <div className='mt-2 h-full w-px bg-border' />}
			</div>
			<div className='min-w-0 pb-4'>
				<p className='text-sm font-medium leading-6'>
					{activity.message}
				</p>
				<p className='text-xs text-muted-foreground'>
					{formatRelativeTime(activity.createdAt)}
				</p>
			</div>
		</div>
	);
}

export default function DashboardPage() {
	const query = useMemo(
		() => ({
			date: toLocalDateInputValue(),
			timezone: getClientTimezone(),
			limit: 5,
		}),
		[],
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
			<Card>
				<CardHeader className='gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center'>
					<div className='min-w-0'>
						<CardDescription>
							Bảng điều khiển cá nhân
						</CardDescription>
						<CardTitle className='mt-2 text-2xl md:text-3xl'>
							Chào bạn, {dashboard.greeting.displayName}
						</CardTitle>
						<p className='mt-3 max-w-3xl text-sm leading-6 text-muted-foreground'>
							Bạn có {dashboard.greeting.todayPriorityCount} việc
							ưu tiên hôm nay. Dashboard đang gom deadline, nhịp
							làm việc, workspace gần đây và hoạt động mới nhất
							vào một màn hình.
						</p>
					</div>

					<CardAction className='static col-auto row-auto flex flex-wrap items-center gap-2 self-auto justify-self-start xl:justify-self-end'>
						<div className='rounded-md border px-3 py-2 text-sm text-muted-foreground'>
							{formatDashboardDate(dashboard.greeting.date)}
						</div>
						<Button asChild variant='outline'>
							<Link href='/dashboard/my-tasks'>
								<ListTodo />
								<span>
									Xem {dashboard.priorityTasks.length} task ưu
									tiên
								</span>
							</Link>
						</Button>
						{primaryWorkspace ? (
							<Button asChild className='max-w-[240px]'>
								<Link
									href={`/dashboard/${primaryWorkspace.slug}`}
								>
									<FolderKanban />
									<span className='truncate'>
										Mở {primaryWorkspace.name}
									</span>
								</Link>
							</Button>
						) : (
							<Button disabled>
								<FolderKanban />
								Chưa có workspace
							</Button>
						)}
					</CardAction>
				</CardHeader>
			</Card>

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
												className='rounded-md border bg-background/70 p-3'
											>
												<p className='text-xs font-medium text-muted-foreground'>
													{item.time}
												</p>
												<p className='mt-1 truncate text-sm font-semibold'>
													{item.title}
												</p>
												<p className='mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground'>
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
									className='flex items-center justify-between gap-3 rounded-lg border bg-muted/35 p-3'
								>
									<div className='min-w-0'>
										<p className='truncate text-sm font-medium'>
											{item.title}
										</p>
										<p className='mt-1 truncate text-xs text-muted-foreground'>
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
							className='transition hover:border-primary/30'
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
								<TaskItem key={task.id} task={task} />
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
										<ActivityItem
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
