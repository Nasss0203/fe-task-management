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

export type TeamspaceInvitationStatus =
	| "PENDING"
	| "ACCEPTED"
	| "DECLINED"
	| "REVOKED"
	| "EXPIRED";

export interface TeamspaceInvitation {
	id: string;

	teamspaceId: string;

	status: TeamspaceInvitationStatus;

	expiresAt: string;

	acceptedAt: string | null;

	createdAt: string;
}

/** An invitation as seen by teamspace managers (GET /teamspaces/:id/invitations). */
export interface TeamspaceInvitationManagement extends TeamspaceInvitation {
	workspaceMemberId: string;

	invitedBy: string | null;

	updatedAt: string;
}

export interface ListTeamspaceInvitationsResponse {
	items: TeamspaceInvitationManagement[];

	total: number;

	page: number;

	limit: number;
}

export type TeamspaceInviteLinkStatus =
	| "ACTIVE"
	| "REVOKED"
	| "EXPIRED"
	| "EXHAUSTED";

export interface TeamspaceInviteLink {
	id: string;

	teamspaceId: string;

	createdBy: string | null;

	createdAt: string;

	expiresAt: string;

	maxUses: number | null;

	useCount: number;

	revokedAt: string | null;

	status: TeamspaceInviteLinkStatus;
}

/** Only returned once, on creation: the raw token is never listed again. */
export interface CreatedTeamspaceInviteLink extends TeamspaceInviteLink {
	token: string;

	url: string | null;

	relativePath: string;
}

export interface CreateTeamspaceInviteLinkInput {
	expires_at?: string;

	max_uses?: number;
}

export interface DiscoverTeamspaceItem {
	id: string;

	workspaceId: string;

	name: string;

	description: string | null;

	visibility: TeamspaceVisibility;

	isMember: boolean;
}

export interface DiscoverTeamspacesResponse {
	items: DiscoverTeamspaceItem[];

	total: number;

	page: number;

	limit: number;
}

/** An invitation addressed to the current user (GET /teamspaces/invitations/me). */
export interface MyTeamspaceInvitation extends TeamspaceInvitation {
	teamspaceName: string;

	teamspaceIcon: string | null;

	workspaceId: string;

	workspaceName: string;

	inviterName: string | null;
}
