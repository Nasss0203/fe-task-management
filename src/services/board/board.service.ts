import instance from "../axios";
import { CreateBoarDto } from "./type";

export const findAllBoard = async (
	workspaceId: string,
	projectId: string,
): Promise<any> => {
	const response = await instance.get(
		`/boards/workspace/${workspaceId}/project/${projectId}`,
	);
	return response.data;
};

export const findBoardById = async (boardId: string): Promise<any> => {
	const response = await instance.get(`/boards/${boardId}`);
	return response.data;
};

export const createBoardApi = async (data: CreateBoarDto) => {
	if (data.blockId) {
		const response = await instance.post<any>("/boards/create-and-attach", data);
		return response.data;
	} else {
		const response = await instance.post<any>("/boards", data);
		return response.data;
	}
};
