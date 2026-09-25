import {
	AtSign,
	Bell,
	CheckCircle2,
	MessageCircle,
	ShieldQuestion,
	UserPlus,
	XCircle,
} from "lucide-react";

import type { Notification } from "../model/notification.types";

export interface NotificationPresentation {
	icon: typeof Bell;

	title: string;

	description?: string | null;

	category: "page" | "workspace" | "comment" | "system";
}

export function getNotificationPresentation(
	notification: Notification,
): NotificationPresentation {
	switch (notification.type) {
		case "page.access.requested":
			return {
				icon: ShieldQuestion,
				title: notification.title,
				description:
					notification.message ?? "Requested access to a page.",
				category: "page",
			};

		case "page.access.approved":
			return {
				icon: CheckCircle2,
				title: notification.title,
				description:
					notification.message ?? "Your page access was approved.",
				category: "page",
			};

		case "page.access.rejected":
			return {
				icon: XCircle,
				title: notification.title,
				description:
					notification.message ??
					"Your page access request was rejected.",
				category: "page",
			};

		case "workspace.invite":
			return {
				icon: UserPlus,
				title: notification.title,
				description: notification.message,
				category: "workspace",
			};

		case "workspace.invite_accepted":
		case "workspace.member_joined":
		case "workspace.member_removed":
			return {
				icon: UserPlus,
				title: notification.title,
				description: notification.message,
				category: "workspace",
			};

		case "comment.mentioned":
			return {
				icon: AtSign,
				title: notification.title,
				description: notification.message,
				category: "comment",
			};

		case "comment.replied":
			return {
				icon: MessageCircle,
				title: notification.title,
				description: notification.message,
				category: "comment",
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
			};
	}
}
