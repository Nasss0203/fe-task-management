export const TASK_KEY = {
	TASK: "task",
	TASKS: "tasks",
	TASK_BACKLOG: "task-backlog",
};
export type BulkUpdateTasksDto = {
	taskIds: string[];
	statusId?: string;
	sendNotification?: boolean;
};

export interface TaskAssigneeItem {
	userId: string;
	username: string | null;
	fullName?: string | null;
	avatarUrl?: string | null;
}

export interface TaskItem {
	id: string;
	workspaceId: string;
	projectId: string;
	sprintId: string | null;
	sprintName?: string | null;

	projectSeq: number | null;
	title: string;
	description: string | null;

	statusId: string;
	statusName: string | null;

	priorityId: string | null;
	priorityName: string | null;

	createdBy: string;
	assignees: {
		userId: string;
		username: string | null;
		fullName?: string | null;
		avatarUrl?: string | null;
	}[];

	startAt: string | null;
	dueAt: string | null;
	completedAt: string | null;

	estimateMinutes: number | null;

	createdAt?: string;
	updatedAt?: string;
	deletedAt?: string | null;
	deletedBy?: string | null;
}

export type TaskBacklogItem = TaskItem;

export interface CreateTaskDto {
	workspaceId: string;
	projectId: string;
	sprintId?: string | null;

	title: string;
	description?: string | null;

	statusId: string;
	priorityId?: string | null;

	startAt?: string | null;
	dueAt?: string | null;

	estimateMinutes?: number | null;

	createdBy: string;

	assigneeIds?: string[];

	initialComment?: string | null;
}

export type UpdateTaskDto = {
	id: string;
	title?: string;
	description?: string | null;
	statusId?: string;
	priorityId?: string | null;
	position?: number;
	startAt?: string | null;
	dueAt?: string | null;
	estimateMinutes?: number | null;
};

export interface CreateTaskResponse {
	data: TaskItem;
}

export interface FindOneTaskResponse {
	data: TaskItem;
}

export interface FindAllTaskResponse {
	data: TaskItem[];
}

export interface UpdateTaskResponse {
	data: TaskItem;
}

export interface DeleteTaskResponse {
	data: TaskItem;
}

export interface FindAllTaskBacklogResponse {
	data: TaskItem[];
}
