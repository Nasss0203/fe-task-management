import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { notificationApi } from "../api/notification.api";
import { notificationKeys } from "./notification.keys";

import type { NotificationFilters } from "./notification.types";

const NOTIFICATION_PAGE_SIZE = 30;

const UNREAD_COUNT_POLL_MS = 30_000;

export function useNotifications(filters: NotificationFilters = {}) {
	return useInfiniteQuery({
		queryKey: notificationKeys.list(filters),

		queryFn: ({ pageParam }) =>
			notificationApi.getNotifications(
				{ ...filters, limit: NOTIFICATION_PAGE_SIZE },
				pageParam ?? undefined,
			),

		initialPageParam: null as string | null,

		getNextPageParam: (lastPage) =>
			lastPage.length < NOTIFICATION_PAGE_SIZE
				? undefined
				: lastPage[lastPage.length - 1].id,
	});
}

/** Pass `enabled: false` once signed out so polling stops immediately. */
export function useUnreadNotificationCount(enabled = true) {
	return useQuery({
		queryKey: notificationKeys.unreadCount(),
		queryFn: () => notificationApi.getUnreadCount(),
		enabled,

		// HTTP polling is the realtime fallback. Each observer runs its own
		// timer, so mount this hook once (AppSidebar) to avoid duplicate requests.
		refetchInterval: UNREAD_COUNT_POLL_MS,
		refetchIntervalInBackground: false,
		refetchOnWindowFocus: true,
	});
}
