import { ApiResponse } from "@/shared/api";
import instance from "@/shared/api/api-client";

import type {
	Notification,
	NotificationFilters,
	NotificationUnreadCount,
} from "../model/notification.types";

const NOTIFICATION_API = "/notifications";

export const notificationApi = {
	getNotifications: async (
		filters: NotificationFilters = {},
	): Promise<Notification[]> => {
		const response = await instance.get<ApiResponse<Notification[]>>(
			"/notifications",
			{
				params: {
					limit: 30,
					...filters,
				},
			},
		);

		return response.data.data;
	},

	getUnreadCount: async (): Promise<NotificationUnreadCount> => {
		const response = await instance.get<
			ApiResponse<NotificationUnreadCount>
		>(`${NOTIFICATION_API}/unread-count`);

		return response.data.data;
	},

	markAsRead: async (
		notificationId: string,
	): Promise<{ updated: number }> => {
		const response = await instance.patch<ApiResponse<{ updated: number }>>(
			`${NOTIFICATION_API}/${notificationId}/read`,
		);

		return response.data.data;
	},

	markAllAsRead: async (): Promise<{ updated: number }> => {
		const response = await instance.patch<ApiResponse<{ updated: number }>>(
			`${NOTIFICATION_API}/read-all`,
		);

		return response.data.data;
	},
};
