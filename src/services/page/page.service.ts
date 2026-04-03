import instance from "../axios";
import { FindPageByWorkspaceResponse } from "./type";

export const findPage = async (
	workspaceId: string,
): Promise<FindPageByWorkspaceResponse> => {
	const response = await instance.get<FindPageByWorkspaceResponse>(
		`/page/workspace/${workspaceId}`,
	);
	return response.data;
};
