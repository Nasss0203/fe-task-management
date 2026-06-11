export enum WORKSPACE_TEMPLATE_KEY {
	WORKSPACE_TEMPLATE = "workspace-template",
}

export enum TemplateStatus {
	DRAFT = "DRAFT",
	PUBLISHED = "PUBLISHED",
	ARCHIVED = "ARCHIVED",
}

export enum TemplateVisibility {
	PRIVATE = "PRIVATE",
	WORKSPACE = "WORKSPACE",
	PUBLIC = "PUBLIC",
}

export interface WorkspaceTemplateItem {
	id: string;
	name: string;
	description: string | null;
	category: string | null;
	coverUrl: string | null;
	isSystem: boolean;
	status: TemplateStatus;
	visibility: TemplateVisibility;
	createdBy: string | null;
	workspaceId: string | null;
	useCount: number;
	likesCount: number;
	createdAt: string;
	updatedAt: string;
}

export interface FindAllWorkspaceTemplateResponse {
	data: WorkspaceTemplateItem[];
}
