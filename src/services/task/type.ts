export const TASK_KEY = {
	TASK: "task",
	TASKS: "tasks",
	TASK_BACKLOG: "task-backlog",
	TASK_TRASH: "task-trash",
};

export type TaskFilterValue = string | string[];
export type PaginationQueryValue = number | string;
export type TaskPositionContext = "kanban" | "sprint" | "backlog" | "list";

export type TaskPositionContextInput = {
	context: TaskPositionContext;
	contextId: string;
};

export type ReorderTaskPositionDto = TaskPositionContextInput & {
	taskId: string;
	previousTaskId?: string | null;
	nextTaskId?: string | null;
};

export type FindBacklogTasksFilters = {
	search?: string;
	assigneeId?: TaskFilterValue;
	statusId?: TaskFilterValue;
	priorityId?: TaskFilterValue;
	context?: TaskPositionContext;
	contextId?: string;
	page?: PaginationQueryValue;
	pageSize?: PaginationQueryValue;
};

export type BulkUpdateTasksDto = {
	taskIds: string[];
	statusId?: string;
	priorityId?: string | null;
	startAt?: string | null;
	dueAt?: string | null;
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
	position: string | null;
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

	assigneeIds?: string[];

	initialComment?: string | null;
	positionContext?: TaskPositionContextInput | null;
}

export type UpdateTaskDto = {
	id: string;
	title?: string;
	description?: string | null;
	statusId?: string;
	priorityId?: string | null;
	assigneeIds?: string[];
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
	success: boolean;
}

export interface FindAllTaskBacklogResponse {
	data: TaskItem[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export interface FindDeletedTaskResponse {
	data: TaskItem[];
}

export interface ReorderTaskPositionResponse {
	data: {
		id: string;
		taskId: string;
		context: TaskPositionContext;
		contextId: string;
		position: number;
		createdAt: string;
		updatedAt: string;
	};
}
