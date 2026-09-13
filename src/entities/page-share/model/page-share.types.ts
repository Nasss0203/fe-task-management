export type PageShareAccessLevel =
	| "VIEWER"
	| "COMMENTER"
	| "EDITOR"
	| "FULL_ACCESS";

export interface SharedPage {
	id: string;
	workspace_id: string;
	teamspace_id: string | null;
	parent_page_id: string | null;
	title: string;
	slug: string | null;
	icon: string | null;
	cover_url: string | null;
	accessLevel: PageShareAccessLevel;
}

export interface PageShareLink {
	id: string;
	pageId: string;
	token: string;
	expiresAt: string | null;
	createdAt: string;
}

/**
 * General Access model mới.
 *
 * null = nguồn access đó đang tắt.
 */
export interface PageShareSetting {
	workspaceAccessLevel: PageShareAccessLevel | null;
	linkAccessLevel: PageShareAccessLevel | null;
}

export interface PageAccess {
	effectiveAccessLevel: PageShareAccessLevel | null;
}

export interface PageShareMemberUser {
	id: string;
	username: string | null;
	displayName: string | null;
	email: string;
	avatarUrl: string | null;
}

/** GET candidates returns the same user fields as a share's nested user. */
export type PageShareCandidate = PageShareMemberUser;

export interface PageShareMember {
	id: string;
	userId: string;
	accessLevel: PageShareAccessLevel;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
	user: PageShareMemberUser;
}

/** POST/PATCH page-shares return the share without the nested user. */
export type PageShareRecord = Omit<PageShareMember, "user">;

export interface SharePagePayload {
	user_id: string;
	access_level: PageShareAccessLevel;
}

export interface UpdatePageShareSettingPayload {
	workspace_access_level?: PageShareAccessLevel | null;

	link_access_level?: PageShareAccessLevel | null;
}
