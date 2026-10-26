"use client";

import { getNotificationPresentation } from "@/entities/notification/lib/notification-presentation";
import type { Notification } from "@/entities/notification/model/notification.types";

import { NotificationItemShell } from "./notification-item-shell";
import { PageAccessRequestNotification } from "./page-access-request-notification";
import { PageEditRequestNotification } from "./page-edit-request-notification";
import { WorkspaceInviteNotification } from "./workspace-invite-notification";

interface NotificationFeedItemProps {
	notification: Notification;
	isPending?: boolean;
	onRead: (notification: Notification) => void;
}

export function NotificationFeedItem({
	notification,
	isPending = false,
	onRead,
}: NotificationFeedItemProps) {
	if (notification.type === "page.access.requested") {
		return (
			<PageAccessRequestNotification
				notification={notification}
				isMarkingRead={isPending}
				onRead={onRead}
			/>
		);
	}

	if (notification.type === "page.edit.requested") {
		return (
			<PageEditRequestNotification
				notification={notification}
				isMarkingRead={isPending}
				onRead={onRead}
			/>
		);
	}

	if (notification.type === "workspace.invite") {
		return (
			<WorkspaceInviteNotification
				notification={notification}
				isMarkingRead={isPending}
				onRead={onRead}
			/>
		);
	}

	/**
	 * Các notification thông thường.
	 */
	const presentation = getNotificationPresentation(notification);

	return (
		<NotificationItemShell
			notification={notification}
			icon={presentation.icon}
			tone={presentation.tone}
			title={presentation.title}
			description={presentation.description}
			isMarkingRead={isPending}
			onRead={onRead}
		/>
	);
}
