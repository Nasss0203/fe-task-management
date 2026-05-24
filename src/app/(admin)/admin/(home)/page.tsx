"use client";

import { RecentActivity } from "@/components/admin/activity/recent-activity";
import { UserGrowthChart } from "@/components/admin/charts/user-growth-chart";
import { WorkspaceGrowthChart } from "@/components/admin/charts/workspace-growth-chart";
import { WorkspacePlanChart } from "@/components/admin/charts/workspace-plan-chart";
import { DashboardHeader } from "@/components/admin/header/dashboard-header";
import { SystemHealth } from "@/components/admin/health/system-health";
import { RetentionCard } from "@/components/admin/retention/retention-card";
import { StatItem } from "@/components/admin/shared/types";
import { StatsGrid } from "@/components/admin/stats/stats-grid";
import { RecentWorkspacesTable } from "@/components/admin/table/recent-workspaces-table";
import { useAdminDashboard } from "@/hooks/admin/use-admin-dashboard";
import type {
	UserGrowthPeriod,
	WorkspaceGrowthPeriod,
} from "@/services/admin/dashboard/type";
import type { AdminFindAllWorkspaceQuery } from "@/services/admin/dashboard/type";

import {
	BriefcaseBusiness,
	CheckSquare,
	CreditCard,
	User,
	Users,
	Workflow,
} from "lucide-react";
import { useState } from "react";

export default function AdminDashboardPage() {
	const [workspaceQuery, setWorkspaceQuery] =
		useState<AdminFindAllWorkspaceQuery>({});

	const [userGrowthPeriod, setUserGrowthPeriod] =
		useState<UserGrowthPeriod>("7d");

	const [workspaceGrowthPeriod, setWorkspaceGrowthPeriod] =
		useState<WorkspaceGrowthPeriod>("7d");

	const {
		dashboardSummary,
		workspaces,
		userGrowth,
		workspaceGrowth,
		workspacePlan,
		retentionMetrics,
		systemHealth,
		recentActivities,
	} = useAdminDashboard(
		workspaceQuery,
		userGrowthPeriod,
		workspaceGrowthPeriod,
	);

	const summary = dashboardSummary.data?.data;
	const workspaceItems = workspaces.data?.data ?? [];
	const userGrowthItems = userGrowth.data?.data ?? [];
	const workspaceGrowthItems = workspaceGrowth.data?.data ?? [];
	const workspacePlanItems = workspacePlan.data?.data ?? [];
	const retentionMetricItems = retentionMetrics.data?.data ?? [];
	const systemHealthItems = systemHealth.data?.data ?? [];
	const recentActivityItems = recentActivities.data?.data ?? [];

	const stats: StatItem[] = [
		{
			title: "Total Users",
			value: summary?.totalUsers ?? 0,
			change: "Live",
			description: "registered users",
			trend: "neutral",
			icon: Users,
		},
		{
			title: "Total Workspaces",
			value: summary?.totalWorkspaces ?? 0,
			change: "Live",
			description: "created workspaces",
			trend: "neutral",
			icon: BriefcaseBusiness,
		},
		{
			title: "Total Projects",
			value: summary?.totalProjects ?? 0,
			change: "Live",
			description: "created projects",
			trend: "neutral",
			icon: Workflow,
		},
		{
			title: "Total Tasks",
			value: summary?.totalTasks ?? 0,
			change: "Live",
			description: "created tasks",
			trend: "neutral",
			icon: CheckSquare,
		},
		{
			title: "Paid Workspaces",
			value: summary?.paidWorkspaces ?? 0,
			change: "Live",
			description: "paid plan workspaces",
			trend: "neutral",
			icon: CreditCard,
		},
		{
			title: "Active users",
			value: summary?.activeUsersLast30Days ?? 0,
			change: "Live",
			description: "Active users in the last 30 days",
			trend: "neutral",
			icon: User,
		},
	];

	if (
		dashboardSummary.isLoading ||
		workspaces.isLoading ||
		userGrowth.isLoading ||
		workspaceGrowth.isLoading ||
		workspacePlan.isLoading ||
		retentionMetrics.isLoading ||
		systemHealth.isLoading ||
		recentActivities.isLoading
	) {
		return <div className='text-neutral-400'>Loading dashboard...</div>;
	}

	if (dashboardSummary.isError || workspaces.isError) {
		return <div className='text-red-400'>Failed to load dashboard</div>;
	}

	return (
		<div className='space-y-6 p-6'>
			<DashboardHeader />

			<StatsGrid items={stats} />

			<section className='grid gap-4 xl:grid-cols-3'>
				<div className='xl:col-span-2'>
					<UserGrowthChart
						data={userGrowth.isError ? [] : userGrowthItems}
						period={userGrowthPeriod}
						onPeriodChange={setUserGrowthPeriod}
					/>
				</div>

				<WorkspacePlanChart
					data={workspacePlan.isError ? [] : workspacePlanItems}
				/>
			</section>

			<section className='grid gap-4 xl:grid-cols-3'>
				<div className='xl:col-span-2'>
					<WorkspaceGrowthChart
						data={
							workspaceGrowth.isError ? [] : workspaceGrowthItems
						}
						period={workspaceGrowthPeriod}
						onPeriodChange={setWorkspaceGrowthPeriod}
					/>
				</div>

				<RetentionCard
					items={retentionMetrics.isError ? [] : retentionMetricItems}
				/>
			</section>

			<section className='grid gap-4 xl:grid-cols-3'>
				<div className='xl:col-span-2'>
					<RecentWorkspacesTable
						items={workspaceItems}
						query={workspaceQuery}
						onQueryChange={setWorkspaceQuery}
					/>
				</div>

				<div className='space-y-4'>
					<SystemHealth
						items={systemHealth.isError ? [] : systemHealthItems}
					/>

					<RecentActivity
						items={
							recentActivities.isError ? [] : recentActivityItems
						}
					/>
				</div>
			</section>
		</div>
	);
}
