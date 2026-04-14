import instance from "../axios";
import {
	CreateTaskDto,
	CreateTaskResponse,
	UpdateTaskDto,
	UpdateTaskResponse,
} from "./type";

export const findAllTaskApi = async (
	workspaceId: string,
	projectId: string,
): Promise<any> => {
	const response = await instance.get(
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
	console.log("🚀 ~ response~", response);

	return response.data;
};
