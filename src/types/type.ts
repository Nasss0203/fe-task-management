import type { LucideIcon } from "lucide-react";

export type StatItem = {
	title: string;
	value: string;
	description: string;
	icon: LucideIcon;
	url?: string;
};

export type ProjectItem = {
	id: string;
	name: string;
	key: string;
	progress: number;
	openTasks: number;
	doneTasks: number;
	deadline: string;
	members: string[];
	status: string;
};

export type ActivityItem = {
	id: string;
	user: string;
	action: string;
	target: string;
	time: string;
};

export type MyTaskItem = {
	id: string;
	title: string;
	priority: string;
	due: string;
	status: string;
};

export type AttentionItem = {
	id: string;
	title: string;
	type: string;
};
