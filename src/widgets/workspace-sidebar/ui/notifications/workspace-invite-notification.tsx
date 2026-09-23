"use client";

import { CheckCircle2, UserPlus, XCircle } from "lucide-react";

import { formatNotificationTime } from "@/entities/notification/lib/notification-date";
import type { Notification } from "@/entities/notification/model/notification.types";

import {
	useAcceptWorkspaceInvite,
	useDeclineWorkspaceInvite,
} from "@/entities/workspace-invite/model/workspace-invite.mutations";

import { Button } from "@/shared/ui/button";

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

	const handleRead = () => {
		if (notification.readAt || isMarkingRead) {
			return;
		}

		onRead(notification);
	};

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

	const Icon =
		inviteStatus === "ACCEPTED"
			? CheckCircle2
			: inviteStatus === "DECLINED"
				? XCircle
				: UserPlus;

	return (
		<div className='border-b px-3 py-3 transition-colors hover:bg-sidebar-accent/50'>
			<div className='flex items-start gap-2'>
				<div className='mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted'>
					<Icon className='size-4' />
				</div>

				<div className='min-w-0 flex-1'>
					<button
						type='button'
						disabled={isMarkingRead}
						onClick={handleRead}
						className='block w-full text-left disabled:cursor-default'
					>
						<p
							className={
								isUnread ? "text-sm font-medium" : "text-sm"
							}
						>
							{notification.title}
						</p>

						{notification.message && (
							<p className='mt-1 text-xs text-muted-foreground'>
								{notification.message}
							</p>
						)}

						<p className='mt-1 text-xs text-muted-foreground'>
							{formatNotificationTime(notification.createdAt)}
						</p>
					</button>

					{/* PENDING */}
					{canRespond && (
						<div className='mt-3 flex items-center gap-2'>
							<Button
								type='button'
								size='sm'
								className='h-8 flex-1'
								disabled={isActionPending}
								onClick={handleAccept}
							>
								{acceptMutation.isPending
									? "Accepting..."
									: "Accept"}
							</Button>

							<Button
								type='button'
								size='sm'
								variant='outline'
								className='h-8 flex-1'
								disabled={isActionPending}
								onClick={handleDecline}
							>
								{declineMutation.isPending
									? "Declining..."
									: "Decline"}
							</Button>
						</div>
					)}

					{/* ACCEPTED */}
					{inviteStatus === "ACCEPTED" && (
						<div className='mt-2 flex items-center gap-1.5 text-xs text-muted-foreground'>
							<CheckCircle2 className='size-3.5' />

							<span>Joined workspace</span>
						</div>
					)}

					{/* DECLINED */}
					{inviteStatus === "DECLINED" && (
						<div className='mt-2 flex items-center gap-1.5 text-xs text-muted-foreground'>
							<XCircle className='size-3.5' />

							<span>Invitation declined</span>
						</div>
					)}
				</div>

				{isUnread && (
					<span className='mt-1.5 size-2 shrink-0 rounded-full bg-primary' />
				)}
			</div>
		</div>
	);
}
