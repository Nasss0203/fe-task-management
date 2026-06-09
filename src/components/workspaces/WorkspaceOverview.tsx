"use client";

import { useWorkspaceOverview } from "@/features/workspace/hooks/useWorkspaceOverview";
import { useProjectSelectionStore } from "@/stores/use-project-selection";
import { AlertCircle } from "lucide-react";
import { useRef } from "react";
import { ActivityFeed } from "./workspace-overview/components/ActivityFeed";
import { MetricCard } from "./workspace-overview/components/MetricCard";
import { MyTasks } from "./workspace-overview/components/MyTasks";
import { NeedsAttention } from "./workspace-overview/components/NeedsAttention";
import { ProjectOverview } from "./workspace-overview/components/ProjectOverview";
import { TaskStatusChart } from "./workspace-overview/components/TaskStatusChart";
import { UpcomingDeadlines } from "./workspace-overview/components/UpcomingDeadlines";
import { getMetricCards } from "./workspace-overview/workspace-overview.mapper";

type WorkspaceOverviewProps = {
	workspaceSlug: string;
};

export default function WorkspaceOverview({
	workspaceSlug,
}: WorkspaceOverviewProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const { currentWorkspaceId } = useProjectSelectionStore();

	const { data, isLoading, isError, refetch } =
		useWorkspaceOverview(currentWorkspaceId);

	if (isLoading) {
		return (
			<div className='mx-auto flex w-full flex-col gap-8 py-6'>
				{/* Skeleton for Metric Cards */}
				<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
					{[...Array(4)].map((_, i) => (
						<div
							key={i}
							className='h-32 w-full animate-pulse rounded-xl bg-zinc-900/50 border border-zinc-800'
						/>
					))}
				</div>
				<div className='grid grid-cols-1 gap-6 xl:grid-cols-12'>
					<div className='xl:col-span-8 h-96 animate-pulse rounded-xl bg-zinc-900/50 border border-zinc-800' />
					<div className='xl:col-span-4 h-96 animate-pulse rounded-xl bg-zinc-900/50 border border-zinc-800' />
				</div>
			</div>
		);
	}

	if (isError || !data) {
		return (
			<div className='mx-auto flex w-full flex-col items-center justify-center gap-4 py-20 text-center'>
				<div className='flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500'>
					<AlertCircle size={24} />
				</div>
				<div>
					<h3 className='text-lg font-semibold text-white'>
						Đã có lỗi xảy ra
					</h3>
					<p className='text-sm text-zinc-500'>
						Không thể tải dữ liệu tổng quan workspace.
					</p>
				</div>
				<button
					onClick={() => refetch()}
					className='rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors'
				>
					Thử lại
				</button>
			</div>
		);
	}

	const currentMetrics = getMetricCards(data, workspaceSlug);
	const taskStatus = data.taskStatus ?? { total: 0, items: [] };

	return (
		<div
			ref={containerRef}
			className='mx-auto flex w-full flex-col gap-8 py-6 animate-in fade-in duration-700'
		>
			{/* Metric Cards Row */}
			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				{currentMetrics.map(({ key, href, ...metric }, i) => (
					<div
						key={key}
						className='animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both'
						style={{ animationDelay: `${i * 100}ms` }}
					>
						<MetricCard {...metric} link={href} />
					</div>
				))}
			</div>

			{/* Main Grid */}
			<div className='grid grid-cols-1 gap-6 xl:grid-cols-12 grid-flow-dense'>
				{/* Left Column: Project Overview */}
				<div className='xl:col-span-8 h-full'>
					<div className='animate-in fade-in slide-in-from-left-4 duration-700 fill-mode-both delay-300 h-full'>
						<ProjectOverview
							workspaceSlug={workspaceSlug}
							projects={data.projects}
						/>
					</div>
				</div>

				{/* Right Column: Status, Attention, Tasks */}
				<div className='xl:col-span-4 space-y-6'>
					<div className='animate-in fade-in slide-in-from-right-4 duration-700 fill-mode-both delay-400'>
						<TaskStatusChart
							workspaceSlug={workspaceSlug}
							total={taskStatus.total}
							items={taskStatus.items}
						/>
					</div>
					<div className='animate-in fade-in slide-in-from-right-4 duration-700 fill-mode-both delay-500'>
						<NeedsAttention
							workspaceSlug={workspaceSlug}
							items={data.attentionItems}
						/>
					</div>
					<div className='animate-in fade-in slide-in-from-right-4 duration-700 fill-mode-both delay-600'>
						<MyTasks
							workspaceSlug={workspaceSlug}
							tasks={data.myTasks}
						/>
					</div>
				</div>
			</div>

			{/* Bottom Grid */}
			<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
				<div className='animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both delay-500'>
					<ActivityFeed activities={data.activities} />
				</div>
				<div className='animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both delay-700'>
					<UpcomingDeadlines
						workspaceSlug={workspaceSlug}
						items={data.upcomingDeadlines}
					/>
				</div>
			</div>
		</div>
	);
}
