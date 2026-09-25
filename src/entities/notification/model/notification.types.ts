export type NotificationSenderType = "SYSTEM" | "USER";

export type NotificationSourceType =
	| "system"
	| "account"
	| "workspace"
	| "page"
	| "page_block"
	| "comment";

export type NotificationType =
	| "system.announcement"
	| "system.maintenance"
	| "account.security"
	| "account.password_changed"
	| "account.email_verified"
	| "workspace.invite"
	| "workspace.invite_accepted"
	| "workspace.member_joined"
	| "workspace.member_removed"
	| "page.access.requested"
	| "page.access.approved"
	| "page.access.rejected"
	| "comment.mentioned"
	| "comment.replied";

export interface Notification {
	id: string;
	receiverId: string;

	senderType: NotificationSenderType;
	actorId: string | null;

	sourceType: NotificationSourceType;
	sourceId: string | null;

	workspaceId: string | null;

	type: NotificationType;

	title: string;
	message: string | null;
	actionUrl: string | null;

	metadata: Record<string, unknown> | null;

	readAt: string | null;
	archivedAt: string | null;

	createdAt: string;
	updatedAt: string;
}

export interface NotificationUnreadCount {
	count: number;
}

export interface NotificationFilters {
	unreadOnly?: boolean;
	sourceType?: NotificationSourceType;
	type?: NotificationType;
	workspaceId?: string;
	limit?: number;
}
