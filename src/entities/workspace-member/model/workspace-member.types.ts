export type WorkspaceMembershipType = "MEMBER" | "GUEST";

export type WorkspaceMemberRole = "OWNER" | "MEMBER";

export interface WorkspacePerson {
	id: string;

	workspace_id: string;
	user_id: string;

	full_name: string;
	email: string;
	avatar_url: string | null;

	membership_type: WorkspaceMembershipType;

	role_name: WorkspaceMemberRole | null;

	joinedAt: string | null;
	lastOpenedAt: string | null;
}
