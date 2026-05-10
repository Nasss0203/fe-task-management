"use client";

import {
	activities,
	attentionItems,
	myTasks,
	projects,
	stats,
} from "@/data/data";
import { TaskStatusChart } from "../dashboard/chart/task-status-chart";
import { AttentionPanel } from "../panel/attention-panel";
import { MyTasksPanel } from "../panel/my-tasks-panel";
import { ProjectsOverview } from "../project/projects-overview";
import { RecentActivity } from "../recent/recent-activity";
import { StatsGrid } from "../stats/stats-grid";

type WorkspaceOverviewProps = {
	workspaceSlug?: string;
};

export default function WorkspaceOverview({
	workspaceSlug,
}: WorkspaceOverviewProps) {
	return (
		<div className='mx-auto flex w-full flex-col gap-4'>
			<StatsGrid items={stats} workspaceSlug={workspaceSlug} />

			<div className='grid grid-cols-1 gap-4 xl:grid-cols-12'>
				<div className='space-y-4 xl:col-span-8'>
					<ProjectsOverview items={projects} />
					<RecentActivity items={activities} />
				</div>

				<div className='space-y-4 xl:col-span-4'>
					<TaskStatusChart />
					<AttentionPanel items={attentionItems} />
					<MyTasksPanel items={myTasks} />
				</div>
			</div>
		</div>
	);
}
