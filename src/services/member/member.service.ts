import instance from "../axios";
import { FindAllMemberResponse } from "./type";

export const findAllMemberApi = async (
	workspaceId: string,
): Promise<FindAllMemberResponse> => {
	const response = await instance.get<FindAllMemberResponse>(
		`/workspace-members/${workspaceId}/members`,
	);
	return response.data;
};
