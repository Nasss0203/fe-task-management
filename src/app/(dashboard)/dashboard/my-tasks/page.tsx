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
		<main className='flex min-h-0 min-w-0 flex-1 flex-col gap-8 overflow-y-auto pb-10'>
			<Skeleton className='h-12 w-64 rounded-xl border border-neutral-800 bg-neutral-900/40' />
			<Skeleton className='h-48 w-full rounded-2xl border border-neutral-800 bg-neutral-900/40' />
			<Skeleton className='h-[600px] w-full rounded-2xl border border-neutral-800 bg-neutral-900/40' />
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
		<div className='group flex h-full flex-col min-w-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/40 transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-900/60 shadow-sm'>
			<div className='flex h-full'>
				<div className='w-1.5 shrink-0 bg-blue-500/80 transition-colors group-hover:bg-blue-400' />
				<div className='flex flex-1 flex-col min-w-0 p-4'>
					<div className='flex items-start gap-3'>
						<div className='flex size-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400 shadow-sm'>
							<FolderKanban className='size-4' />
						</div>
						<div className='min-w-0 flex-1 mt-0.5'>
							<p className='truncate text-sm font-semibold text-neutral-100'>
								{workspace.name}
							</p>
							<p className='mt-0.5 truncate text-xs text-neutral-500'>
								Team workspace
							</p>
						</div>
					</div>

					<div className='mt-4 flex-1 space-y-2'>
						<p className='text-[10px] font-semibold uppercase tracking-wide text-neutral-500'>
							Quick links
						</p>
						<div className='flex flex-col gap-1.5'>
							<div className='flex items-center justify-between gap-2 rounded-md p-1 transition-colors hover:bg-neutral-800/50 -mx-1 px-1.5'>
								<Link
									href='/dashboard/my-tasks'
									className='truncate text-xs font-medium text-neutral-300 hover:text-neutral-100 transition-colors flex-1'
								>
									My open work items
								</Link>
								<Badge className='h-5 min-w-[20px] justify-center rounded-md border-neutral-700 bg-neutral-800 px-1.5 text-[11px] font-semibold text-neutral-300 hover:bg-neutral-700'>
									{openWorkCount}
								</Badge>
							</div>
							<div className='flex items-center justify-between gap-2 rounded-md p-1 transition-colors hover:bg-neutral-800/50 -mx-1 px-1.5'>
								<Link
									href='/dashboard/my-tasks'
									className='truncate text-xs font-medium text-neutral-300 hover:text-neutral-100 transition-colors flex-1'
								>
									Done work items
								</Link>
								<Badge
									variant='secondary'
									className='h-5 min-w-[20px] justify-center rounded-md border-neutral-800 bg-neutral-900 px-1.5 text-[11px] font-semibold text-neutral-500 hover:bg-neutral-800'
								>
									{doneCount}
								</Badge>
							</div>
						</div>
					</div>

					<div className='mt-4 flex items-center gap-1.5 border-t border-neutral-800/60 pt-3 text-xs font-medium text-neutral-500'>
						<span>{workspace.projectCount || 1} {workspace.projectCount === 1 ? 'project' : 'projects'}</span>
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
		<div className='group grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-neutral-900/40 -mx-3'>
			<div className='flex size-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 transition-colors group-hover:bg-neutral-800 group-hover:text-neutral-200'>
				<ClipboardList className='size-4' />
			</div>

			<div className='min-w-0'>
				<p className='truncate text-[14px] font-semibold text-neutral-200 group-hover:text-neutral-100 transition-colors'>{task.title}</p>
				<div className='mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-neutral-500'>
					<span className="uppercase tracking-wider">{formatTaskKey(task, index)}</span>
					<span className="text-neutral-700">•</span>
					<span className='truncate'>{task.projectName}</span>
					<span className="text-neutral-700">•</span>
					<span className='truncate'>{task.workspaceName}</span>
				</div>
			</div>

			<div className='flex min-w-[120px] items-center justify-end gap-4'>
				<span className={cn("hidden sm:inline text-[12px] font-medium", getTaskStateClass(task))}>
					{getTaskStateLabel(task)}
				</span>
				<div className='flex size-8 shrink-0 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-[10px] font-bold tracking-wider text-neutral-300 shadow-sm'>
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
			className='group grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-neutral-900/40 -mx-3'
		>
			<div className='flex size-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-blue-500/80 transition-colors group-hover:bg-neutral-800 group-hover:text-blue-400'>
				<BriefcaseBusiness className='size-4' />
			</div>
			<div className='min-w-0'>
				<p className='truncate text-[14px] font-semibold text-neutral-200 group-hover:text-neutral-100 transition-colors'>{workspace.name}</p>
				<p className='mt-1.5 text-[11px] font-medium text-neutral-500'>
					{workspace.projectCount} {workspace.projectCount === 1 ? 'project' : 'projects'} <span className="text-neutral-700 mx-1">•</span> {workspace.openTaskCount} open
					tasks
				</p>
			</div>
			<span className='text-[12px] font-semibold text-blue-400 opacity-0 transition-all group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0'>
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
				<div className='rounded-2xl border border-neutral-800 bg-neutral-950/20 p-8'>
					<h1 className='text-xl font-bold tracking-tight text-neutral-100'>
						Failed to load tasks
					</h1>
					<p className='mt-2 text-sm text-neutral-500'>
						Please refresh the page to try again.
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
		<main className='flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto pb-10 px-2'>
			<div className='flex w-full min-w-0 flex-col gap-10 max-w-7xl'>
				<header className='border-b border-neutral-800/60 pb-6 pt-4'>
					<h1 className='text-3xl font-bold tracking-tight text-neutral-100'>
						For you
					</h1>
					<p className='mt-2 text-[14px] text-neutral-500'>
						A quick overview of your active tasks and recent workspaces.
					</p>
				</header>

				<section className='space-y-5'>
					<div className='flex items-center justify-between gap-4 px-1'>
						<h2 className='text-[15px] font-semibold text-neutral-200'>Recent spaces</h2>
						<Link
							href='/dashboard'
							className='text-[13px] font-semibold text-neutral-400 hover:text-neutral-100 transition-colors'
						>
							View all spaces
						</Link>
					</div>

					{recentSpaces.length ? (
						<div className='grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]'>
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
						<div className='rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/20 p-8 text-center text-[13px] font-medium text-neutral-500'>
							No recent workspaces found.
						</div>
					)}
				</section>

				<section className='min-w-0'>
					<Tabs defaultValue='worked' className='w-full gap-0'>
						<TabsList
							variant='line'
							className='h-auto w-full justify-start gap-6 border-b border-neutral-800/60 p-0'
						>
							{viewItems.map((item) => {
								const Icon = item.icon;

								return (
									<TabsTrigger
										key={item.key}
										value={item.key}
										className='h-12 flex-none gap-2 rounded-none px-1 text-[14px] font-medium text-neutral-400 hover:text-neutral-200 data-[state=active]:text-neutral-100 data-[state=active]:font-semibold data-[state=active]:shadow-none transition-colors after:bg-neutral-100 data-[state=active]:[&_.tab-count]:bg-neutral-800 data-[state=active]:[&_.tab-count]:text-neutral-200'
									>
										<Icon className='size-4' />
										<span>{item.label}</span>
										{typeof item.count === "number" ? (
											<span className='tab-count rounded-md bg-neutral-900/60 border border-neutral-800/60 px-2 py-0.5 text-[11px] font-bold text-neutral-500 transition-colors'>
												{item.count}
											</span>
										) : null}
									</TabsTrigger>
								);
							})}
						</TabsList>

						<div className='pt-6'>
							<p className='mb-4 px-1 text-[11px] font-bold uppercase tracking-wider text-neutral-500'>
								In the last month
							</p>

							<TabsContent value='worked' className='mt-0'>
								<div className='flex flex-col gap-1'>
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
										<div className='rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/20 p-8 text-center text-[13px] font-medium text-neutral-500 mt-2'>
											No matching work items found.
										</div>
									)}
								</div>
							</TabsContent>

							<TabsContent value='viewed' className='mt-0'>
								<div className='flex flex-col gap-1'>
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
										<div className='rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/20 p-8 text-center text-[13px] font-medium text-neutral-500 mt-2'>
											No viewed work items found.
										</div>
									)}
								</div>
							</TabsContent>

							<TabsContent value='assigned' className='mt-0'>
								<div className='flex flex-col gap-1'>
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
										<div className='rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/20 p-8 text-center text-[13px] font-medium text-neutral-500 mt-2'>
											No assigned work items found.
										</div>
									)}
								</div>
							</TabsContent>

							<TabsContent value='starred' className='mt-0'>
								<div className='rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/20 p-8 text-center text-[13px] font-medium text-neutral-500 mt-2'>
									No starred work items found.
								</div>
							</TabsContent>

							<TabsContent value='boards' className='mt-0'>
								<div className='flex flex-col gap-1'>
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
