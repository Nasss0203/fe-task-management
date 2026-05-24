import type { LucideIcon } from "lucide-react";

export type UserGrowthPeriod = "7d" | "30d" | "60d" | "1y";
export type UserGrowthGroupBy = "day" | "month";
export type WorkspaceGrowthPeriod = "7d" | "30d" | "60d" | "1y";
export type RetentionMetricLevel = "success" | "warning" | "danger";
export type SystemHealthLevel = "success" | "warning" | "danger";
export type ActivityLevel = "info" | "success" | "warning" | "danger";
export type ActivityType = "workspace" | "user" | "billing" | "system";

export type UserGrowthItem = {
	date: string;
	name: string;
	users: number;
};

export type WorkspaceGrowthItem = {
	date: string;
	name: string;
	workspaces: number;
};

export type WorkspacePlanItem = {
	name: string;
	value: number;
};

export type RetentionMetricItem = {
	key: string;
	label: string;
	value: number;
	suffix: string;
	description: string;
	level: RetentionMetricLevel;
};

export type SystemHealthItem = {
	key: string;
	label: string;
	value: string;
	level: SystemHealthLevel;
	description: string;
};

export type ActivityItem = {
	id: string;
	title: string;
	description: string;
	time: string;
	type: ActivityType;
	level: ActivityLevel;
	createdAt: string;
};

/** React Query keys for admin dashboard summary + workspace list */
export const WORKSPACE_ADMIN_KEY = {
	WORKSPACE_ADMIN: "WORKSPACE_ADMIN",
	ADMIN_DASHBOARD_SUMMARY: "ADMIN_DASHBOARD_SUMMARY",
	WORKSPACE_ADMIN_LIST: "WORKSPACE_ADMIN_LIST",
} as const;

export type DashboardSummaryResponseDto = {
	totalUsers: number;
	totalWorkspaces: number;
	totalProjects: number;
	totalTasks: number;
	paidWorkspaces: number;
	activeUsersLast30Days: number;
};

export type ApiResponse<T> = {
	statusCode: number;
	message: string;
	data: T;
};

export type StatItem = {
	title: string;
	value: string | number;
	change: string;
	description: string;
	trend: "up" | "down" | "neutral";
	icon: LucideIcon;
};

export type PlanTypeWorkspace = "free" | "pro";

export type AdminFindAllWorkspaceQuery = {
	search?: string;
	plan?: PlanTypeWorkspace;
	createdFrom?: string;
	createdTo?: string;
	createdAt?: string;
};

export type WorkspaceResponseDto = {
	id: string;
	name: string;
	slug?: string;
	planType: PlanTypeWorkspace;
	createdAt: string;
	updatedAt?: string;
};

export type WorkspaceStatus = "ACTIVE" | "PENDING" | "SUSPENDED";

export type WorkspaceItem = {
	id: string;
	name: string;
	slug: string;
	plan: PlanTypeWorkspace;
	createdAt?: string;
	updatedAt?: string;

	owner?: string;
	membersCount?: number;
	projectsCount?: number;
	tasksCount?: number;
	userCount?: number;
};
