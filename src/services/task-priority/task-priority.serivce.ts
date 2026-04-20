import instance from "../axios";

export const findAllTaskPriorityStatusApi = async (
	workspaceId: string,
	projectId: string,
): Promise<any> => {
	const response = await instance.get(
		`/task-status/workspace/${workspaceId}/project/${projectId}`,
	);

	return response.data;
};
