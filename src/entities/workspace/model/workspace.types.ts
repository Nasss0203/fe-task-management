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

export type WorkspaceMembershipType = "MEMBER" | "GUEST";

export type WorkspaceRole = "OWNER" | "MEMBER";

export interface WorkspaceAccess {
	user_id: string;
	workspace_id: string;
	membership_type: WorkspaceMembershipType;
	roles: WorkspaceRole[];
	permissions: string[];
}
