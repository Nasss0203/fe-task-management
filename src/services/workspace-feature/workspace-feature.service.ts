import instance from "../axios";
import {
	FindWorkspaceFeaturesResponse,
	UpdateWorkspaceFeaturePayload,
	UpdateWorkspaceFeatureResponse,
} from "./type";

export const findWorkspaceFeaturesApi = async (
	workspaceId: string,
): Promise<FindWorkspaceFeaturesResponse> => {
	const response = await instance.get<FindWorkspaceFeaturesResponse>(
		`/workspaces/${workspaceId}/features`,
	);

	return response.data;
};

export const updateWorkspaceFeatureApi = async ({
	workspaceId,
	featureCode,
	enabled,
}: UpdateWorkspaceFeaturePayload): Promise<UpdateWorkspaceFeatureResponse> => {
	const response = await instance.patch<UpdateWorkspaceFeatureResponse>(
		`/workspaces/${workspaceId}/features/${encodeURIComponent(featureCode)}`,
		{ enabled },
	);

	return response.data;
};
