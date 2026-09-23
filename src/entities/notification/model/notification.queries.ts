import { useQuery } from "@tanstack/react-query";

import { notificationApi } from "../api/notification.api";
import { notificationKeys } from "./notification.keys";

import type { NotificationFilters } from "./notification.types";

export function useNotifications(filters: NotificationFilters = {}) {
	return useQuery({
		queryKey: notificationKeys.list(filters),

		queryFn: () => notificationApi.getNotifications(filters),
	});
}

export function useUnreadNotificationCount() {
	return useQuery({
		queryKey: notificationKeys.unreadCount(),
		queryFn: () => notificationApi.getUnreadCount(),
	});
}
