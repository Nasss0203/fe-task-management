import instance from "../axios";

export const findAllTaskStatusApi = async (
	workspaceId: string,
	projectId: string,
): Promise<any> => {
	const response = await instance.get(
		`/task-status/workspace/${workspaceId}/project/${projectId}`,
	);
	console.log("🚀 ~ response~", response);

	return response.data;
};
