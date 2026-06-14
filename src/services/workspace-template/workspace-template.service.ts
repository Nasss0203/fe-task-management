import instance from "../axios";
import {
	PaginatedWorkspaceTemplateResponse,
	SaveWorkspaceAsTemplateDto,
	WORKSPACE_TEMPLATE_KEY,
	UpdateWorkspaceTemplateDto,
} from "./type";

export const getWorkspaceTemplatesApi = async (params?: {
	ownedByMe?: boolean;
	status?: string;
	visibility?: string;
	page?: number;
	limit?: number;
}): Promise<PaginatedWorkspaceTemplateResponse> => {
	const response = await instance.get<PaginatedWorkspaceTemplateResponse>(
		"/workspace-templates",
		{ params }
	);
	return response.data;
};

export const getWorkspaceTemplateByIdApi = async (id: string) => {
	const response = await instance.get(`/workspace-templates/${id}`);
	return response.data;
};

export const saveWorkspaceAsTemplateApi = async ({
	workspaceId,
	data,
}: {
	workspaceId: string;
	data: SaveWorkspaceAsTemplateDto;
}) => {
	const response = await instance.post(
		`/workspaces/${workspaceId}/templates`,
		data
	);
	return response.data;
};

export const updateWorkspaceTemplateApi = async ({
	id,
	data,
}: {
	id: string;
	data: UpdateWorkspaceTemplateDto;
}) => {
	const response = await instance.patch(`/workspace-templates/${id}`, data);
	return response.data;
};

export const deleteWorkspaceTemplateApi = async (id: string) => {
	const response = await instance.delete(`/workspace-templates/${id}`);
	return response.data;
};
