import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { notificationApi } from "@/entities/notification/api/notification.api";
import {
	useNotifications,
	useUnreadNotificationCount,
} from "@/entities/notification/model/notification.queries";
import type { Notification } from "@/entities/notification/model/notification.types";

import { createWrapper } from "../utils/test-utils";

vi.mock("@/entities/notification/api/notification.api", () => ({
	notificationApi: {
		getNotifications: vi.fn(),
		getUnreadCount: vi.fn(),
		markAsRead: vi.fn(),
		markAllAsRead: vi.fn(),
	},
}));

const api = vi.mocked(notificationApi);

function page(size: number, offset: number): Notification[] {
	return Array.from({ length: size }, (_, index) => ({
		id: `n-${offset + index}`,
		receiverId: "user-1",
		senderType: "SYSTEM",
		actorId: null,
		sourceType: "system",
		sourceId: null,
		workspaceId: null,
		type: "system.announcement",
		title: `Notification ${offset + index}`,
		message: null,
		actionUrl: null,
		metadata: null,
		readAt: null,
		archivedAt: null,
		createdAt: "2026-10-24T10:00:00.000Z",
		updatedAt: "2026-10-24T10:00:00.000Z",
	}));
}

describe("useNotifications", () => {
	beforeEach(() => vi.clearAllMocks());

	it("asks for the next page with the id of the last item and stops on a short page", async () => {
		api.getNotifications
			.mockResolvedValueOnce(page(30, 0))
			.mockResolvedValueOnce(page(5, 30));

		const { result } = renderHook(
			() => useNotifications({ unreadOnly: true }),
			createWrapper(),
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(api.getNotifications).toHaveBeenCalledWith(
			{ unreadOnly: true, limit: 30 },
			undefined,
		);
		expect(result.current.hasNextPage).toBe(true);

		await act(() => result.current.fetchNextPage());

		expect(api.getNotifications).toHaveBeenLastCalledWith(
			{ unreadOnly: true, limit: 30 },
			"n-29",
		);
		await waitFor(() =>
			expect(result.current.data?.pages.flat()).toHaveLength(35),
		);
		expect(result.current.hasNextPage).toBe(false);
	});
});

describe("useUnreadNotificationCount", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers({ shouldAdvanceTime: true });
	});

	afterEach(() => vi.useRealTimers());

	it("does not call the API while signed out", async () => {
		renderHook(() => useUnreadNotificationCount(false), createWrapper());

		await act(async () => {
			await vi.advanceTimersByTimeAsync(60_000);
		});

		expect(api.getUnreadCount).not.toHaveBeenCalled();
	});

	it("polls every 30 seconds while signed in", async () => {
		api.getUnreadCount.mockResolvedValue({ count: 2 });

		const { result } = renderHook(
			() => useUnreadNotificationCount(true),
			createWrapper(),
		);

		await waitFor(() => expect(result.current.data).toEqual({ count: 2 }));
		expect(api.getUnreadCount).toHaveBeenCalledTimes(1);

		await act(async () => {
			await vi.advanceTimersByTimeAsync(30_000);
		});

		expect(api.getUnreadCount).toHaveBeenCalledTimes(2);
	});

	it("stops polling once the user signs out", async () => {
		api.getUnreadCount.mockResolvedValue({ count: 2 });

		const { rerender } = renderHook(
			({ signedIn }) => useUnreadNotificationCount(signedIn),
			{ ...createWrapper(), initialProps: { signedIn: true } },
		);

		await waitFor(() => expect(api.getUnreadCount).toHaveBeenCalledTimes(1));

		rerender({ signedIn: false });
		await act(async () => {
			await vi.advanceTimersByTimeAsync(90_000);
		});

		expect(api.getUnreadCount).toHaveBeenCalledTimes(1);
	});
});
