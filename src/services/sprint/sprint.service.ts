import instance from "../axios";
import { ApiResponse } from "../types";
import { CreateSprintDto, FindAllSprintResponse } from "./type";

export const findAllSprintApi = async (
	workspaceId: string,
	projectId: string,
): Promise<ApiResponse<FindAllSprintResponse[]>> => {
	const response = await instance.get<ApiResponse<FindAllSprintResponse[]>>(
		`/sprints/workspaces/${workspaceId}/projects/${projectId}`,
	);
	return response.data;
};

export const findTasksBySprintApi = async (
	workspaceId: string,
	projectId: string,
	sprintId: string,
) => {
	const response = await instance.get<any>(
		`/sprints/workspaces/${workspaceId}/projects/${projectId}/sprints/${sprintId}/tasks`,
	);
	return response.data;
};

export const createSprintApi = async (data: CreateSprintDto) => {
	const response = await instance.post<any>(
		`/sprints/workspaces/${data.workspaceId}/projects/${data.projectId}`,
	);
	return response.data;
};
