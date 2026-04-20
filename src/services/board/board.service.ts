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

export const CreateBoardAndAttachToPage = async (data: CreateBoarDto) => {
	const response = await instance.post<any>(
		"/boards/create-and-attach",
		data,
	);
	console.log("🚀 ~ response~", response);
	return response.data;
};
