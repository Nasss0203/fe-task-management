"use client";

import { NOTIFICATION_KEY } from "@/constants/query-key";
import type { FindNotificationResponse, NotificationItem } from "@/services/notification/type";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { connectRealtimeSocket, disconnectRealtimeSocket } from "./realtime-socket";
import { useProjectSelectionStore } from "@/stores/use-project-selection";

type Props = {
	accessToken: string | null;
	children: React.ReactNode;
};

export function NotificationRealtimeProvider({ accessToken, children }: Props) {
	const queryClient = useQueryClient();
	const { currentProjectId, currentWorkspaceId } = useProjectSelectionStore();

	useEffect(() => {
		if (!accessToken) {
			disconnectRealtimeSocket();
			return;
		}

		const socket = connectRealtimeSocket(accessToken);

		const handleNotificationCreated = (notification: NotificationItem) => {
			toast.info(notification.title || "New notification", {
				description: notification.message ?? undefined,
			});

			queryClient.setQueriesData<FindNotificationResponse>(
				{
					queryKey: [NOTIFICATION_KEY.MY_NOTIFICATIONS],
				},
				(old) => {
					if (!old) return old;

					const current = old.data ?? [];

					const existed = current.some(
						(item) => item.id === notification.id,
					);

					if (existed) return old;

					return {
						...old,
						data: [notification, ...current],
					};
				},
			);

			queryClient.invalidateQueries({
				queryKey: [NOTIFICATION_KEY.UNREAD_COUNT],
			});
		};

		socket.on("notification.created", handleNotificationCreated);

		return () => {
			socket.off("notification.created", handleNotificationCreated);
		};
	}, [accessToken, queryClient]);

	useEffect(() => {
		if (!accessToken || !currentProjectId || !currentWorkspaceId) return;

		const socket = connectRealtimeSocket(accessToken);

		socket.emit("project.join", { projectId: currentProjectId });

		const handleTaskUpdated = (payload: any) => {
			queryClient.invalidateQueries({
				queryKey: ["task-activities", currentWorkspaceId],
			});
			queryClient.invalidateQueries({
				queryKey: ["task", currentWorkspaceId],
			});
			queryClient.invalidateQueries({
				queryKey: ["tasks", currentWorkspaceId],
			});
		};

		const handleCommentUpdated = (payload: any) => {
			console.log("Realtime event received - Comment Updated:", payload);
			queryClient.invalidateQueries({
				queryKey: ["comments"],
			});
			queryClient.invalidateQueries({
				queryKey: ["task-activities"], 
			});
		};

		socket.on("task.created", handleTaskUpdated);
		socket.on("task.updated", handleTaskUpdated);
		socket.on("task.deleted", handleTaskUpdated);
		
		socket.on("comment.created", handleCommentUpdated);
		socket.on("comment.updated", handleCommentUpdated);
		socket.on("comment.deleted", handleCommentUpdated);

		return () => {
			socket.off("task.created", handleTaskUpdated);
			socket.off("task.updated", handleTaskUpdated);
			socket.off("task.deleted", handleTaskUpdated);

			socket.off("comment.created", handleCommentUpdated);
			socket.off("comment.updated", handleCommentUpdated);
			socket.off("comment.deleted", handleCommentUpdated);
		};
	}, [accessToken, currentProjectId, currentWorkspaceId, queryClient]);

	return <>{children}</>;
}
