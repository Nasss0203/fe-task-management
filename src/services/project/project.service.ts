import instance from "../axios";

export const findProjectByWorkspaceIdApi = async (
	workspaceId: string,
): Promise<any> => {
	const response = await instance.get<any>(
		`/projects/workspace/${workspaceId}`,
	);
	return response.data;
};
