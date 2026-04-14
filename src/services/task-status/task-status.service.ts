import instance from "../axios";

export const findAllTaskApiStatusApi = async (
	workspaceId: string,
	projectId: string,
): Promise<any> => {
	const response = await instance.get(
		`/task-status/workspace/${workspaceId}/project/${projectId}`,
	);

	return response.data;
};
