"use client";

import {
	activities,
	attentionItems,
	myTasks,
	projects,
	stats,
} from "@/data/data";
import { WorkspaceHeader } from "../header/workspace-header";
import { AttentionPanel } from "../panel/attention-panel";
import { MyTasksPanel } from "../panel/my-tasks-panel";
import { ProjectsOverview } from "../project/projects-overview";
import { RecentActivity } from "../recent/recent-activity";
import { StatsGrid } from "../stats/stats-grid";
import { WorkspaceSummary } from "../summary/workspace-summary";
type DashboardWorkspaceProps = {
	workspaceName?: string;
	workspaceSlug?: string;
};
export default function DashboardWorkspace({
	workspaceName,
	workspaceSlug,
}: DashboardWorkspaceProps) {
	return (
		<div className='min-h-screen rounded-lg bg-muted/30'>
			<div className=' flex w-full  flex-col gap-6 p-4 md:p-6'>
				<WorkspaceHeader workspaceName={workspaceName} />
				<StatsGrid items={stats} workspaceSlug={workspaceSlug} />

				<div className='grid gap-6 xl:grid-cols-3'>
					<div className='space-y-6 xl:col-span-2'>
						<ProjectsOverview items={projects} />
						<RecentActivity items={activities} />
					</div>

					<div className='space-y-6'>
						<AttentionPanel items={attentionItems} />
						<MyTasksPanel items={myTasks} />
						<WorkspaceSummary />
					</div>
				</div>
			</div>
		</div>
	);
}
