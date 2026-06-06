import instance from "../axios";
import {
	CreateProjectResponse,
	DeleteProjectResponse,
	FindAllProjectResponse,
	FindDeletedProjectResponse,
	ProjectDto,
} from "./type";

export const findProjectByWorkspaceIdApi = async (
	workspaceId: string,
): Promise<FindAllProjectResponse> => {
	const response = await instance.get<FindAllProjectResponse>(
		`/projects/workspace/${workspaceId}`,
	);
	return response.data;
};

export const CreateProjectApi = async (
	data: ProjectDto,
): Promise<CreateProjectResponse> => {
	const response = await instance.post<CreateProjectResponse>(
		"/projects",
		data,
	);
	return response.data;
};

export const deleteProjectApi = async ({
	workspaceId,
	projectId,
}: {
	workspaceId: string;
	projectId: string;
}): Promise<DeleteProjectResponse> => {
	const response = await instance.delete<DeleteProjectResponse>(
		`/projects/workspaces/${workspaceId}/projects/${projectId}`,
	);

	return response.data;
};

export const findDeletedProjectsApi = async (
	workspaceId: string,
): Promise<FindDeletedProjectResponse> => {
	const response = await instance.get<FindDeletedProjectResponse>(
		"/projects/trash",
		{
			params: {
				workspaceId,
			},
		},
	);

	return response.data;
};

export const restoreProjectApi = async ({
	workspaceId,
	projectId,
}: {
	workspaceId: string;
	projectId: string;
}): Promise<DeleteProjectResponse> => {
	const response = await instance.patch<DeleteProjectResponse>(
		`/projects/workspaces/${workspaceId}/projects/${projectId}/restore`,
	);

	return response.data;
};
