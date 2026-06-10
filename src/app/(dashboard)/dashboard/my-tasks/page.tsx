"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { cn } from "@/lib/utils";
import type { DashboardTaskResponseDto, DashboardWorkspaceResponseDto } from "@/services/dashboard/type";
import { BriefcaseBusiness, ChevronDown, Eye, ListTodo, Star, UserRound } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DrawerItemView } from "@/components/drawer/DrawerItemView";
import type { TaskItem } from "@/services/task/type";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingForYou } from "@/features/dashboard/components/for-you/LoadingForYou";
import { RecentSpaceCard } from "@/features/dashboard/components/for-you/RecentSpaceCard";
import { WorkItemRow } from "@/features/dashboard/components/for-you/WorkItemRow";
import { toLocalDateInputValue, getClientTimezone } from "@/features/dashboard/utils/date";

type ViewKey = "worked" | "viewed" | "assigned" | "starred" | "boards";

function uniqueTasks(tasks: DashboardTaskResponseDto[]) {
	const seen = new Set<string>();

	return tasks.filter((task) => {
		if (seen.has(task.id)) return false;
		seen.add(task.id);
		return true;
	});
}



const mapDashboardTaskToTaskItem = (task: DashboardTaskResponseDto): TaskItem => {
	return {
		id: task.id,
		workspaceId: task.workspaceId,
		projectId: task.projectId,
		sprintId: null,
		sprintName: null,
		projectSeq: null,
		title: task.title,
		description: null,
		statusId: task.statusName || "",
		statusName: task.statusName,
		priorityId: task.priorityLevel ? String(task.priorityLevel) : null,
		priorityName: task.priorityName,
		createdBy: "",
		assignees: [],
		startAt: task.startAt,
		dueAt: task.dueAt,
		completedAt: null,
		estimateMinutes: task.estimateMinutes,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};
};


function BoardRow({ workspace }: { workspace: DashboardWorkspaceResponseDto }) {
	return (
		<Link
			href={`/dashboard/${workspace.slug}`}
			className='group grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-muted/50 -mx-3'
		>
			<div className='flex size-9 items-center justify-center rounded-lg border border-border bg-muted/30 text-blue-600 dark:text-blue-400 transition-colors group-hover:bg-muted group-hover:text-blue-500'>
				<BriefcaseBusiness className='size-4' />
			</div>
			<div className='min-w-0'>
				<p className='truncate text-[14px] font-semibold text-foreground group-hover:text-primary transition-colors'>{workspace.name}</p>
				<p className='mt-1.5 text-[11px] font-medium text-muted-foreground'>
					{workspace.projectCount} {workspace.projectCount === 1 ? 'project' : 'projects'} <span className="text-muted-foreground/50 mx-1">•</span> {workspace.openTaskCount} open
					tasks
				</p>
			</div>
			<span className='text-[12px] font-semibold text-blue-600 dark:text-blue-400 opacity-0 transition-all group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0'>
				Open
			</span>
		</Link>
	);
}

export default function MyTasksPage() {
	const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

	const handleTaskClick = (task: DashboardTaskResponseDto) => {
		setSelectedTask(mapDashboardTaskToTaskItem(task));
	};

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
				<div className='rounded-2xl border border-border bg-muted/20 p-8'>
					<h1 className='text-xl font-bold tracking-tight text-foreground'>
						Failed to load tasks
					</h1>
					<p className='mt-2 text-sm text-muted-foreground'>
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
				<header className='border-b border-border/60 pb-6 pt-4'>
					<h1 className='text-3xl font-bold tracking-tight text-foreground'>
						For you
					</h1>
					<p className='mt-2 text-[14px] text-muted-foreground'>
						A quick overview of your active tasks and recent workspaces.
					</p>
				</header>

				<section className='space-y-5'>
					<div className='flex items-center justify-between gap-4 px-1'>
						<h2 className='text-[15px] font-semibold text-foreground'>Recent spaces</h2>
						<Link
							href='/dashboard'
							className='text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors'
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
						<div className='rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center text-[13px] font-medium text-muted-foreground'>
							No recent workspaces found.
						</div>
					)}
				</section>

				<section className='min-w-0'>
					<Tabs defaultValue='worked' className='w-full gap-0'>
						<TabsList
							variant='line'
							className='h-auto w-full justify-start gap-6 border-b border-border/60 p-0'
						>
							{viewItems.map((item) => {
								const Icon = item.icon;

								return (
									<TabsTrigger
										key={item.key}
										value={item.key}
										className='h-12 flex-none gap-2 rounded-none px-1 text-[14px] font-medium text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:shadow-none transition-colors after:bg-foreground data-[state=active]:[&_.tab-count]:bg-muted data-[state=active]:[&_.tab-count]:text-foreground'
									>
										<Icon className='size-4' />
										<span>{item.label}</span>
										{typeof item.count === "number" ? (
											<span className='tab-count rounded-md bg-muted/60 border border-border/60 px-2 py-0.5 text-[11px] font-bold text-muted-foreground transition-colors'>
												{item.count}
											</span>
										) : null}
									</TabsTrigger>
								);
							})}
						</TabsList>

						<div className='pt-6'>
							<p className='mb-4 px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
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
												onClick={handleTaskClick}
											/>
										))
									) : (
										<div className='rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center text-[13px] font-medium text-muted-foreground mt-2'>
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
													onClick={handleTaskClick}
												/>
											),
										)
									) : (
										<div className='rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center text-[13px] font-medium text-muted-foreground mt-2'>
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
												onClick={handleTaskClick}
											/>
										))
									) : (
										<div className='rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center text-[13px] font-medium text-muted-foreground mt-2'>
											No assigned work items found.
										</div>
									)}
								</div>
							</TabsContent>

							<TabsContent value='starred' className='mt-0'>
								<div className='rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center text-[13px] font-medium text-muted-foreground mt-2'>
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
			{selectedTask && (
				<DrawerItemView
					open={!!selectedTask}
					onOpenChange={(open) => {
						if (!open) setSelectedTask(null);
					}}
					task={selectedTask}
				/>
			)}
		</main>
	);
}

