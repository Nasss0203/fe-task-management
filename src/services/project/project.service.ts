import instance from "../axios";
import { FindAllProjectResponse } from "./type";

export const findProjectByWorkspaceIdApi = async (
	workspaceId: string,
): Promise<FindAllProjectResponse> => {
	const response = await instance.get<FindAllProjectResponse>(
		`/projects/workspace/${workspaceId}`,
	);
	return response.data;
};
