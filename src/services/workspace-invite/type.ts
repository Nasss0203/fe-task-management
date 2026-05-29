export enum InviteRecipientType {
	USER = "USER",
	EMAIL = "EMAIL",
}
export enum RoleName {
	OWNER = "OWNER",
	ADMIN = "ADMIN",
	MEMBER = "MEMBER",
}

export type InviteRecipient = {
	type: InviteRecipientType;
	user_id?: string;
	email?: string;
};

export type CreateWorkspaceInviteDto = {
	role_name: RoleName;
	recipients: InviteRecipient[];
};

export enum WorkspaceInviteStatus {
	PENDING = "PENDING",
	ACCEPTED = "ACCEPTED",
	REJECTED = "REJECTED",
	EXPIRED = "EXPIRED",
	REVOKED = "REVOKED",
}

export enum WorkspaceInviteType {
	EMAIL = "EMAIL",
	LINK = "LINK",
}

export type WorkspaceInviteResponse = {
	id: string;
	workspace_id: string;
	user_id: string | null;
	email: string | null;
	type: WorkspaceInviteType;
	role_name: RoleName;
	invited_by: string;
	token: string;
	status: WorkspaceInviteStatus;
	accepted_at: string | null;
	rejected_at?: string | null;
	expires_at: string;
	max_uses: number | null;
	used_count: number;
	created_at: string;
	updated_at: string;
};

export enum InviteSuggestionStatus {
	CAN_INVITE = "CAN_INVITE",
	MEMBER = "MEMBER",
	PENDING_INVITE = "PENDING_INVITE",
}

export enum InviteSuggestionType {
	USER = "USER",
	EMAIL = "EMAIL",
}

export type SearchInviteUserResponse = {
	type: InviteSuggestionType;
	user_id: string | null;
	username: string | null;
	email: string;
	full_name: string | null;
	avatar_url: string | null;
	status: InviteSuggestionStatus;
};
