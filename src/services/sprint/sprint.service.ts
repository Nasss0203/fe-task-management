import instance from "../axios";
import { ApiResponse } from "../types";
import {
	CompleteSprintParams,
	CreateSprintDto,
	FindAllSprintResponse,
	SprintItem,
	SprintParams,
	StartSprintParams,
} from "./type";

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
	const { workspaceId, projectId, name } = data;

	const response = await instance.post<any>(
		`/sprints/workspaces/${workspaceId}/projects/${projectId}`,
		{
			...(name?.trim() && { name: name.trim() }),
		},
	);

	return response.data;
};

export const startSprintApi = async (params: StartSprintParams) => {
	const { workspaceId, projectId, sprintId, data } = params;

	const response = await instance.patch<any>(
		`/sprints/workspaces/${workspaceId}/projects/${projectId}/sprints/${sprintId}/start`,
		data ?? {},
	);

	return response.data;
};

export const completeSprintApi = async (params: CompleteSprintParams) => {
	const { workspaceId, projectId, sprintId } = params;

	const response = await instance.patch<any>(
		`/sprints/workspaces/${workspaceId}/projects/${projectId}/sprints/${sprintId}/complete`,
	);

	return response.data;
};

export const findSprint = {
	findSprintDetail: async (
		param: SprintParams,
	): Promise<ApiResponse<SprintItem>> => {
		const { projectId, sprintId, workspaceId } = param;
		const { data } = await instance.get<ApiResponse<SprintItem>>(
			`/sprints/workspaces/${workspaceId}/projects/${projectId}/sprint/${sprintId}/detail`,
		);
		console.log("🚀 ~ sprint~", data);

		return data;
	},
};
