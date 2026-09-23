import { useMutation, useQueryClient } from "@tanstack/react-query";

import { notificationApi } from "../api/notification.api";
import { notificationKeys } from "./notification.keys";

export function useMarkNotificationRead() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (notificationId: string) =>
			notificationApi.markAsRead(notificationId),

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: notificationKeys.list(),
			});

			queryClient.invalidateQueries({
				queryKey: notificationKeys.unreadCount(),
			});
		},
	});
}

export function useMarkAllNotificationsRead() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => notificationApi.markAllAsRead(),

		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: notificationKeys.list(),
			});

			queryClient.invalidateQueries({
				queryKey: notificationKeys.unreadCount(),
			});
		},
	});
}
