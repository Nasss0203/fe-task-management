export interface Workspace {
	id: string;
	name: string;
	slug: string;
	icon?: string | null;
	layoutMode: any;

	createdAt: string;
	updatedAt: string;

	deletedAt: string | null;
	deletedBy: string | null;
	createdBy: string | null;
}

export type WorkspaceStarter =
	| "blank"
	| "personal"
	| "team-wiki"
	| "project-planner";

export interface CreateWorkspaceInput {
	name?: string;
	starter?: WorkspaceStarter;
}

export interface WorkspaceStarterBlock {
	id: string;
	type: string;
	content: Record<string, unknown> | null;
	style_config: Record<string, unknown> | null;
}

export interface WorkspaceStarterPage {
	title: string;
	icon: string;
	blocks: WorkspaceStarterBlock[];
}

export interface WorkspaceStarterDefinition {
	key: WorkspaceStarter;
	title: string;
	description: string;
	icon: string;
	defaultName: string;
	pages: WorkspaceStarterPage[];
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
