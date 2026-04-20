import type { LucideIcon } from "lucide-react";

export type StatItem = {
	title: string;
	value: string;
	change: string;
	description: string;
	icon: LucideIcon;
	trend?: "up" | "down" | "neutral";
};

export type UserGrowthItem = {
	name: string;
	users: number;
};

export type WorkspaceGrowthItem = {
	name: string;
	workspaces: number;
};

export type WorkspacePlanItem = {
	name: string;
	value: number;
};

export type WorkspaceItem = {
	name: string;
	owner: string;
	members: number;
	projects: number;
	plan: string;
	status: "Active" | "Pending" | "Suspended";
};

export type SystemHealthItem = {
	label: string;
	value: string;
	level: "success" | "warning" | "danger";
};

export type ActivityItem = {
	title: string;
	description: string;
	time: string;
};

export type RetentionMetric = {
	label: string;
	value: string;
	description: string;
};