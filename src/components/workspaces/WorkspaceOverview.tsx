"use client";

import { useRef } from "react";
import { metrics } from "./workspace-overview/workspace-overview.mock";
import { MetricCard } from "./workspace-overview/components/MetricCard";
import { ProjectOverview } from "./workspace-overview/components/ProjectOverview";
import { TaskStatusChart } from "./workspace-overview/components/TaskStatusChart";
import { NeedsAttention } from "./workspace-overview/components/NeedsAttention";
import { MyTasks } from "./workspace-overview/components/MyTasks";
import { ActivityFeed } from "./workspace-overview/components/ActivityFeed";
import { UpcomingDeadlines } from "./workspace-overview/components/UpcomingDeadlines";

type WorkspaceOverviewProps = {
	workspaceSlug: string;
};

export default function WorkspaceOverview({
	workspaceSlug,
}: WorkspaceOverviewProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	// Fallback to workspaceSlug if not provided (though prop says it's required in my plan)
	const slug = workspaceSlug || "default";
	const currentMetrics = metrics(slug);

	return (
		<div 
			ref={containerRef}
			className='mx-auto flex w-full flex-col gap-8 py-6 animate-in fade-in duration-700'
		>
			{/* Metric Cards Row */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{currentMetrics.map((metric, i) => (
					<div 
						key={metric.label} 
						className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
						style={{ animationDelay: `${i * 100}ms` }}
					>
						<MetricCard {...metric} />
					</div>
				))}
			</div>

			{/* Main Grid */}
			<div className="grid grid-cols-1 gap-6 xl:grid-cols-12 grid-flow-dense">
				{/* Left Column: Project Overview */}
				<div className="xl:col-span-8">
					<div className="animate-in fade-in slide-in-from-left-4 duration-700 fill-mode-both delay-300">
						<ProjectOverview workspaceSlug={slug} />
					</div>
				</div>

				{/* Right Column: Status, Attention, Tasks */}
				<div className="xl:col-span-4 space-y-6">
					<div className="animate-in fade-in slide-in-from-right-4 duration-700 fill-mode-both delay-400">
						<TaskStatusChart workspaceSlug={slug} />
					</div>
					<div className="animate-in fade-in slide-in-from-right-4 duration-700 fill-mode-both delay-500">
						<NeedsAttention workspaceSlug={slug} />
					</div>
					<div className="animate-in fade-in slide-in-from-right-4 duration-700 fill-mode-both delay-600">
						<MyTasks workspaceSlug={slug} />
					</div>
				</div>
			</div>

			{/* Bottom Grid */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both delay-500">
					<ActivityFeed />
				</div>
				<div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both delay-700">
					<UpcomingDeadlines />
				</div>
			</div>
		</div>
	);
}
