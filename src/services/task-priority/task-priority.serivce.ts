import instance from "../axios";

export const findAllTaskPriorityApi = async (
	workspaceId: string,
	projectId: string,
): Promise<any> => {
	const response = await instance.get(
		`/task-priority/workspaces/${workspaceId}/projects/${projectId}`,
	);

	return response.data;
};
