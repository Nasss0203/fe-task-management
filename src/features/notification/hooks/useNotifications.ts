import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { NOTIFICATION_KEY } from "@/constants/query-key";
import {
  countUnreadNotificationsApi,
  findMyNotificationsApi,
  markAllNotificationsAsReadApi,
} from "@/services/notification/notification.service";
import {
  FindNotificationParams,
  FindNotificationResponse,
  UnreadNotificationCountResponse,
} from "@/services/notification/type";

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

export const useUnreadNotificationCount = () => {
  const unreadNotificationCountQuery = useQuery({
    queryKey: [NOTIFICATION_KEY.UNREAD_COUNT],
    queryFn: countUnreadNotificationsApi,
    staleTime: 30 * 1000,
  });

  return {
    unreadNotificationCountQuery,
  };
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  const markAllNotificationsAsRead = useMutation({
    mutationFn: markAllNotificationsAsReadApi,
    onSuccess: () => {
      const readAt = new Date().toISOString();

      queryClient.setQueriesData<FindNotificationResponse>(
        {
          queryKey: [NOTIFICATION_KEY.MY_NOTIFICATIONS],
        },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            data: old.data.map((notification) => ({
              ...notification,
              readAt: notification.readAt ?? readAt,
            })),
          };
        },
      );

      queryClient.setQueryData<UnreadNotificationCountResponse>(
        [NOTIFICATION_KEY.UNREAD_COUNT],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            data: {
              ...old.data,
              count: 0,
            },
          };
        },
      );

      queryClient.invalidateQueries({
        queryKey: [NOTIFICATION_KEY.MY_NOTIFICATIONS],
      });
      queryClient.invalidateQueries({
        queryKey: [NOTIFICATION_KEY.UNREAD_COUNT],
      });
    },
  });

  return {
    markAllNotificationsAsRead,
  };
};
