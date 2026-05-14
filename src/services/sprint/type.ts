import { TaskItem } from "../task/type";

export const SPRINT_KEY = {
	SPRINTS: "sprints",
	SPRINT: "sprint",
} as const;

export type SprintStatus = "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface SprintItem {
	id: string;
	workspaceId: string;
	projectId: string;
	name: string;
	goal: string | null;
	status: SprintStatus;
	startAt: Date | null;
	endAt: Date | null;
	completedAt: Date | null;
	createdBy: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
	deletedBy: string | null;
	tasks?: TaskItem[];
}

export type FindAllSprintResponse = SprintItem;

export interface CreateSprintDto {
	workspaceId: string;
	projectId: string;
	name?: string;
}
