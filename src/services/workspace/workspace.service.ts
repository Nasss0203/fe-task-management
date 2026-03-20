import instance from "../axios";
import { WorkspaceDto, WorkspaceResonse } from "./type";

export const createWorkspaceApi = async (
	data: WorkspaceDto,
): Promise<WorkspaceResonse> => {
	const response = await instance.post<WorkspaceResonse>("/workspaces", data);
	return response.data;
};

export const findAllWorkspaceApi = async (): Promise<WorkspaceResonse> => {
	const response = await instance.get<WorkspaceResonse>("/workspaces");
	return response.data;
};
