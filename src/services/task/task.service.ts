import instance from "../axios";

export const findAllTask = async (
	workspaceId: string,
	projectId: string,
): Promise<any> => {
	const response = await instance.get(
		`/tasks/workspace/${workspaceId}/project/${projectId}`,
	);
	return response.data;
};
