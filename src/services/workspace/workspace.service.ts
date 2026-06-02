import axios from "axios";
import instance from "../axios";
import {
	CreateWorkspaceResponse,
	FindAllWorkspaceResponse,
	FindOneWorkspaceResponse,
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
