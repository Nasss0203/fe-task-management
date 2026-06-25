import instance from "../axios";
import { ApiResponse } from "../types";
import {
	CancelSprintParams,
	CompleteSprintParams,
	CreateSprintDto,
	DeleteSprintParams,
	FindAllSprintResponse,
	SprintItem,
	SprintParams,
	StartSprintParams,
	UpdateSprintParams,
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
	const { workspaceId, projectId, ...rest } = data;

	const response = await instance.post<any>(
		`/sprints/workspaces/${workspaceId}/projects/${projectId}`,
		rest,
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

export const updateSprintApi = async (params: UpdateSprintParams) => {
	const { workspaceId, projectId, sprintId, data } = params;

	const response = await instance.patch<any>(
		`/sprints/workspaces/${workspaceId}/projects/${projectId}/sprint/${sprintId}`,
		data,
	);

	return response.data;
};

export const cancelSprintApi = async (params: CancelSprintParams) => {
	const { workspaceId, projectId, sprintId } = params;

	const response = await instance.patch<any>(
		`/sprints/workspaces/${workspaceId}/projects/${projectId}/sprints/${sprintId}/cancel`,
	);

	return response.data;
};

export const deleteSprintApi = async (params: DeleteSprintParams) => {
	const { workspaceId, projectId, sprintId } = params;

	const response = await instance.delete<any>(
		`/sprints/workspaces/${workspaceId}/projects/${projectId}/sprints/${sprintId}`,
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

		return data;
	},
};
