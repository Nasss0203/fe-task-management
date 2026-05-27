import { useQuery } from "@tanstack/react-query";

import { NOTIFICATION_KEY } from "@/constants/query-key";
import { findMyNotificationsApi } from "@/services/notification/notification.service";
import { FindNotificationParams } from "@/services/notification/type";

export const useNotifications = (params?: FindNotificationParams) => {
	const myNotificationsQuery = useQuery({
		queryKey: [NOTIFICATION_KEY.MY_NOTIFICATIONS, params],
		queryFn: () => findMyNotificationsApi(params),
		// staleTime: 30 * 1000,
	});

	return {
		myNotificationsQuery,
	};
};
