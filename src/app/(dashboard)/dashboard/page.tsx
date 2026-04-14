import {
	Activity,
	AlertTriangle,
	ArrowUpRight,
	CalendarClock,
	CheckCircle2,
	Clock3,
	FolderKanban,
	ListTodo,
	Plus,
} from "lucide-react";

const stats = [
	{
		title: "Việc của tôi",
		value: "24",
		description: "Tổng số task đang theo dõi",
		icon: ListTodo,
	},
	{
		title: "Sắp đến hạn",
		value: "6",
		description: "Trong 3 ngày tới",
		icon: Clock3,
	},
	{
		title: "Quá hạn",
		value: "2",
		description: "Cần xử lý sớm",
		icon: AlertTriangle,
	},
	{
		title: "Hoàn thành tuần này",
		value: "18",
		description: "Hiệu suất cá nhân",
		icon: CheckCircle2,
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
	},
	{
		title: "Update landing page block",
		workspace: "Task management",
		project: "Task management project",
		due: "Hôm nay, 20:00",
		priority: "Trung bình",
		status: "Chưa bắt đầu",
	},
	{
		title: "Review workspace flow",
		workspace: "Design Engineering",
		project: "Dashboard",
		due: "Ngày mai, 09:00",
		priority: "Cao",
		status: "Đang thực hiện",
	},
	{
		title: "Refactor page block UI",
		workspace: "Task management",
		project: "Task management project",
		due: "Ngày mai, 15:00",
		priority: "Thấp",
		status: "Chưa bắt đầu",
	},
];

const recentWorkspaces = [
	{
		name: "Task management",
		projects: 2,
		openTasks: 12,
	},
	{
		name: "Design Engineering",
		projects: 4,
		openTasks: 8,
	},
	{
		name: "Sales & Marketing",
		projects: 3,
		openTasks: 5,
	},
];

