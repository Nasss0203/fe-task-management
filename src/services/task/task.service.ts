import instance from "../axios";

export const findAllTask = async (
	workspaceId: string,
	projectId: string,
	boardId: string,
): Promise<any> => {
	const response = await instance.get(
		`/tasks/workspace/${workspaceId}/project/${projectId}/board/${boardId}`,
	);
	return response.data;
};
