import instance from "../axios";
import {
  FindNotificationParams,
  FindNotificationResponse,
  MarkAllNotificationsReadResponse,
  UnreadNotificationCountResponse,
} from "./type";

export const findMyNotificationsApi = async (
  params?: FindNotificationParams,
) => {
  const result = await instance.get<FindNotificationResponse>(
    "/notifications",
    { params },
  );

  return result.data;
};

export const markAllNotificationsAsReadApi = async () => {
  const result = await instance.patch<MarkAllNotificationsReadResponse>(
    "/notifications/read-all",
  );

  return result.data;
};

export const countUnreadNotificationsApi = async () => {
  const result = await instance.get<UnreadNotificationCountResponse>(
    "/notifications/unread-count",
  );

  return result.data;
};
