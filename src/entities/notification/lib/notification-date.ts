import type { Notification } from "../model/notification.types";

export type NotificationGroup = {
	label: string;
	notifications: Notification[];
};

function startOfDay(date: Date) {
	const result = new Date(date);

	result.setHours(0, 0, 0, 0);

	return result;
}

function startOfWeek(date: Date) {
	const result = startOfDay(date);

	const day = result.getDay();
	const diff = day === 0 ? 6 : day - 1;

	result.setDate(result.getDate() - diff);

	return result;
}

export function formatNotificationTime(value: string) {
	const date = new Date(value);
	const now = new Date();

	const diffMs = date.getTime() - now.getTime();

	const diffMinutes = Math.round(diffMs / (1000 * 60));

	const diffHours = Math.round(diffMs / (1000 * 60 * 60));

	const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

	const formatter = new Intl.RelativeTimeFormat("vi", {
		numeric: "auto",
	});

	if (Math.abs(diffMinutes) < 60) {
		return formatter.format(diffMinutes, "minute");
	}

	if (Math.abs(diffHours) < 24) {
		return formatter.format(diffHours, "hour");
	}

	if (Math.abs(diffDays) < 7) {
		return formatter.format(diffDays, "day");
	}

	return new Intl.DateTimeFormat("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(date);
}

export function groupNotificationsByDate(
	notifications: Notification[],
): NotificationGroup[] {
	const now = new Date();

	const today = startOfDay(now);

	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	const currentWeek = startOfWeek(now);

	const groups: Record<
		"today" | "yesterday" | "week" | "older",
		Notification[]
	> = {
		today: [],
		yesterday: [],
		week: [],
		older: [],
	};

	for (const notification of notifications) {
		const createdAt = new Date(notification.createdAt);

		if (createdAt >= today) {
			groups.today.push(notification);
			continue;
		}

		if (createdAt >= yesterday) {
			groups.yesterday.push(notification);
			continue;
		}

		if (createdAt >= currentWeek) {
			groups.week.push(notification);
			continue;
		}

		groups.older.push(notification);
	}

	return [
		{
			label: "Hôm nay",
			notifications: groups.today,
		},
		{
			label: "Hôm qua",
			notifications: groups.yesterday,
		},
		{
			label: "Tuần này",
			notifications: groups.week,
		},
		{
			label: "Cũ hơn",
			notifications: groups.older,
		},
	].filter((group) => group.notifications.length > 0);
}