const recentActivities = [
	{
		title: 'Bạn đã hoàn thành task "Setup auth service"',
		time: "10 phút trước",
	},
	{
		title: 'Task "Create landing page" được gán cho bạn',
		time: "35 phút trước",
	},
	{
		title: 'Workspace "Task management" có 3 cập nhật mới',
		time: "1 giờ trước",
	},
	{
		title: 'Project "Auth" vừa tạo thêm 2 task mới',
		time: "2 giờ trước",
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
	{
		title: "UI polish sidebar",
		project: "Design Engineering",
		timeLeft: "2 ngày nữa",
	},
];

function getPriorityClass(priority: string) {
	switch (priority) {
		case "Cao":
			return "bg-red-500/15 text-red-400 border-red-500/20";
		case "Trung bình":
			return "bg-blue-500/15 text-blue-400 border-blue-500/20";
		default:
			return "bg-zinc-500/15 text-zinc-400 border-zinc-500/20";
	}
}

function getStatusClass(status: string) {
	switch (status) {
		case "Đang thực hiện":
			return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
		case "Chưa bắt đầu":
			return "bg-amber-500/15 text-amber-400 border-amber-500/20";
		default:
			return "bg-zinc-500/15 text-zinc-400 border-zinc-500/20";
	}
}

function SectionCard({
	title,
	description,
	children,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
}) {
	return (
		<section className='rounded-2xl border border-border/60 bg-background/60 p-5 shadow-sm h-full'>
			<div className='mb-4 flex items-start justify-between gap-3'>
				<div>
					<h2 className='text-lg font-semibold'>{title}</h2>
					{description ? (
						<p className='mt-1 text-sm text-muted-foreground'>
							{description}
						</p>
					) : null}
				</div>
			</div>
			{children}
		</section>
	);
}

export default function Home() {
	return (
		<main className='flex flex-1 flex-col gap-6'>
			<section className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
				<div>
					<h1 className='text-3xl font-semibold tracking-tight'>
						Trang chủ
					</h1>
					<p className='mt-1 text-sm text-muted-foreground'>
						Tổng quan công việc của bạn hôm nay
					</p>
				</div>

				<div className='flex flex-wrap items-center gap-2'>
					<div className='flex items-center rounded-xl border border-border/60 bg-background/60 p-1'>
						<button className='rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground'>
							Hôm nay
						</button>
						<button className='rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground'>
							7 ngày
						</button>
						<button className='rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground'>
							30 ngày
						</button>
					</div>

					<button className='inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background px-4 py-2 text-sm font-medium transition hover:bg-accent hover:text-accent-foreground'>
						<Plus className='h-4 w-4' />
						Tạo mới
					</button>
				</div>
			</section>

			<section className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				{stats.map((item) => {
					const Icon = item.icon;
					return (
						<div
							key={item.title}
							className='rounded-2xl border border-border/60 bg-background/60 p-5 shadow-sm'
						>
							<div className='mb-4 flex items-center justify-between'>
								<div className='rounded-xl border border-border/60 bg-accent/40 p-2'>
									<Icon className='h-5 w-5 text-muted-foreground' />
								</div>
								<ArrowUpRight className='h-4 w-4 text-muted-foreground' />
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

			<section className='grid grid-cols-1 gap-4 lg:grid-cols-12'>
				<div className='lg:col-span-8'>
					<SectionCard
						title='Công việc hôm nay'
						description='Các task cần ưu tiên xử lý trong ngày'
					>
						<div className='space-y-3'>
							{todayTasks.map((task) => (
								<div
									key={task.title}
									className='rounded-xl border border-border/60 bg-accent/20 p-4 transition hover:bg-accent/40'
								>
									<div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
										<div className='min-w-0 flex-1'>
											<h3 className='truncate text-base font-medium'>
												{task.title}
											</h3>
											<p className='mt-1 text-sm text-muted-foreground'>
												{task.workspace} /{" "}
												{task.project}
											</p>
										</div>

										<div className='text-sm text-muted-foreground md:text-right'>
											<p>{task.due}</p>
										</div>
									</div>

									<div className='mt-4 flex flex-wrap items-center gap-2'>
										<span
											className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getPriorityClass(
												task.priority,
											)}`}
										>
											Ưu tiên: {task.priority}
										</span>
										<span
											className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
												task.status,
											)}`}
										>
											{task.status}
										</span>
									</div>
								</div>
							))}
						</div>
					</SectionCard>
				</div>

				<div className='lg:col-span-4'>
					<SectionCard
						title='Workspace gần đây'
						description='Các workspace bạn truy cập gần nhất'
					>
						<div className='space-y-3'>
							{recentWorkspaces.map((workspace) => (
								<div
									key={workspace.name}
									className='flex items-center justify-between rounded-xl border border-border/60 bg-accent/20 p-4 transition hover:bg-accent/40'
								>
									<div className='min-w-0 flex-1'>
										<div className='flex items-center gap-2'>
											<FolderKanban className='h-4 w-4 text-muted-foreground' />
											<p className='truncate font-medium'>
												{workspace.name}
											</p>
										</div>
										<p className='mt-1 text-sm text-muted-foreground'>
											{workspace.projects} projects ·{" "}
											{workspace.openTasks} open tasks
										</p>
									</div>
									<ArrowUpRight className='h-4 w-4 text-muted-foreground' />
								</div>
							))}
						</div>
					</SectionCard>
				</div>
			</section>

			<section className='grid gap-4 lg:grid-cols-12'>
				<div className='lg:col-span-8'>
					<SectionCard
						title='Hoạt động gần đây'
						description='Các thay đổi và cập nhật mới nhất liên quan đến bạn'
					>
						<div className='space-y-4'>
							{recentActivities.map((activity, index) => (
								<div
									key={activity.title}
									className='flex gap-3'
								>
									<div className='flex flex-col items-center'>
										<div className='flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-accent/30'>
											<Activity className='h-4 w-4 text-muted-foreground' />
										</div>
										{index !==
										recentActivities.length - 1 ? (
											<div className='mt-2 h-full w-px bg-border/70' />
										) : null}
									</div>

									<div className='pb-4'>
										<p className='text-sm font-medium leading-6'>
											{activity.title}
										</p>
										<p className='text-xs text-muted-foreground'>
											{activity.time}
										</p>
									</div>
								</div>
							))}
						</div>
					</SectionCard>
				</div>

				<div className='lg:col-span-4'>
					<SectionCard
						title='Deadline gần nhất'
						description='Các task sắp tới hạn cần chú ý'
					>
						<div className='space-y-3'>
							{upcomingDeadlines.map((item) => (
								<div
									key={item.title}
									className='rounded-xl border border-border/60 bg-accent/20 p-4 transition hover:bg-accent/40'
								>
									<div className='flex items-start justify-between gap-3'>
										<div className='min-w-0 flex-1'>
											<p className='truncate font-medium'>
												{item.title}
											</p>
											<p className='mt-1 text-sm text-muted-foreground'>
												{item.project}
											</p>
										</div>

										<div className='flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400'>
											<CalendarClock className='h-3.5 w-3.5' />
											{item.timeLeft}
										</div>
									</div>
								</div>
							))}
						</div>
					</SectionCard>
				</div>
			</section>
		</main>
	);
}
