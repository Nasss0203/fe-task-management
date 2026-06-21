export enum WORKSPACE_KEY {
	WORKSPACE = "workspace",
	WORKSPACE_TRASH = "workspace-trash",
	WORKSPACE_ACCESS = "workspace-access",
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
	createdBy?: string | null;
}



export interface WorkspaceDto {
	name: string;
	templateId?: string;
}

export interface UpdateWorkspaceDto {
	name?: string;
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
