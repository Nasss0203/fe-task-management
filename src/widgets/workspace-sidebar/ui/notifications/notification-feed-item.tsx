"use client";

import { formatNotificationTime } from "@/entities/notification/lib/notification-date";
import { getNotificationPresentation } from "@/entities/notification/lib/notification-presentation";
import type { Notification } from "@/entities/notification/model/notification.types";

import { PageAccessRequestNotification } from "./page-access-request-notification";
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

	const Icon = presentation.icon;

	const isUnread = notification.readAt === null;

	return (
		<button
			type='button'
			disabled={isPending}
			onClick={() => onRead(notification)}
			className='w-full border-b px-3 py-3 text-left transition-colors hover:bg-sidebar-accent/50 disabled:opacity-70'
		>
			<div className='flex items-start gap-2'>
				<div className='mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted'>
					<Icon className='size-4' />
				</div>

				<div className='min-w-0 flex-1'>
					<p className={isUnread ? "text-sm font-medium" : "text-sm"}>
						{presentation.title}
					</p>

					{presentation.description && (
						<p className='mt-1 text-xs text-muted-foreground'>
							{presentation.description}
						</p>
					)}

					<p className='mt-1 text-xs text-muted-foreground'>
						{formatNotificationTime(notification.createdAt)}
					</p>
				</div>

				{isUnread && (
					<span className='mt-1.5 size-2 shrink-0 rounded-full bg-primary' />
				)}
			</div>
		</button>
	);
}
