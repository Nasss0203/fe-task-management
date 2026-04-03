import instance from "../axios";
import {
	CreateProjectResponse,
	FindAllProjectResponse,
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
