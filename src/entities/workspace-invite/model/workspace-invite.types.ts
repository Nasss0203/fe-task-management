export type InviteRecipientType = "USER" | "EMAIL";

export type WorkspaceInviteRole = "OWNER" | "MEMBER";

export interface InviteRecipientPayload {
	type: InviteRecipientType;

	user_id?: string;

	email?: string;
}

export interface CreateWorkspaceInvitePayload {
	role_name: WorkspaceInviteRole;

	recipients: InviteRecipientPayload[];
}

export type InviteSuggestionType = "USER" | "EMAIL";

export type InviteSuggestionStatus =
	| "CAN_INVITE"
	| "GUEST"
	| "MEMBER"
	| "PENDING_INVITE";

export interface InviteSuggestion {
	type: InviteSuggestionType;

	user_id: string | null;

	username: string | null;

	email: string;

	full_name: string | null;

	avatar_url: string | null;

	status: InviteSuggestionStatus;
}
