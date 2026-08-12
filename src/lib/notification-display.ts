import {
	NotificationItem,
	NotificationMetadata,
	NotificationType,
} from "@/services/notification/type";

type NotificationDisplaySource = Pick<
	NotificationItem,
	"type" | "title" | "message" | "metadata"
>;

type NotificationDisplay = {
	title: string;
	message: string | null;
};

const getStringMetadata = (
	metadata: NotificationMetadata | null,
	key: string,
) => {
	const value = metadata?.[key];

	return typeof value === "string" && value.trim()
		? value.trim()
		: undefined;
};

const getWorkspaceNameFromInviteMessage = (message: string | null) => {
	if (!message) return undefined;

	const directInviteMatch = message.match(
		/^You have been invited to join\s+(.+?)\.?$/i,
	);
	const inviterInviteMatch = message.match(
		/^(.+?)\s+invited you to join\s+(.+?)\.?$/i,
	);

	return directInviteMatch?.[1]?.trim() ?? inviterInviteMatch?.[2]?.trim();
};

const getInviterNameFromInviteMessage = (message: string | null) => {
	if (!message) return undefined;

	const match = message.match(/^(.+?)\s+invited you to join\s+(.+?)\.?$/i);

	return match?.[1]?.trim();
};

const getWorkspaceInviteDisplay = (
	notification: NotificationDisplaySource,
): NotificationDisplay => {
	const workspaceName =
		getStringMetadata(notification.metadata, "workspaceName") ??
		getStringMetadata(notification.metadata, "workspace_name") ??
		getWorkspaceNameFromInviteMessage(notification.message);
	const inviterName =
		getStringMetadata(notification.metadata, "inviterName") ??
		getStringMetadata(notification.metadata, "invitedByName") ??
		getStringMetadata(notification.metadata, "invited_by_name") ??
		getInviterNameFromInviteMessage(notification.message);

	return {
		title: "Lời mời tham gia workspace",
		message:
			inviterName && workspaceName
				? `${inviterName} đã mời bạn tham gia workspace ${workspaceName}.`
				: workspaceName
					? `Bạn được mời tham gia workspace ${workspaceName}.`
					: "Bạn được mời tham gia workspace này.",
	};
};

export const getNotificationDisplay = (
	notification: NotificationDisplaySource,
): NotificationDisplay => {
	if (notification.type === NotificationType.WORKSPACE_INVITE) {
		return getWorkspaceInviteDisplay(notification);
	}

	return {
		title: notification.title || "Bạn có thông báo mới.",
		message: notification.message,
	};
};
