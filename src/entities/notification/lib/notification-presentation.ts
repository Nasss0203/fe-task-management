import {
	AtSign,
	Bell,
	CheckCircle2,
	KeyRound,
	MessageCircle,
	UserMinus,
	UserPlus,
	Users,
	XCircle,
} from "lucide-react";

import type { Notification } from "../model/notification.types";

export type NotificationCategory =
	| "page"
	| "workspace"
	| "teamspace"
	| "comment"
	| "system";

/** Colour family of the icon tile: the category, or an outcome colour. */
export type NotificationTone = NotificationCategory | "success" | "danger";

export interface NotificationPresentation {
	icon: typeof Bell;

	title: string;

	description?: string | null;

	category: NotificationCategory;

	tone: NotificationTone;
}

export function getNotificationPresentation(
	notification: Notification,
): NotificationPresentation {
	switch (notification.type) {
		case "page.access.requested":
			return {
				icon: KeyRound,
				title: notification.title,
				description:
					notification.message ?? "Requested access to a page.",
				category: "page",
				tone: "page",
			};

		case "page.access.approved":
			return {
				icon: CheckCircle2,
				title: notification.title,
				description:
					notification.message ?? "Your page access was approved.",
				category: "page",
				tone: "success",
			};

		case "page.access.rejected":
			return {
				icon: XCircle,
				title: notification.title,
				description:
					notification.message ??
					"Your page access request was rejected.",
				category: "page",
				tone: "danger",
			};

		case "workspace.invite":
		case "workspace.invite_accepted":
		case "workspace.member_joined":
			return {
				icon: UserPlus,
				title: notification.title,
				description: notification.message,
				category: "workspace",
				tone: "workspace",
			};

		case "workspace.member_removed":
			return {
				icon: UserMinus,
				title: notification.title,
				description: notification.message,
				category: "workspace",
				tone: "danger",
			};

		case "teamspace.invitation_received":
			return {
				icon: Users,
				title: notification.title,
				description: notification.message,
				category: "teamspace",
				tone: "teamspace",
			};

		case "comment.mentioned":
			return {
				icon: AtSign,
				title: notification.title,
				description: notification.message,
				category: "comment",
				tone: "comment",
			};

		case "comment.replied":
			return {
				icon: MessageCircle,
				title: notification.title,
				description: notification.message,
				category: "comment",
				tone: "comment",
			};

		case "system.announcement":
		case "system.maintenance":
		case "account.security":
		case "account.password_changed":
		case "account.email_verified":
		default:
			return {
				icon: Bell,
				title: notification.title,
				description: notification.message,
				category: "system",
				tone: "system",
			};
	}
}
