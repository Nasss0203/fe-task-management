import { RecentActivity } from "@/components/admin/activity/recent-activity";
import { UserGrowthChart } from "@/components/admin/charts/user-growth-chart";
import { WorkspaceGrowthChart } from "@/components/admin/charts/workspace-growth-chart";
import { WorkspacePlanChart } from "@/components/admin/charts/workspace-plan-chart";
import { DashboardHeader } from "@/components/admin/header/dashboard-header";
import { SystemHealth } from "@/components/admin/health/system-health";
import { RetentionCard } from "@/components/admin/retention/retention-card";
import {
	recentActivities,
	recentWorkspaces,
	retentionMetrics,
	stats,
	systemHealth,
	userGrowthData,
	workspaceGrowthData,
	workspacePlanData,
} from "@/components/admin/shared/data";
import { StatsGrid } from "@/components/admin/stats/stats-grid";
import { RecentWorkspacesTable } from "@/components/admin/table/recent-workspaces-table";

export default function AdminDashboardPage() {
	return (
		<div className='space-y-6 p-6'>
			<DashboardHeader />

			<StatsGrid items={stats} />

			<section className='grid gap-4 xl:grid-cols-3'>
				<div className='xl:col-span-2'>
					<UserGrowthChart data={userGrowthData} />
				</div>

				<WorkspacePlanChart data={workspacePlanData} />
			</section>

			<section className='grid gap-4 xl:grid-cols-3'>
				<div className='xl:col-span-2'>
					<WorkspaceGrowthChart data={workspaceGrowthData} />
				</div>

				<RetentionCard items={retentionMetrics} />
			</section>

			<section className='grid gap-4 xl:grid-cols-3'>
				<div className='xl:col-span-2'>
					<RecentWorkspacesTable items={recentWorkspaces} />
				</div>

				<div className='space-y-4'>
					<SystemHealth items={systemHealth} />
					<RecentActivity items={recentActivities} />
				</div>
			</section>
		</div>
	);
}