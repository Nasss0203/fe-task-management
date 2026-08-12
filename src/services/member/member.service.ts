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

export const updateMemberRoleApi = async (
	workspaceId: string,
	userId: string,
	role_name: string,
): Promise<void> => {
	await instance.patch(`/workspace-members/${workspaceId}/members/${userId}`, {
		role_name,
	});
};

export const removeMemberApi = async (
	workspaceId: string,
	userId: string,
): Promise<void> => {
	await instance.delete(`/workspace-members/${workspaceId}/members/${userId}`);
};

export const leaveWorkspaceApi = async (workspaceId: string): Promise<void> => {
	await instance.delete(`/workspace-members/${workspaceId}/members/me`);
};
