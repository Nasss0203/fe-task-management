export enum WORKSPACE_KEY {
	WORKSPACE = "workspace",
	WORKSPACE_TRASH = "workspace-trash",
}

export enum WorkspaceLayoutMode {
	TABS = "tabs",
	BLOCKS = "blocks",
}

export interface WorkspaceItem {
	id: string;
	name: string;
	slug: string;
	planType: string;
	layoutMode: WorkspaceLayoutMode;
	createdAt: string;
	updatedAt: string;
	deletedAt?: string | null;
	deletedBy?: string | null;
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

export interface FindDeletedWorkspaceResponse {
	data: WorkspaceItem[];
}

export interface UpdateWorkspaceLayoutModeDto {
	layoutMode: WorkspaceLayoutMode;
}
