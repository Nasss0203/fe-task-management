import type { ApiResponse } from "@/services/types";

export const DASHBOARD_KEY = {
	MY_DASHBOARD: "MY_DASHBOARD",
} as const;

export type MyDashboardQuery = {
	date?: string;
	timezone?: string;
	limit?: number;
};

export type DashboardGreetingResponseDto = {
	displayName: string;
	todayPriorityCount: number;
	date: string;
	timezone: string;
};

export type DashboardFocusResponseDto = {
	title: string;
	message: string;
	deepWorkMinutes: number;
	reviewTaskCount: number;
	momentumPercent: number;
	dayProgressPercent: number;
	completedThisWeek: number;
	targetThisWeek: number;
	remainingTasks: number;
	overdueTasks: number;
};

export type DashboardRhythmBlockResponseDto = {
	time: string;
	title: string;
	subtitle: string;
	taskId: string;
};

export type DashboardStatsResponseDto = {
	myTasks: number;
	priorityToday: number;
	upcoming: number;
	upcomingWindowDays: number;
	overdue: number;
	completedThisWeek: number;
	weeklyGoalPercent: number;
};

export type DashboardTaskResponseDto = {
	id: string;
	workspaceId: string;
	projectId: string;
	title: string;
	workspaceName: string;
	projectName: string;
	priorityName: string | null;
	priorityLevel: number | null;
	statusName: string | null;
	dueAt: string | null;
	startAt: string | null;
	estimateMinutes: number | null;
	progressPercent: number;
};

export type DashboardDeadlineResponseDto = DashboardTaskResponseDto & {
	remainingLabel: string;
};

export type DashboardWorkspaceResponseDto = {
	id: string;
	name: string;
	slug: string;
	projectCount: number;
	openTaskCount: number;
	lastOpenedAt: string | null;
};

export type DashboardActivityResponseDto = {
	id: string;
	workspaceId: string;
	projectId: string | null;
	action: string;
	message: string;
	createdAt: string;
};

export type DashboardSuggestionResponseDto = {
	type: string;
	message: string;
};

export type MyDashboardResponseDto = {
	greeting: DashboardGreetingResponseDto;
	focus: DashboardFocusResponseDto;
	rhythmBlocks: DashboardRhythmBlockResponseDto[];
	recentDeadlines: DashboardDeadlineResponseDto[];
	stats: DashboardStatsResponseDto;
	priorityTasks: DashboardTaskResponseDto[];
	recentWorkspaces: DashboardWorkspaceResponseDto[];
	recentActivities: DashboardActivityResponseDto[];
	suggestions: DashboardSuggestionResponseDto[];
};

export type GetMyDashboardResponse = ApiResponse<MyDashboardResponseDto>;
