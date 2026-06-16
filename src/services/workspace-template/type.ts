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

export interface SaveWorkspaceAsTemplateDto {
	name: string;
	description?: string;
	category?: string;
	visibility?: "PRIVATE" | "WORKSPACE" | "PUBLIC";
}

export interface UpdateWorkspaceTemplateDto {
	name?: string;
	description?: string;
	category?: string;
	visibility?: "PRIVATE" | "WORKSPACE" | "PUBLIC";
}

export const WORKSPACE_TEMPLATE_KEY = {
	TEMPLATES: "workspace-templates",
	TEMPLATE_DETAIL: "workspace-template-detail",
};
