export type TeamspaceVisibility = "OPEN" | "PRIVATE";

export type TeamspaceRole = "OWNER" | "MEMBER";

export interface Teamspace {
	id: string;

	workspaceId: string;

	name: string;

	description: string | null;

	icon: string | null;

	visibility: TeamspaceVisibility;

	createdAt: string;

	updatedAt: string;
}

export interface TeamspaceMember {
	id: string;

	teamspaceId: string;

	workspaceMemberId: string;

	roleName: TeamspaceRole;

	joinedAt: string;

	createdAt: string;

	updatedAt: string;
}

export interface CreateTeamspaceInput {
	workspaceId: string;

	name: string;

	description?: string | null;

	icon?: string | null;

	visibility: TeamspaceVisibility;
}

export interface AddTeamspaceMemberInput {
	workspace_member_id: string;

	role_name: TeamspaceRole;
}
