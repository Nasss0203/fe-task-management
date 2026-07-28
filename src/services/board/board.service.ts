import instance from "../axios";
import { ApiResponse } from "../types";
import { BoardItem, CreateBoarDto, DeleteBoardDto } from "./type";

export const findAllBoard = async (
	workspaceId: string,
	projectId: string,
) : Promise<ApiResponse<BoardItem[]>> => {
	const response = await instance.get<ApiResponse<BoardItem[]>>(
		`/boards/workspace/${workspaceId}/project/${projectId}`,
	);
	return response.data;
};

export const findBoardById = async (
	boardId: string,
): Promise<ApiResponse<BoardItem>> => {
	const response = await instance.get<ApiResponse<BoardItem>>(`/boards/${boardId}`);
	return response.data;
};

export const createBoardApi = async (data: CreateBoarDto) => {
	if (data.blockId) {
		const response = await instance.post<ApiResponse<BoardItem>>(
			"/boards/create-and-attach",
			data,
		);
		return response.data;
	} else {
		const response = await instance.post<ApiResponse<BoardItem>>("/boards", data);
		return response.data;
	}
};

export const deleteBoardApi = async ({
	boardId,
	projectId,
	workspaceId,
}: DeleteBoardDto) => {
	const response = await instance.delete(
		`/boards/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}`,
	);
	return response.data;
};
