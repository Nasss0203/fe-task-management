"use client";

import { getRecentActivitiesApi } from "@/services/admin/dashboard/recent-activities";
import { getRetentionMetricsApi } from "@/services/admin/dashboard/retention-metrics";
import { getSystemHealthApi } from "@/services/admin/dashboard/system-health";
import { getUserGrowthApi } from "@/services/admin/dashboard/user-growth";
import { getAdminUserOverviewApi } from "@/services/admin/user/user-admin.service";
import { getWorkspaceGrowthApi } from "@/services/admin/dashboard/workspace-growth";
import { getWorkspacePlanApi } from "@/services/admin/dashboard/workspace-plan";
import {
	WORKSPACE_ADMIN_KEY,
	type AdminFindAllWorkspaceQuery,
	type ApiResponse,
	type DashboardSummaryResponseDto,
	type UserGrowthPeriod,
	type WorkspaceGrowthPeriod,
	type WorkspacePaginationResponse,
} from "@/services/admin/dashboard/type";
import {
	findAllWorkspaceAdminApi,
	getAdminDashboardSummaryApi,
} from "@/services/admin/dashboard/workspace-admin.service";
import { useQuery } from "@tanstack/react-query";

export const ADMIN_DASHBOARD_KEY = {
	USER_GROWTH: "ADMIN_USER_GROWTH",
	USER_OVERVIEW: "ADMIN_USER_OVERVIEW",
	WORKSPACE_GROWTH: "ADMIN_WORKSPACE_GROWTH",
	WORKSPACE_PLAN: "ADMIN_WORKSPACE_PLAN",
	ALL_WORKSPACES: "ADMIN_DASHBOARD_ALL_WORKSPACES",
	RETENTION_METRICS: "ADMIN_RETENTION_METRICS",
	SYSTEM_HEALTH: "ADMIN_SYSTEM_HEALTH",
	RECENT_ACTIVITIES: "ADMIN_RECENT_ACTIVITIES",
} as const;

export const useAdminDashboard = (
	query?: AdminFindAllWorkspaceQuery,
	userGrowthPeriod: UserGrowthPeriod = "7d",
	workspaceGrowthPeriod: WorkspaceGrowthPeriod = "7d",
) => {
	const dashboardSummary = useQuery<ApiResponse<DashboardSummaryResponseDto>>(
		{
			queryKey: [WORKSPACE_ADMIN_KEY.ADMIN_DASHBOARD_SUMMARY],
			queryFn: getAdminDashboardSummaryApi,
			retry: false,
			refetchOnWindowFocus: false,
		},
	);

	const workspaces = useQuery<ApiResponse<WorkspacePaginationResponse>>({
		queryKey: [WORKSPACE_ADMIN_KEY.WORKSPACE_ADMIN_LIST, query],
		queryFn: () => findAllWorkspaceAdminApi(query),
		retry: false,
		refetchOnWindowFocus: false,
	});

	const allWorkspaces = useQuery<ApiResponse<WorkspacePaginationResponse>>({
		queryKey: [ADMIN_DASHBOARD_KEY.ALL_WORKSPACES],
		queryFn: () => findAllWorkspaceAdminApi({ page: 1, pageSize: 100 }),
		retry: false,
		refetchOnWindowFocus: false,
	});

	const userOverview = useQuery({
		queryKey: [ADMIN_DASHBOARD_KEY.USER_OVERVIEW],
		queryFn: getAdminUserOverviewApi,
		retry: false,
		refetchOnWindowFocus: false,
	});

	const userGrowth = useQuery({
		queryKey: [ADMIN_DASHBOARD_KEY.USER_GROWTH, userGrowthPeriod],
		queryFn: () => getUserGrowthApi(userGrowthPeriod),
		retry: false,
		refetchOnWindowFocus: false,
	});

	const workspaceGrowth = useQuery({
		queryKey: [ADMIN_DASHBOARD_KEY.WORKSPACE_GROWTH, workspaceGrowthPeriod],
		queryFn: () => getWorkspaceGrowthApi(workspaceGrowthPeriod),
		retry: false,
		refetchOnWindowFocus: false,
	});

	const workspacePlan = useQuery({
		queryKey: [ADMIN_DASHBOARD_KEY.WORKSPACE_PLAN],
		queryFn: getWorkspacePlanApi,
		retry: false,
		refetchOnWindowFocus: false,
	});

	const retentionMetrics = useQuery({
		queryKey: [ADMIN_DASHBOARD_KEY.RETENTION_METRICS],
		queryFn: getRetentionMetricsApi,
		retry: false,
		refetchOnWindowFocus: false,
	});

	const systemHealth = useQuery({
		queryKey: [ADMIN_DASHBOARD_KEY.SYSTEM_HEALTH],
		queryFn: getSystemHealthApi,
		retry: false,
		refetchOnWindowFocus: false,
	});

	const recentActivities = useQuery({
		queryKey: [ADMIN_DASHBOARD_KEY.RECENT_ACTIVITIES],
		queryFn: getRecentActivitiesApi,
		retry: false,
		refetchOnWindowFocus: false,
	});

	return {
		dashboardSummary,
		workspaces,
		allWorkspaces,
		userOverview,
		userGrowth,
		workspaceGrowth,
		workspacePlan,
		retentionMetrics,
		systemHealth,
		recentActivities,
	};
};
