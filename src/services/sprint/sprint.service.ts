import instance from "../axios";

export const findAllSprintApi = async (
	workspaceId: string,
	projectId: string,
): Promise<any> => {
	const response = await instance.get<any>(
		`/sprints/workspaces/${workspaceId}/projects/${projectId}`,
	);
	console.log("🚀 ~ response~", response);
	return response.data;
};

export const findTasksBySprintApi = async (
	workspaceId: string,
	projectId: string,
	sprintId: string,
) => {
	const response = await instance.get<any>(
		`/sprints/workspaces/${workspaceId}/projects/${projectId}/sprints/${sprintId}/tasks`,
	);
	console.log("🚀 ~ response~", response);
	return response.data;
};
