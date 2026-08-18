export interface WorkspaceTemplateDto {
	id: string;
	name: string;
	description?: string;
	category?: string;
	isSystem: boolean;
	status: string;
	visibility: string;
	createdBy?: string;
	workspaceId?: string;
	createdAt: string;
	updatedAt: string;
}

export interface PaginatedWorkspaceTemplateResponse {
	statusCode: number;
	message: string;
	data: {
		data: WorkspaceTemplateDto[];
		total: number;
		page: number;
		pageSize: number;
		totalPages: number;
	};
}

export const LANDING_TEMPLATE_QUERY_KEY = {
	TEMPLATES: "workspace-templates",
	TEMPLATE_DETAIL: "workspace-template-detail",
};
