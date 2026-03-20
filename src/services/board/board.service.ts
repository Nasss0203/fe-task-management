import instance from "../axios";

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
