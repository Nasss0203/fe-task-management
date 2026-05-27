"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@/features/auth/hooks/useUser";
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace";
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
	Plus,
	Target,
	TimerReset,
	TrendingUp,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo } from "react";

const stats = [
	{
		title: "Việc của tôi",
		value: "24",
		description: "6 việc cần ưu tiên",
		change: "+4 hôm nay",
		icon: ListTodo,
		tone: "text-sky-600 bg-sky-500/10 border-sky-500/20",
	},
	{
		title: "Sắp đến hạn",
		value: "6",
		description: "Trong 3 ngày tới",
		change: "2 việc hôm nay",
		icon: Clock3,
		tone: "text-amber-600 bg-amber-500/10 border-amber-500/20",
	},
	{
		title: "Quá hạn",
		value: "2",
		description: "Cần xử lý trước 17:00",
		change: "-1 so với hôm qua",
		icon: AlertTriangle,
		tone: "text-rose-600 bg-rose-500/10 border-rose-500/20",
	},
	{
		title: "Hoàn thành",
		value: "18",
		description: "Tuần này",
		change: "72% mục tiêu",
		icon: CheckCircle2,
		tone: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
	},
];

const todayTasks = [
	{
		title: "Fix login API",
		workspace: "Task management",
		project: "Auth",
		due: "Hôm nay, 18:00",
		priority: "Cao",
		status: "Đang thực hiện",
		progress: 65,
	},
	{
		title: "Update landing page block",
		workspace: "Task management",
		project: "Task management project",
		due: "Hôm nay, 20:00",
		priority: "Trung bình",
		status: "Chưa bắt đầu",
		progress: 20,
	},
	{
		title: "Review workspace flow",
		workspace: "Design Engineering",
		project: "Dashboard",
		due: "Ngày mai, 09:00",
		priority: "Cao",
		status: "Đang thực hiện",
		progress: 48,
	},
	{
		title: "Refactor page block UI",
		workspace: "Task management",
		project: "Task management project",
		due: "Ngày mai, 15:00",
		priority: "Thấp",
		status: "Chưa bắt đầu",
		progress: 12,
	},
];

const fallbackWorkspaces = [
	{
		id: "task-management",
		name: "Task management",
		slug: "task-management",
		projects: 2,
		openTasks: 12,
	},
	{
		id: "design-engineering",
		name: "Design Engineering",
		slug: "design-engineering",
		projects: 4,
		openTasks: 8,
	},
	{
		id: "sales-marketing",
		name: "Sales & Marketing",
		slug: "sales-marketing",
		projects: 3,
		openTasks: 5,
	},
];

const recentActivities = [
	{
		title: 'Bạn đã hoàn thành task "Setup auth service"',
		time: "10 phút trước",
		tone: "bg-emerald-500",
	},
	{
		title: 'Task "Create landing page" được gán cho bạn',
		time: "35 phút trước",
		tone: "bg-sky-500",
	},
	{
		title: 'Workspace "Task management" có 3 cập nhật mới',
		time: "1 giờ trước",
		tone: "bg-violet-500",
	},
	{
		title: 'Project "Auth" vừa tạo thêm 2 task mới',
		time: "2 giờ trước",
		tone: "bg-amber-500",
	},
];

const focusBlocks = [
	{
		label: "Deep work",
		value: "2h 40m",
		description: "Còn 1 block trống sau 15:00",
		icon: Target,
	},
	{
		label: "Review",
		value: "5 task",
		description: "Ưu tiên các task quá hạn",
		icon: TimerReset,
	},
	{
		label: "Momentum",
		value: "+12%",
		description: "Tốt hơn trung bình tuần trước",
		icon: TrendingUp,
	},
];

const focusPlan = [
	{
		time: "09:30",
		title: "Fix login API",
		description: "Chốt lỗi quá hạn trước standup",
	},
	{
		time: "14:00",
		title: "Review workspace flow",
		description: "Kiểm tra luồng quyền và sidebar",
	},
	{
		time: "16:30",
		title: "Dọn backlog",
		description: "Đóng task đã merge, cập nhật owner",
	},
];

const upcomingDeadlines = [
	{
		title: "Fix login API",
		project: "Auth",
		timeLeft: "Còn 4 giờ",
	},
	{
		title: "Update page block",
		project: "Task management project",
		timeLeft: "Còn 8 giờ",
	},
	{
		title: "Review permission flow",
		project: "Dashboard",
		timeLeft: "Ngày mai",
	},
];

