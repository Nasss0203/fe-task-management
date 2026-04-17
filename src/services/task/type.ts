export enum TASK_KEY {
	TASK = "task",
	TASKS = "tasks",
}

export interface TaskItem {
	id: string;
	workspaceId: string;
	projectId: string;
	sprintId: string | null;

	projectSeq: number;
	title: string;
	description: string | null;

	statusId: string;
	statusName: string | null;

	priorityId: string | null;
	priorityName: string | null;

	reporterId: string;

	assigneeId: string | null;
	assigneeName: string | null;

	startAt: string | null;
	dueAt: string | null;
	completedAt: string | null;

	estimateMinutes: number | null;

	createdAt: string;
	updatedAt: string;
	deletedAt?: string | null;
}

export interface CreateTaskDto {
	workspaceId: string;
	projectId: string;
	sprintId?: string | null;

	title: string;
	description?: string | null;

	statusId: string;
	priorityId?: string | null;

	assigneeId?: string | null;

	startAt?: string | null;
	dueAt?: string | null;

	estimateMinutes?: number | null;
}

export type UpdateTaskDto = {
	id: string;
	title?: string;
	description?: string | null;
	statusId?: string;
	priorityId?: string | null;
	assigneeId?: string | null;
	position?: number;
};

export interface CreateTaskResponse {
	data: TaskItem;
}

export interface findAllTaskApiResponse {
	data: TaskItem[];
}

export interface FindOneTaskResponse {
	data: TaskItem;
}

export interface UpdateTaskResponse {
	data: TaskItem;
}

export interface DeleteTaskResponse {
	data: TaskItem;
}
