export enum NotificationSenderType {
	SYSTEM = "SYSTEM",
	USER = "USER",
}

export enum NotificationSourceType {
	SYSTEM = "SYSTEM",
	ACCOUNT = "ACCOUNT",
	WORKSPACE = "WORKSPACE",
	PROJECT = "PROJECT",
	TASK = "TASK",
	SPRINT = "SPRINT",
	COMMENT = "COMMENT",
}

export enum NotificationType {
	SYSTEM_ANNOUNCEMENT = "SYSTEM_ANNOUNCEMENT",
	SYSTEM_MAINTENANCE = "SYSTEM_MAINTENANCE",
	ACCOUNT_SECURITY = "ACCOUNT_SECURITY",
	PASSWORD_CHANGED = "PASSWORD_CHANGED",
	EMAIL_VERIFIED = "EMAIL_VERIFIED",

	WORKSPACE_INVITE = "WORKSPACE_INVITE",
	WORKSPACE_INVITE_ACCEPTED = "WORKSPACE_INVITE_ACCEPTED",
	WORKSPACE_MEMBER_JOINED = "WORKSPACE_MEMBER_JOINED",
	WORKSPACE_MEMBER_REMOVED = "WORKSPACE_MEMBER_REMOVED",

	PROJECT_CREATED = "PROJECT_CREATED",
	PROJECT_UPDATED = "PROJECT_UPDATED",

	TASK_ASSIGNED = "TASK_ASSIGNED",
	TASK_UPDATED = "TASK_UPDATED",
	TASK_DUE_SOON = "TASK_DUE_SOON",
	TASK_OVERDUE = "TASK_OVERDUE",

	SPRINT_STARTED = "SPRINT_STARTED",
	SPRINT_COMPLETED = "SPRINT_COMPLETED",

	COMMENT_MENTION = "COMMENT_MENTION",
	COMMENT_REPLY = "COMMENT_REPLY",
}

export type NotificationMetadata = {
	workspaceName?: string;
	projectName?: string;
	taskTitle?: string;
	inviteId?: string;
	inviteToken?: string;
	[key: string]: any;
};

export type NotificationItem = {
	id: string;

	receiverId: string;

	senderType: NotificationSenderType;
	actorId: string | null;

	sourceType: NotificationSourceType;

	workspaceId: string | null;
	projectId: string | null;
	taskId: string | null;
	sprintId: string | null;
	commentId: string | null;

	type: NotificationType;

	title: string;
	message: string | null;
	actionUrl: string | null;

	metadata: NotificationMetadata | null;

	readAt: string | null;
	archivedAt: string | null;

	createdAt: string;
	updatedAt: string;
};

export type FindNotificationParams = {
	unreadOnly?: boolean;

	sourceType?: NotificationSourceType;
	type?: NotificationType;

	workspaceId?: string;
	projectId?: string;
	taskId?: string;

	cursor?: string;
	limit?: number;
};

export type FindNotificationResponse = {
	data: NotificationItem[];
	nextCursor?: string | null;
};
