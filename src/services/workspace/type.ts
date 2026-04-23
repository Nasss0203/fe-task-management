export enum WORKSPACE_KEY {
	WORKSPACE = "workspace",
}
export interface WorkspaceItem {
	id: string;
	name: string;
	slug: string;
	planType: string;
	createdAt: string;
	updatedAt: string;
}

export type WorkspaceTemplateType =
	| "BLANK_PAGE"
	| "BLANK_DATABASE"
	| "TASK_TRACKER"
	| "PROJECT";

export interface WorkspaceDto {
	name: string;
	template: WorkspaceTemplateType;
}

export interface CreateWorkspaceResponse {
	data: WorkspaceItem;
}

export interface FindAllWorkspaceResponse {
	data: WorkspaceItem[];
}

export interface FindOneWorkspaceResponse {
	data: WorkspaceItem;
}
