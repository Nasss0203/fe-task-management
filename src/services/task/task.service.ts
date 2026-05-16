import instance from "../axios";
import {
	CreateTaskDto,
	CreateTaskResponse,
	FindAllTaskBacklogResponse,
	FindAllTaskResponse,
	UpdateTaskDto,
	UpdateTaskResponse,
} from "./type";

export const findAllTaskApi = async (
	workspaceId: string,
	projectId: string,
): Promise<FindAllTaskResponse> => {
	const response = await instance.get<FindAllTaskResponse>(
		`/tasks/workspace/${workspaceId}/project/${projectId}`,
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
	data: UpdateTaskDto,
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
): Promise<FindAllTaskBacklogResponse> => {
	const response = await instance.get<FindAllTaskBacklogResponse>(
		`/tasks/workspace/${workspaceId}/project/${projectId}/backlog`,
	);

	return response.data;
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
