"use client";

import { CheckCircle2, UserPlus, XCircle } from "lucide-react";

import type { Notification } from "@/entities/notification/model/notification.types";

import {
	useAcceptWorkspaceInvite,
	useDeclineWorkspaceInvite,
} from "@/entities/workspace-invite/model/workspace-invite.mutations";

import { Button } from "@/shared/ui/button";

import {
	NotificationItemShell,
	NotificationStatusPill,
} from "./notification-item-shell";

interface WorkspaceInviteNotificationProps {
	notification: Notification;
	isMarkingRead?: boolean;
	onRead: (notification: Notification) => void;
}

type WorkspaceInviteStatus = "PENDING" | "ACCEPTED" | "DECLINED";

function getInviteStatus(
	notification: Notification,
): WorkspaceInviteStatus | null {
	const status = notification.metadata?.inviteStatus;

	if (
		status === "PENDING" ||
		status === "ACCEPTED" ||
		status === "DECLINED"
	) {
		return status;
	}

	return null;
}

export function WorkspaceInviteNotification({
	notification,
	isMarkingRead = false,
	onRead,
}: WorkspaceInviteNotificationProps) {
	const acceptMutation = useAcceptWorkspaceInvite();

	const declineMutation = useDeclineWorkspaceInvite();

	const isUnread = notification.readAt === null;

	const inviteToken =
		typeof notification.metadata?.inviteToken === "string"
			? notification.metadata.inviteToken
			: null;

	const inviteStatus = getInviteStatus(notification);

	const canRespond = inviteStatus === "PENDING" && Boolean(inviteToken);

	const isActionPending =
		acceptMutation.isPending || declineMutation.isPending;

	const handleAccept = () => {
		if (!inviteToken || !canRespond || isActionPending) {
			return;
		}

		acceptMutation.mutate(
			{
				token: inviteToken,
			},
			{
				onSuccess: () => {
					if (isUnread) {
						onRead(notification);
					}
				},
			},
		);
	};

	const handleDecline = () => {
		if (!inviteToken || !canRespond || isActionPending) {
			return;
		}

		declineMutation.mutate(
			{
				token: inviteToken,
			},
			{
				onSuccess: () => {
					if (isUnread) {
						onRead(notification);
					}
				},
			},
		);
	};

	return (
		<NotificationItemShell
			notification={notification}
			icon={UserPlus}
			tone='workspace'
			isMarkingRead={isMarkingRead}
			onRead={onRead}
		>
			{/* PENDING */}
			{canRespond && (
				<div className='mt-2.5 flex items-center gap-2'>
					<Button
						type='button'
						size='sm'
						className='h-8 flex-1'
						disabled={isActionPending}
						onClick={handleAccept}
					>
						{acceptMutation.isPending ? "Accepting..." : "Accept"}
					</Button>

					<Button
						type='button'
						size='sm'
						variant='outline'
						className='h-8 flex-1'
						disabled={isActionPending}
						onClick={handleDecline}
					>
						{declineMutation.isPending ? "Declining..." : "Decline"}
					</Button>
				</div>
			)}

			{/* ACCEPTED */}
			{inviteStatus === "ACCEPTED" && (
				<NotificationStatusPill tone='success' icon={CheckCircle2}>
					Joined workspace
				</NotificationStatusPill>
			)}

			{/* DECLINED */}
			{inviteStatus === "DECLINED" && (
				<NotificationStatusPill tone='neutral' icon={XCircle}>
					Invitation declined
				</NotificationStatusPill>
			)}
		</NotificationItemShell>
	);
}
