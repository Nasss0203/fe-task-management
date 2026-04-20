import instance from "../axios";
import {
	CreateTaskDto,
	CreateTaskResponse,
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
