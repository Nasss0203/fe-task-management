import instance from "@/shared/api/api-client";
import type { PaginatedWorkspaceTemplateResponse } from "../model/landing-template.types";

export const getLandingTemplatesApi = async (params?: {
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

export const getLandingTemplateByIdApi = async (id: string) => {
	const response = await instance.get(`/workspace-templates/${id}`);
	return response.data;
};
