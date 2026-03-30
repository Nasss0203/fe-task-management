import instance from "../axios";
import {
	CreateWorkspaceResponse,
	FindAllWorkspaceResponse,
	FindOneWorkspaceResponse,
	WorkspaceDto,
} from "./type";

export const createWorkspaceMultiServiceApi = async (
	data: WorkspaceDto,
): Promise<CreateWorkspaceResponse> => {
	const response = await instance.post<CreateWorkspaceResponse>(
		"/workspaces",
		data,
	);
	return response.data;
};

export const createWorkspaceApi = async (
	data: WorkspaceDto,
): Promise<CreateWorkspaceResponse> => {
	const response = await instance.post<CreateWorkspaceResponse>(
		"/workspaces/v2",
		data,
	);
	return response.data;
};

export const findAllWorkspaceApi =
	async (): Promise<FindAllWorkspaceResponse> => {
		const response =
			await instance.get<FindAllWorkspaceResponse>("/workspaces");
		return response.data;
	};

export const findOneByWorkspaceIdApi = async (
	id: string,
): Promise<FindOneWorkspaceResponse> => {
	const response = await instance.get<FindOneWorkspaceResponse>(
		`/workspaces/${id}`,
	);
	return response.data;
};
