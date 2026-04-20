import {
	Building2,
	CheckCircle2,
	CreditCard,
	FileCheck2,
	ListTodo,
	Users,
} from "lucide-react";
import type {
	ActivityItem,
	RetentionMetric,
	StatItem,
	SystemHealthItem,
	UserGrowthItem,
	WorkspaceGrowthItem,
	WorkspaceItem,
	WorkspacePlanItem,
} from "./types";

export const stats: StatItem[] = [
	{
		title: "Total Users",
		value: "12,480",
		change: "+12.4%",
		description: "Compared to last month",
		icon: Users,
		trend: "up",
	},
	{
		title: "Total Workspaces",
		value: "1,284",
		change: "+8.1%",
		description: "New workspace growth",
		icon: Building2,
		trend: "up",
	},
	{
		title: "Active Users Today",
		value: "3,942",
		change: "+5.6%",
		description: "Daily active users",
		icon: CheckCircle2,
		trend: "up",
	},
	{
		title: "Total Projects",
		value: "8,962",
		change: "+10.2%",
		description: "Projects created system-wide",
		icon: FileCheck2,
		trend: "up",
	},
	{
		title: "Total Tasks",
		value: "124,731",
		change: "+18.7%",
		description: "Tasks created across all workspaces",
		icon: ListTodo,
		trend: "up",
	},
	{
		title: "Paid Workspaces",
		value: "384",
		change: "+4.7%",
		description: "Active subscriptions",
		icon: CreditCard,
		trend: "up",
	},
];

export const userGrowthData: UserGrowthItem[] = [
	{ name: "Mon", users: 2200 },
	{ name: "Tue", users: 2480 },
	{ name: "Wed", users: 2650 },
	{ name: "Thu", users: 2810 },
	{ name: "Fri", users: 3120 },
	{ name: "Sat", users: 2980 },
	{ name: "Sun", users: 3250 },
];

export const workspaceGrowthData: WorkspaceGrowthItem[] = [
	{ name: "Jan", workspaces: 82 },
	{ name: "Feb", workspaces: 96 },
	{ name: "Mar", workspaces: 118 },
	{ name: "Apr", workspaces: 140 },
	{ name: "May", workspaces: 132 },
	{ name: "Jun", workspaces: 168 },
];

export const workspacePlanData: WorkspacePlanItem[] = [
	{ name: "Free", value: 900 },
	{ name: "Pro", value: 280 },
	{ name: "Enterprise", value: 104 },
];

export const recentWorkspaces: WorkspaceItem[] = [
	{
		name: "Acme Inc.",
		owner: "acme@gmail.com",
		members: 24,
		projects: 17,
		plan: "Pro",
		status: "Active",
	},
	{
		name: "Nova Team",
		owner: "nova@gmail.com",
		members: 12,
		projects: 8,
		plan: "Free",
		status: "Pending",
	},
	{
		name: "Pixel Studio",
		owner: "pixel@gmail.com",
		members: 37,
		projects: 22,
		plan: "Enterprise",
		status: "Active",
	},
	{
		name: "Moon Labs",
		owner: "moon@gmail.com",
		members: 8,
		projects: 5,
		plan: "Pro",
		status: "Suspended",
	},
];

export const systemHealth: SystemHealthItem[] = [
	{ label: "API Error Rate", value: "1.8%", level: "warning" },
	{ label: "Failed Jobs", value: "6", level: "danger" },
	{ label: "Mail Delivery Issues", value: "3", level: "warning" },
	{ label: "Healthy Services", value: "12/14", level: "success" },
];

export const retentionMetrics: RetentionMetric[] = [
	{
		label: "30-day Retention",
		value: "78.4%",
		description: "Users active again after 30 days",
	},
	{
		label: "Monthly Churn",
		value: "3.2%",
		description: "Paid workspaces lost this month",
	},
];

export const recentActivities: ActivityItem[] = [
	{
		title: "New workspace created",
		description: "Nova Team created a new workspace 12 minutes ago",
		time: "12m ago",
	},
	{
		title: "Plan upgraded",
		description: "Pixel Studio upgraded from Pro to Enterprise",
		time: "45m ago",
	},
	{
		title: "User suspended",
		description: "A suspicious account was temporarily suspended",
		time: "1h ago",
	},
	{
		title: "Billing issue detected",
		description: "2 failed renewal payments need review",
		time: "2h ago",
	},
];