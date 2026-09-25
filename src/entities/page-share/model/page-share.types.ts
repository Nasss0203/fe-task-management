export type PageShareAccessLevel =
	| "VIEWER"
	| "COMMENTER"
	| "EDITOR"
	| "FULL_ACCESS";

/**
 * Share Link hiện chỉ hỗ trợ:
 *
 * - VIEWER
 * - EDITOR
 *
 * COMMENTER / FULL_ACCESS không dùng cho link access.
 */
export type PageShareLinkAccessLevel = Extract<
	PageShareAccessLevel,
	"VIEWER" | "EDITOR"
>;

export type PageShareStatus = "PENDING" | "ACCEPTED" | "REJECTED";

/**
 * Page được share trực tiếp với current user.
 *
 * GET /page-shares/shared-with-me
 */
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

/**
 * Kết quả khi tạo / lấy stable Share Link.
 *
 * POST /page/:pageId/share-links
 */
export interface PageShareLink {
	token: string;

	expiresAt: string | null;
}

/**
 * Invitation trực tiếp của current user
 * được trả về khi resolve Share Link.
 *
 * Đây là PageShare cũ/direct invitation,
 * KHÔNG phải PageAccessRequest.
 */
export interface ResolvedPageShareInvitation {
	shareId: string;

	accessLevel: PageShareAccessLevel;

	status: PageShareStatus;
}

export interface PageShareInvitationResult {
	pageId: string;
	shareId: string;
}

/**
 * Kết quả resolve:
 *
 * GET /page/share/:token
 */
export interface ResolvedPageShareLink {
	/**
	 * Page được Share Link trỏ tới.
	 */
	pageId: string;

	/**
	 * null:
	 * Only people invited
	 *
	 * VIEWER / EDITOR:
	 * Anyone with the link.
	 */
	linkAccessLevel: PageShareLinkAccessLevel | null;

	/**
	 * Direct PageShare invitation của current user.
	 *
	 * Khi link access đang bật,
	 * backend hiện trả invitation = null.
	 */
	invitation: ResolvedPageShareInvitation | null;
}

/**
 * General Access setting của Page.
 *
 * workspaceAccessLevel:
 * - null
 * - VIEWER
 * - COMMENTER
 * - EDITOR
 * - FULL_ACCESS
 *
 * linkAccessLevel:
 * - null
 * - VIEWER
 * - EDITOR
 */
export interface PageShareSetting {
	workspaceAccessLevel: PageShareAccessLevel | null;

	linkAccessLevel: PageShareLinkAccessLevel | null;
}

/**
 * Effective normal access của current user.
 *
 * GET /page/:pageId/access
 *
 * Không bao gồm quyền đến từ Share Link token.
 */
export interface PageAccess {
	effectiveAccessLevel: PageShareAccessLevel | null;
}

/**
 * User information được trả kèm PageShare.
 */
export interface PageShareMemberUser {
	id: string;

	username: string | null;

	displayName: string | null;

	email: string;

	avatarUrl: string | null;
}

/**
 * GET candidates trả cùng user fields
 * với nested user của PageShare.
 */
export type PageShareCandidate = PageShareMemberUser;

/**
 * Một user đang có direct PageShare.
 */
export interface PageShareMember {
	id: string;

	userId: string;

	accessLevel: PageShareAccessLevel;

	createdBy: string;

	createdAt: string;

	updatedAt: string;

	user: PageShareMemberUser;
}

/**
 * POST / PATCH PageShare trả share record
 * nhưng không có nested user.
 */
export type PageShareRecord = Omit<PageShareMember, "user">;

/**
 * Payload tạo direct PageShare.
 */
export interface SharePagePayload {
	user_id: string;

	access_level: PageShareAccessLevel;
}

/**
 * Payload update General Access.
 *
 * undefined = không thay đổi
 * null      = tắt nguồn access
 */
export interface UpdatePageShareSettingPayload {
	workspace_access_level?: PageShareAccessLevel | null;

	link_access_level?: PageShareLinkAccessLevel | null;
}
