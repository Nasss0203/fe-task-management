import instance from "../axios";

export const findAllMemberApi = async (workspaceId: string): Promise<any> => {
	const response = await instance.get(
		`/workspace-members/${workspaceId}/members`,
	);
	return response.data;
};
