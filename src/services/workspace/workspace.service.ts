import axios from "axios";
import instance from "../axios";
import {
	CreateWorkspaceResponse,
	FindAllWorkspaceResponse,
	FindDeletedWorkspaceResponse,
	FindOneWorkspaceResponse,
	UpdateWorkspaceDto,
	UpdateWorkspaceLayoutModeDto,
	WorkspaceDto,
} from "./type";

export const createWorkspaceApi = async (
	data: WorkspaceDto,
): Promise<CreateWorkspaceResponse> => {
	try {
		const response = await instance.post<CreateWorkspaceResponse>(
			"/workspaces",
			data,
		);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const apiCode = error.response?.data?.code;

			if (apiCode === "WORKSPACE_LIMIT_EXCEEDED") {
				throw error;
			}
		}

		throw error;
	}
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

export const findDeletedWorkspacesApi =
	async (): Promise<FindDeletedWorkspaceResponse> => {
		const response =
			await instance.get<FindDeletedWorkspaceResponse>(
				"/workspaces/trash",
			);
		return response.data;
	};

export const updateWorkspaceLayoutModeApi = async ({
	workspaceId,
	data,
}: {
	workspaceId: string;
	data: UpdateWorkspaceLayoutModeDto;
}): Promise<FindOneWorkspaceResponse> => {
	const response = await instance.patch<FindOneWorkspaceResponse>(
		`/workspaces/${workspaceId}/layout-mode`,
		data,
	);

	return response.data;
};

export const updateWorkspaceApi = async ({
	workspaceId,
	data,
}: {
	workspaceId: string;
	data: UpdateWorkspaceDto;
}): Promise<FindOneWorkspaceResponse> => {
	const response = await instance.patch<FindOneWorkspaceResponse>(
		`/workspaces/${workspaceId}`,
		data,
	);

	return response.data;
};

export const softDeleteWorkspaceApi = async (
	workspaceId: string,
): Promise<FindOneWorkspaceResponse> => {
	const response = await instance.delete<FindOneWorkspaceResponse>(
		`/workspaces/${workspaceId}`,
	);

	return response.data;
};

export const restoreWorkspaceApi = async (
	workspaceId: string,
): Promise<FindOneWorkspaceResponse> => {
	const response = await instance.patch<FindOneWorkspaceResponse>(
		`/workspaces/${workspaceId}/restore`,
	);

	return response.data;
};

export const findWorkspaceAccessApi = async (
	workspaceId: string,
): Promise<any> => {
	const response = await instance.get<any>(
		`/workspaces/${workspaceId}/access`,
	);

	return response.data;
};

export const removeWorkspaceFromUserTrashApi = async (
	workspaceId: string,
): Promise<void> => {
	await instance.delete(`/workspaces/trash/${workspaceId}`);
};
