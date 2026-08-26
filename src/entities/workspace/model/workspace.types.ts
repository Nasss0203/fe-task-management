export interface Workspace {
	id: string;
	name: string;
	slug: string;
	layoutMode: any;

	createdAt: string;
	updatedAt: string;

	deletedAt: string | null;
	deletedBy: string | null;
	createdBy: string | null;
}

export interface WorkspaceAccess {
	user_id: string;
	workspace_id: string;
	roles: string[];
	permissions: string[];
}