type WorkspacePreview = {
	id: string;
	name: string;
	slug: string;
	projects?: number;
	openTasks?: number;
};

function getPriorityClass(priority: string) {
	switch (priority) {
		case "Cao":
			return "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400";
		case "Trung bình":
			return "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400";
		default:
			return "border-zinc-500/20 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400";
	}
}

function getStatusClass(status: string) {
	switch (status) {
		case "Đang thực hiện":
			return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
		case "Chưa bắt đầu":
			return "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400";
		default:
			return "border-zinc-500/20 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400";
	}
}

function SectionPanel({
	title,
	description,
	action,
	children,
}: {
	title: string;
	description?: string;
	action?: ReactNode;
	children: ReactNode;
}) {
	return (
		<section className='h-full rounded-xl border border-border/70 bg-card p-5 shadow-sm'>
			<div className='mb-5 flex items-start justify-between gap-3'>
				<div className='min-w-0'>
					<h2 className='text-base font-semibold tracking-tight'>
						{title}
					</h2>
					{description ? (
						<p className='mt-1 text-sm text-muted-foreground'>
							{description}
						</p>
					) : null}
				</div>
				{action}
			</div>
			{children}
		</section>
	);
}

export default function DashboardPage() {
	const { user } = useUser();
	const {
		workspaceFindAll: { data: workspaceQuery, isLoading },
	} = useWorkspace();

	const workspaces = useMemo<WorkspacePreview[]>(() => {
		const items = workspaceQuery?.data;

		if (!items?.length) {
			return fallbackWorkspaces;
		}

		return items.slice(0, 3).map((workspace: WorkspacePreview) => ({
			id: workspace.id,
			name: workspace.name,
			slug: workspace.slug,
			projects: workspace.projects ?? 0,
			openTasks: workspace.openTasks ?? 0,
		}));
	}, [workspaceQuery?.data]);

	const primaryWorkspace = workspaces[0];
	const displayName = user?.username || user?.email?.split("@")[0] || "bạn";

	return (
		<main
			className='flex min-h-0 min-w-0 w-full flex-1 flex-col gap-5 overflow-x-hidden overflow-y-auto pb-10 sm:max-w-full'
			style={{ maxWidth: "calc(100dvw - 2rem)" }}
		>
			<section className='min-w-0 rounded-xl border border-border/70 bg-card p-5 shadow-sm'>
				<div className='flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between'>
					<div className='min-w-0 space-y-2'>
						<p className='text-sm font-medium text-muted-foreground'>
							Bảng điều khiển cá nhân
						</p>
						<div className='space-y-1'>
							<h1 className='text-2xl font-semibold tracking-tight md:text-3xl'>
								Chào buổi sáng, {displayName}
							</h1>
							<p className='max-w-2xl text-sm text-muted-foreground'>
								Bạn có 6 việc cần ưu tiên hôm nay. Mình đã gom
								các deadline, workspace gần đây và nhịp làm
								việc vào một màn hình để bạn bắt đầu nhanh hơn.
							</p>
						</div>
					</div>

					<div className='flex flex-wrap items-center gap-2'>
						<div className='rounded-md border border-border/70 px-3 py-2 text-sm text-muted-foreground'>
							Thứ tư, 27/05/2026
						</div>
						<Button asChild variant='outline'>
							<Link href='/dashboard'>
								<ListTodo />
								Xem task
							</Link>
						</Button>
						<Button asChild>
							<Link
								href={
									primaryWorkspace
										? `/dashboard/${primaryWorkspace.slug}`
										: "/dashboard"
								}
							>
								<Plus />
								Mở workspace
							</Link>
						</Button>
					</div>
				</div>
			</section>

			<section className='grid min-w-0 gap-4 xl:grid-cols-12'>
				<div className='rounded-xl border border-border/70 bg-card p-5 shadow-sm xl:col-span-8'>
					<div className='grid gap-5 lg:grid-cols-[1fr_230px]'>
						<div className='space-y-5'>
							<div>
								<h2 className='text-lg font-semibold tracking-tight'>
									Trọng tâm hôm nay
								</h2>
								<p className='mt-1 max-w-2xl text-sm text-muted-foreground'>
									Hoàn thành 2 task quá hạn trước, sau đó dành
									block chiều cho review workspace flow.
								</p>
							</div>

							<div className='grid gap-3 md:grid-cols-3'>
								{focusBlocks.map((item) => {
									const Icon = item.icon;

									return (
										<div
											key={item.label}
											className='rounded-lg border border-border/60 bg-muted/35 p-4'
										>
											<div className='mb-3 flex items-center justify-between gap-3'>
												<Icon className='h-4 w-4 text-muted-foreground' />
												<span className='text-xs font-medium text-muted-foreground'>
													{item.label}
												</span>
											</div>
											<p className='text-xl font-semibold'>
												{item.value}
											</p>
											<p className='mt-1 text-xs leading-5 text-muted-foreground'>
												{item.description}
											</p>
										</div>
									);
								})}
							</div>

							<div className='rounded-lg border border-border/60 bg-muted/30 p-4'>
								<div className='mb-3 flex items-center justify-between gap-3'>
									<div>
										<p className='text-sm font-semibold'>
											Nhịp làm việc đề xuất
										</p>
										<p className='mt-1 text-xs text-muted-foreground'>
											Gom các việc quan trọng vào những
											block dễ bắt đầu nhất.
										</p>
									</div>
									<TimerReset className='h-4 w-4 shrink-0 text-muted-foreground' />
								</div>

								<div className='grid gap-2 md:grid-cols-3'>
									{focusPlan.map((item) => (
										<div
											key={item.time}
											className='rounded-md border border-border/50 bg-background/70 p-3'
										>
											<p className='text-xs font-medium text-muted-foreground'>
												{item.time}
											</p>
											<p className='mt-1 truncate text-sm font-semibold'>
												{item.title}
											</p>
											<p className='mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground'>
												{item.description}
											</p>
										</div>
									))}
								</div>
							</div>
						</div>

						<div className='h-full rounded-lg border border-border/70 bg-background p-4'>
							<div className='flex items-center justify-between'>
								<div>
									<p className='text-sm font-medium text-muted-foreground'>
										Tiến độ ngày
									</p>
									<p className='mt-1 text-3xl font-semibold'>
										72%
									</p>
								</div>
								<div className='flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600'>
									<TrendingUp className='h-6 w-6' />
								</div>
							</div>

							<div className='mt-6 space-y-2'>
								<div className='flex items-center justify-between rounded-md bg-muted/40 px-3 py-2'>
									<span className='text-xs text-muted-foreground'>
										Còn lại
									</span>
									<span className='text-xs font-semibold'>
										7 task
									</span>
								</div>
								<div className='flex items-center justify-between rounded-md bg-muted/40 px-3 py-2'>
									<span className='text-xs text-muted-foreground'>
										Rủi ro
									</span>
									<span className='text-xs font-semibold text-amber-600 dark:text-amber-400'>
										2 quá hạn
									</span>
								</div>
							</div>

							<Progress value={72} className='mt-5 h-2' />
							<p className='mt-3 text-xs leading-5 text-muted-foreground'>
								18/25 task hoàn thành trong mục tiêu tuần này.
							</p>
						</div>
					</div>
				</div>

				<div className='rounded-xl border border-border/70 bg-card p-5 shadow-sm xl:col-span-4'>
					<div className='flex items-center justify-between gap-3'>
						<div>
							<h2 className='text-base font-semibold tracking-tight'>
								Lịch gần nhất
							</h2>
							<p className='mt-1 text-sm text-muted-foreground'>
								Các mốc nên xử lý trước
							</p>
						</div>
						<CalendarClock className='h-5 w-5 text-muted-foreground' />
					</div>

					<div className='mt-5 space-y-3'>
						{upcomingDeadlines.map((item) => (
							<div
								key={item.title}
								className='flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/35 p-3'
							>
								<div className='min-w-0'>
									<p className='truncate text-sm font-medium'>
										{item.title}
									</p>
									<p className='mt-1 truncate text-xs text-muted-foreground'>
										{item.project}
									</p>
								</div>
								<Badge
									variant='outline'
									className='shrink-0 border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
								>
									{item.timeLeft}
								</Badge>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className='grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
				{stats.map((item) => {
					const Icon = item.icon;

					return (
						<div
							key={item.title}
							className='rounded-xl border border-border/70 bg-card p-5 shadow-sm transition hover:border-primary/30'
						>
							<div className='mb-5 flex items-start justify-between gap-3'>
								<div
									className={`rounded-lg border p-2.5 ${item.tone}`}
								>
									<Icon className='h-5 w-5' />
								</div>
								<span className='text-xs font-medium text-muted-foreground'>
									{item.change}
								</span>
							</div>
							<div className='space-y-1'>
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
						</div>
					);
				})}
			</section>

			<section className='grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-12'>
				<div className='xl:col-span-8'>
					<SectionPanel
						title='Ưu tiên hôm nay'
						description='Các task có deadline gần hoặc đang ảnh hưởng đến tiến độ của bạn'
						action={
							<Button variant='ghost' size='sm' asChild>
								<Link href='/dashboard'>
									Xem tất cả
									<ArrowRight className='h-4 w-4' />
								</Link>
							</Button>
						}
					>
						<div className='space-y-3'>
							{todayTasks.map((task) => (
								<div
									key={task.title}
									className='rounded-lg border border-border/60 bg-background p-4 transition hover:border-primary/30 hover:bg-muted/30'
								>
									<div className='grid gap-4 lg:grid-cols-[1fr_150px] lg:items-start'>
										<div className='min-w-0'>
											<div className='flex flex-wrap items-center gap-2'>
												<h3 className='min-w-0 truncate text-sm font-semibold md:text-base'>
													{task.title}
												</h3>
												<Badge
													variant='outline'
													className={getPriorityClass(
														task.priority,
													)}
												>
													{task.priority}
												</Badge>
												<Badge
													variant='outline'
													className={getStatusClass(
														task.status,
													)}
												>
													{task.status}
												</Badge>
											</div>
											<p className='mt-2 truncate text-sm text-muted-foreground'>
												{task.workspace} / {task.project}
											</p>
										</div>

										<div className='text-left lg:text-right'>
											<p className='text-sm font-medium'>
												{task.due}
											</p>
											<p className='mt-1 text-xs text-muted-foreground'>
												{task.progress}% hoàn thành
											</p>
										</div>
									</div>
									<Progress
										value={task.progress}
										className='mt-4 h-1.5 bg-muted'
									/>
								</div>
							))}
						</div>
					</SectionPanel>
				</div>

				<div className='xl:col-span-4'>
					<SectionPanel
						title='Workspace gần đây'
						description={
							isLoading
								? "Đang tải workspace của bạn"
								: "Không gian bạn vừa làm việc"
						}
					>
						<div className='space-y-3'>
							{workspaces.map((workspace) => (
								<Link
									key={workspace.id}
									href={`/dashboard/${workspace.slug}`}
									className='group flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background p-4 transition hover:border-primary/30 hover:bg-muted/30'
								>
									<div className='flex min-w-0 items-center gap-3'>
										<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/45'>
											<FolderKanban className='h-5 w-5 text-muted-foreground' />
										</div>
										<div className='min-w-0'>
											<p className='truncate text-sm font-semibold'>
												{workspace.name}
											</p>
											<p className='mt-1 truncate text-xs text-muted-foreground'>
												{workspace.projects ?? 0} dự án
												/ {workspace.openTasks ?? 0} task
												mở
											</p>
										</div>
									</div>
									<ChevronRight className='h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground' />
								</Link>
							))}
						</div>
					</SectionPanel>
				</div>
			</section>

			<section className='grid min-w-0 gap-4 xl:grid-cols-12'>
				<div className='xl:col-span-8'>
					<SectionPanel
						title='Hoạt động gần đây'
						description='Các thay đổi mới nhất có liên quan trực tiếp đến bạn'
					>
						<div className='space-y-4'>
							{recentActivities.map((activityItem, index) => (
								<div
									key={activityItem.title}
									className='flex gap-3'
								>
									<div className='flex flex-col items-center'>
										<div
											className={`mt-1 h-2.5 w-2.5 rounded-full ${activityItem.tone}`}
										/>
										{index !==
										recentActivities.length - 1 ? (
											<div className='mt-2 h-full w-px bg-border' />
										) : null}
									</div>
									<div className='min-w-0 pb-4'>
										<p className='text-sm font-medium leading-6'>
											{activityItem.title}
										</p>
										<p className='text-xs text-muted-foreground'>
											{activityItem.time}
										</p>
									</div>
								</div>
							))}
						</div>
					</SectionPanel>
				</div>

				<div className='xl:col-span-4'>
					<SectionPanel
						title='Gợi ý hành động'
						description='Những việc nhỏ giúp bảng của bạn gọn hơn'
					>
						<div className='space-y-3'>
							{[
								"Chốt owner cho 5 task chưa assign.",
								"Dời deadline các task review sang sprint hiện tại.",
								"Đóng 2 task đã merge để giảm nhiễu backlog.",
							].map((item) => (
								<div
									key={item}
									className='flex items-start gap-3 rounded-lg border border-border/60 bg-background p-3'
								>
									<Activity className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' />
									<p className='text-sm leading-6'>{item}</p>
								</div>
							))}
						</div>
					</SectionPanel>
				</div>
			</section>
		</main>
	);
}
