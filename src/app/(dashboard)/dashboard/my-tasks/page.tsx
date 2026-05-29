"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { cn } from "@/lib/utils";
import type {
	DashboardTaskResponseDto,
	DashboardWorkspaceResponseDto,
} from "@/services/dashboard/type";
import {
	BriefcaseBusiness,
	ChevronDown,
	ClipboardList,
	Eye,
	FolderKanban,
	ListTodo,
	Star,
	UserRound,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

type ViewKey = "worked" | "viewed" | "assigned" | "starred" | "boards";

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

const getDateOnly = (value?: string | null) => {
	if (!value) return null;

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return null;

	date.setHours(0, 0, 0, 0);
	return date;
};

const formatTaskKey = (task: DashboardTaskResponseDto, index: number) => {
	const prefix = task.projectName
		.split(/\s+/)
		.filter(Boolean)
		.map((word) => word[0])
		.join("")
		.slice(0, 3)
		.toUpperCase();

	return `${prefix || "TASK"}-${index + 1}`;
};

const getTaskStateLabel = (task: DashboardTaskResponseDto) => {
	const dueDate = getDateOnly(task.dueAt);
	if (!dueDate) return "No due date";

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	if (dueDate < today) return "Overdue";
	if (dueDate.getTime() === today.getTime()) return "Due today";

	return "Created";
};

const getTaskStateClass = (task: DashboardTaskResponseDto) => {
	const label = getTaskStateLabel(task);

	if (label === "Overdue") return "text-red-400";
	if (label === "Due today") return "text-blue-300";

	return "text-muted-foreground";
};

const getInitials = (name?: string | null) => {
	if (!name) return "ME";

	const words = name.trim().split(/\s+/).filter(Boolean);
	if (!words.length) return "ME";

	return words
		.slice(0, 2)
		.map((word) => word[0])
		.join("")
		.toUpperCase();
};

function uniqueTasks(tasks: DashboardTaskResponseDto[]) {
	const seen = new Set<string>();

	return tasks.filter((task) => {
		if (seen.has(task.id)) return false;
		seen.add(task.id);
		return true;
	});
}

function LoadingForYou() {
	return (
		<main className='flex min-h-0 min-w-0 flex-1 flex-col gap-7 overflow-y-auto pb-10'>
			<Skeleton className='h-10 w-48 rounded-lg' />
			<Skeleton className='h-40 w-64 rounded-lg' />
			<Skeleton className='h-[520px] rounded-lg' />
		</main>
	);
}

function RecentSpaceCard({
	workspace,
	openWorkCount,
	doneCount,
}: {
	workspace: DashboardWorkspaceResponseDto;
	openWorkCount: number;
	doneCount: number;
}) {
	return (
		<div className='min-w-0 overflow-hidden rounded-md border border-border/70 bg-muted/35'>
			<div className='flex'>
				<div className='w-5 shrink-0 bg-violet-700' />
				<div className='min-w-0 flex-1 p-4'>
					<div className='flex items-start gap-3'>
						<div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm'>
							<FolderKanban className='h-5 w-5' />
						</div>
						<div className='min-w-0'>
							<p className='truncate text-sm font-semibold'>
								{workspace.name}
							</p>
							<p className='truncate text-xs text-muted-foreground'>
								Team-managed software
							</p>
						</div>
					</div>

					<div className='mt-4 space-y-2 pl-12'>
						<p className='text-xs font-medium text-muted-foreground'>
							Quick links
						</p>
						<div className='flex items-center justify-between gap-3'>
							<Link
								href='/dashboard/my-tasks'
								className='truncate text-xs font-medium underline underline-offset-2 hover:text-primary'
							>
								My open work items
							</Link>
							<Badge className='h-5 rounded-sm px-2 text-xs'>
								{openWorkCount}
							</Badge>
						</div>
						<div className='flex items-center justify-between gap-3'>
							<Link
								href='/dashboard/my-tasks'
								className='truncate text-xs font-medium underline underline-offset-2 hover:text-primary'
							>
								Done work items
							</Link>
							<Badge
								variant='secondary'
								className='h-5 rounded-sm px-2 text-xs'
							>
								{doneCount}
							</Badge>
						</div>
					</div>

					<div className='mt-4 flex items-center gap-1 border-t border-border/70 pt-3 text-xs text-muted-foreground'>
						<span>{workspace.projectCount || 1} board</span>
						<ChevronDown className='h-3.5 w-3.5' />
					</div>
				</div>
			</div>
		</div>
	);
}

function WorkItemRow({
	task,
	index,
	displayName,
}: {
	task: DashboardTaskResponseDto;
	index: number;
	displayName?: string;
}) {
	return (
		<div className='group grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 rounded-md py-2.5 transition hover:bg-muted/35'>
			<div className='flex size-7 items-center justify-center rounded-md bg-muted text-lime-500'>
				<ClipboardList className='h-4 w-4' />
			</div>

			<div className='min-w-0'>
				<p className='truncate text-sm font-medium'>{task.title}</p>
				<div className='mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground'>
					<span>{formatTaskKey(task, index)}</span>
					<span>·</span>
					<span className='truncate'>{task.projectName}</span>
					<span>·</span>
					<span className='truncate'>{task.workspaceName}</span>
				</div>
			</div>

			<div className='flex min-w-[120px] items-center justify-end gap-3 text-xs'>
				<span className={cn("hidden sm:inline", getTaskStateClass(task))}>
					{getTaskStateLabel(task)}
				</span>
				<div className='flex size-8 items-center justify-center rounded-full bg-violet-700 text-xs font-semibold text-white'>
					{getInitials(displayName)}
				</div>
			</div>
		</div>
	);
}

function BoardRow({ workspace }: { workspace: DashboardWorkspaceResponseDto }) {
	return (
		<Link
			href={`/dashboard/${workspace.slug}`}
			className='group grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 rounded-md py-2.5 transition hover:bg-muted/35'
		>
			<div className='flex size-7 items-center justify-center rounded-md bg-muted text-blue-400'>
				<BriefcaseBusiness className='h-4 w-4' />
			</div>
			<div className='min-w-0'>
				<p className='truncate text-sm font-medium'>{workspace.name}</p>
				<p className='mt-1 text-xs text-muted-foreground'>
					{workspace.projectCount} project · {workspace.openTaskCount} open
					tasks
				</p>
			</div>
			<span className='text-xs text-primary opacity-0 transition group-hover:opacity-100'>
				Open
			</span>
		</Link>
	);
}

export default function MyTasksPage() {
	const query = useMemo(
		() => ({
			date: toLocalDateInputValue(),
			timezone: getClientTimezone(),
			limit: 20,
		}),
		[],
	);
	const {
		myDashboard: { data: dashboardQuery, isLoading, isError },
	} = useDashboard(query);

	const dashboard = dashboardQuery?.data;
	const tasks = useMemo(() => {
		if (!dashboard) return [];

		return uniqueTasks([
			...dashboard.priorityTasks,
			...dashboard.recentDeadlines,
		]);
	}, [dashboard]);

	if (isLoading) return <LoadingForYou />;

	if (isError || !dashboard) {
		return (
			<main className='flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto pb-10'>
				<div className='rounded-lg border border-border/70 bg-card/80 p-6'>
					<h1 className='text-xl font-semibold'>
						Không tải được công việc
					</h1>
					<p className='mt-2 text-sm text-muted-foreground'>
						Vui lòng thử lại để lấy dữ liệu mới nhất.
					</p>
				</div>
			</main>
		);
	}

	const recentSpaces = dashboard.recentWorkspaces.slice(0, 5);
	const getWorkspaceDoneCount = (workspaceId: string) => {
		return tasks.filter((task) => {
			const status = (task.statusName ?? "").toLowerCase();

			return (
				task.workspaceId === workspaceId &&
				(status.includes("done") || status.includes("complete"))
			);
		}).length;
	};
	const viewItems: {
		key: ViewKey;
		label: string;
		count?: number;
		icon: typeof ListTodo;
	}[] = [
		{
			key: "worked",
			label: "Worked on",
			count: tasks.length,
			icon: ListTodo,
		},
		{
			key: "viewed",
			label: "Viewed",
			count: dashboard.recentDeadlines.length,
			icon: Eye,
		},
		{
			key: "assigned",
			label: "Assigned to me",
			count: tasks.length,
			icon: UserRound,
		},
		{
			key: "starred",
			label: "Starred",
			count: 0,
			icon: Star,
		},
		{
			key: "boards",
			label: "Boards",
			count: dashboard.recentWorkspaces.length,
			icon: BriefcaseBusiness,
		},
	];

	return (
		<main className='flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto pb-10'>
			<div className='flex w-full min-w-0 flex-col gap-7'>
				<header className='border-b border-border/70 pb-5'>
					<h1 className='text-2xl font-semibold tracking-normal'>
						For you
					</h1>
				</header>

				<section className='space-y-4'>
					<div className='flex items-center justify-between gap-4'>
						<h2 className='text-sm font-semibold'>Recent spaces</h2>
						<Link
							href='/dashboard'
							className='text-sm font-medium text-primary hover:underline'
						>
							View all spaces
						</Link>
					</div>

					{recentSpaces.length ? (
						<div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5'>
							{recentSpaces.map((workspace) => (
								<RecentSpaceCard
									key={workspace.id}
									workspace={workspace}
									openWorkCount={workspace.openTaskCount}
									doneCount={getWorkspaceDoneCount(
										workspace.id,
									)}
								/>
							))}
						</div>
					) : (
						<div className='rounded-md border border-dashed border-border/70 p-5 text-sm text-muted-foreground'>
							Chưa có workspace gần đây.
						</div>
					)}
				</section>

				<section className='min-w-0'>
					<Tabs defaultValue='worked' className='w-full gap-0'>
						<TabsList
							variant='line'
							className='h-auto w-full justify-start gap-4 border-b border-border/70 p-0'
						>
							{viewItems.map((item) => {
								const Icon = item.icon;

								return (
									<TabsTrigger
										key={item.key}
										value={item.key}
										className='h-10 flex-none gap-2 rounded-none px-0 text-sm data-[state=active]:text-primary after:bg-primary data-[state=active]:[&_.tab-count]:bg-primary data-[state=active]:[&_.tab-count]:text-primary-foreground'
									>
										<Icon className='h-4 w-4' />
										<span>{item.label}</span>
										{typeof item.count === "number" ? (
											<span className='tab-count rounded-sm bg-muted px-1.5 py-0.5 text-xs text-muted-foreground'>
												{item.count}
											</span>
										) : null}
									</TabsTrigger>
								);
							})}
						</TabsList>

						<div className='pt-4'>
							<p className='mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
								In the last month
							</p>

							<TabsContent value='worked' className='mt-0'>
								<div className='divide-y divide-border/60'>
									{tasks.length ? (
										tasks.map((task, index) => (
											<WorkItemRow
												key={task.id}
												task={task}
												index={index}
												displayName={
													dashboard.greeting
														.displayName
												}
											/>
										))
									) : (
										<div className='rounded-md border border-dashed border-border/70 p-8 text-sm text-muted-foreground'>
											Chưa có work item phù hợp.
										</div>
									)}
								</div>
							</TabsContent>

							<TabsContent value='viewed' className='mt-0'>
								<div className='divide-y divide-border/60'>
									{dashboard.recentDeadlines.length ? (
										dashboard.recentDeadlines.map(
											(task, index) => (
												<WorkItemRow
													key={task.id}
													task={task}
													index={index}
													displayName={
														dashboard.greeting
															.displayName
													}
												/>
											),
										)
									) : (
										<div className='rounded-md border border-dashed border-border/70 p-8 text-sm text-muted-foreground'>
											Chưa có work item đã xem.
										</div>
									)}
								</div>
							</TabsContent>

							<TabsContent value='assigned' className='mt-0'>
								<div className='divide-y divide-border/60'>
									{tasks.length ? (
										tasks.map((task, index) => (
											<WorkItemRow
												key={task.id}
												task={task}
												index={index}
												displayName={
													dashboard.greeting
														.displayName
												}
											/>
										))
									) : (
										<div className='rounded-md border border-dashed border-border/70 p-8 text-sm text-muted-foreground'>
											Chưa có work item được assign.
										</div>
									)}
								</div>
							</TabsContent>

							<TabsContent value='starred' className='mt-0'>
								<div className='rounded-md border border-dashed border-border/70 p-8 text-sm text-muted-foreground'>
									Chưa có work item nào được starred.
								</div>
							</TabsContent>

							<TabsContent value='boards' className='mt-0'>
								<div className='divide-y divide-border/60'>
									{dashboard.recentWorkspaces.map(
										(workspace) => (
											<BoardRow
												key={workspace.id}
												workspace={workspace}
											/>
										),
									)}
								</div>
							</TabsContent>
						</div>
					</Tabs>
				</section>
			</div>
		</main>
	);
}
