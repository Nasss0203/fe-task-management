import instance from "../axios";
import {
	BulkUpdateTasksDto,
	CreateTaskDto,
	CreateTaskResponse,
	DeleteTaskResponse,
	FindAllTaskBacklogResponse,
	FindDeletedTaskResponse,
	FindAllTaskResponse,
	FindBacklogTasksFilters,
	UpdateTaskDto,
	UpdateTaskResponse,
} from "./type";

type BacklogApiResponse =
	| FindAllTaskBacklogResponse
	| { data: FindAllTaskBacklogResponse };

const isBacklogPage = (
	payload: BacklogApiResponse,
): payload is FindAllTaskBacklogResponse => Array.isArray(payload.data);

const normalizeBacklogResponse = (
	payload: BacklogApiResponse,
): FindAllTaskBacklogResponse => {
	const page = isBacklogPage(payload) ? payload : payload.data;
	const data = Array.isArray(page.data) ? page.data : [];

	return {
		data,
		total: page.total ?? data.length,
		page: page.page ?? 1,
		pageSize: page.pageSize ?? data.length,
		totalPages: page.totalPages ?? 1,
	};
};

const serializeBacklogFilters = (filters?: FindBacklogTasksFilters) => {
	if (!filters) return undefined;

	const params: Record<string, string> = {};

	for (const key of ["assigneeId", "statusId", "priorityId"] as const) {
		const value = filters[key];
		const values = Array.isArray(value) ? value : value ? [value] : [];

		if (values.length > 0) {
			params[key] = values.join(",");
		}
	}

	if (filters.search?.trim()) {
		params.search = filters.search.trim();
	}

	if (filters.page) {
		params.page = String(filters.page);
	}

	if (filters.pageSize) {
		params.pageSize = String(filters.pageSize);
	}

	return Object.keys(params).length ? params : undefined;
};

export const findAllTaskApi = async (
	workspaceId: string,
	projectId: string,
	filters?: FindBacklogTasksFilters,
): Promise<FindAllTaskResponse> => {
	const response = await instance.get<FindAllTaskResponse>(
		`/tasks/workspace/${workspaceId}/project/${projectId}`,
		{
			params: serializeBacklogFilters(filters),
		},
	);

	return response.data;
};

export const createTaskApi = async (
	data: CreateTaskDto,
): Promise<CreateTaskResponse> => {
	const response = await instance.post<CreateTaskResponse>(`/tasks`, data);

	return response.data;
};

export const updateTaskApi = async (
	id: string,
	data: Omit<UpdateTaskDto, "id">,
): Promise<UpdateTaskResponse> => {
	const response = await instance.patch<UpdateTaskResponse>(
		`/tasks/${id}`,
		data,
	);

	return response.data;
};

export const findAllBacklogTaskApi = async (
	workspaceId: string,
	projectId: string,
	filters?: FindBacklogTasksFilters,
): Promise<FindAllTaskBacklogResponse> => {
	const response = await instance.get<BacklogApiResponse>(
		`/tasks/workspace/${workspaceId}/project/${projectId}/backlog`,
		{
			params: serializeBacklogFilters(filters),
		},
	);

	return normalizeBacklogResponse(response.data);
};

export const moveTaskToSprintApi = async ({
	sprintId,
	taskId,
}: {
	taskId: string;
	sprintId: string | null;
}) => {
	const response = await instance.patch(`/tasks/${taskId}/move-sprint`, {
		sprintId,
	});
	return response.data;
};

export const removeTaskFormSprintApi = async ({
	taskId,
}: {
	taskId: string;
}) => {
	const response = await instance.patch(`/tasks/${taskId}/remove-sprint`);
	return response.data;
};

export const moveTaskSprintToSprintApi = async ({
	taskId,
	workspaceId,
	projectId,
	sourceSprintId,
	targetSprintId,
}: {
	taskId: string;
	targetSprintId: string;
	workspaceId: string;
	projectId: string;
	sourceSprintId: string;
}) => {
	const response = await instance.patch(
		`/tasks/workspaces/${workspaceId}/projects/${projectId}/sprints/${sourceSprintId}/tasks/${taskId}/move-to-sprint`,
		{
			targetSprintId,
		},
	);
	return response.data;
};

export const bulkUpdateTasksApi = async ({
	workspaceId,
	projectId,
	body,
}: {
	workspaceId: string;
	projectId: string;
	body: BulkUpdateTasksDto;
}) => {
	const res = await instance.patch(
		`/tasks/workspaces/${workspaceId}/projects/${projectId}/bulk-update`,
		body,
	);
	console.log("🚀 ~ res~", res.data);

	return res.data;
};

export const deleteTaskApi = async ({
	taskId,
	workspaceId,
}: {
	taskId: string;
	workspaceId: string;
}): Promise<DeleteTaskResponse> => {
	const response = await instance.delete<DeleteTaskResponse>(`/tasks/${taskId}`, {
		params: { workspaceId },
	});

	return response.data;
};

export const restoreTaskApi = async ({
	taskId,
	workspaceId,
}: {
	taskId: string;
	workspaceId: string;
}): Promise<DeleteTaskResponse> => {
	const response = await instance.patch<DeleteTaskResponse>(
		`/tasks/${taskId}/restore`,
		undefined,
		{
			params: { workspaceId },
		},
	);

	return response.data;
};

export const findDeletedTasksApi = async ({
	workspaceId,
	projectId,
}: {
	workspaceId: string;
	projectId?: string;
}): Promise<FindDeletedTaskResponse> => {
	const response = await instance.get<FindDeletedTaskResponse>("/tasks/trash", {
		params: {
			workspaceId,
			...(projectId ? { projectId } : {}),
		},
	});

	return response.data;
};
