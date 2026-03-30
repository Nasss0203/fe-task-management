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

export interface WorkspaceDto {
	name: string;
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
