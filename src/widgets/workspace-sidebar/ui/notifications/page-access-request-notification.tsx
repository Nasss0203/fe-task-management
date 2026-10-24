"use client";

import { CheckCircle2, KeyRound, XCircle } from "lucide-react";
import { useState } from "react";

import type { Notification } from "@/entities/notification/model/notification.types";

import {
	useApprovePageAccessRequest,
	useRejectPageAccessRequest,
} from "@/entities/page-access-request/model/page-access-request.mutations";

import type { PageShareAccessLevel } from "@/entities/page-share/model/page-share.types";

import { Button } from "@/shared/ui/button";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";

import {
	NotificationItemShell,
	NotificationStatusPill,
} from "./notification-item-shell";

type PageAccessRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

interface PageAccessRequestNotificationProps {
	notification: Notification;

	isMarkingRead?: boolean;

	onRead: (notification: Notification) => void;
}

function getRequestStatus(
	notification: Notification,
): PageAccessRequestStatus | null {
	const status = notification.metadata?.status;

	if (
		status === "PENDING" ||
		status === "APPROVED" ||
		status === "REJECTED"
	) {
		return status;
	}

	return null;
}

function getApprovedAccessLevel(
	notification: Notification,
): PageShareAccessLevel | null {
	const accessLevel = notification.metadata?.accessLevel;

	if (
		accessLevel === "VIEWER" ||
		accessLevel === "COMMENTER" ||
		accessLevel === "EDITOR" ||
		accessLevel === "FULL_ACCESS"
	) {
		return accessLevel;
	}

	return null;
}

function getAccessLevelLabel(accessLevel: PageShareAccessLevel): string {
	switch (accessLevel) {
		case "VIEWER":
			return "Viewer";

		case "COMMENTER":
			return "Commenter";

		case "EDITOR":
			return "Editor";

		case "FULL_ACCESS":
			return "Full access";
	}
}

export function PageAccessRequestNotification({
	notification,

	isMarkingRead = false,

	onRead,
}: PageAccessRequestNotificationProps) {
	const [accessLevel, setAccessLevel] =
		useState<PageShareAccessLevel>("VIEWER");

	const approveMutation = useApprovePageAccessRequest();

	const rejectMutation = useRejectPageAccessRequest();

	const isUnread = notification.readAt === null;

	const accessRequestId =
		typeof notification.metadata?.accessRequestId === "string"
			? notification.metadata.accessRequestId
			: null;

	const requestStatus = getRequestStatus(notification);

	const approvedAccessLevel = getApprovedAccessLevel(notification);

	const canReview = requestStatus === "PENDING" && Boolean(accessRequestId);

	const isActionPending =
		approveMutation.isPending || rejectMutation.isPending;

	const handleApprove = () => {
		if (!accessRequestId || !canReview || isActionPending) {
			return;
		}

		approveMutation.mutate(
			{
				requestId: accessRequestId,

				accessLevel,
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

	const handleReject = () => {
		if (!accessRequestId || !canReview || isActionPending) {
			return;
		}

		rejectMutation.mutate(
			{
				requestId: accessRequestId,
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
			icon={KeyRound}
			tone='page'
			description={notification.message ?? "Requested access to a page."}
			isMarkingRead={isMarkingRead}
			onRead={onRead}
		>
			{/* PENDING */}
			{canReview && (
				<div className='mt-2.5 space-y-2'>
					<Select
						value={accessLevel}
						disabled={isActionPending}
						onValueChange={(value) =>
							setAccessLevel(value as PageShareAccessLevel)
						}
					>
						<SelectTrigger
							className='h-8 w-full text-xs'
							aria-label='Access level'
						>
							<SelectValue />
						</SelectTrigger>

						<SelectContent>
							<SelectItem value='VIEWER'>Viewer</SelectItem>

							<SelectItem value='COMMENTER'>Commenter</SelectItem>

							<SelectItem value='EDITOR'>Editor</SelectItem>

							<SelectItem value='FULL_ACCESS'>Full access</SelectItem>
						</SelectContent>
					</Select>

					<div className='flex items-center gap-2'>
						<Button
							type='button'
							size='sm'
							className='h-8 flex-1'
							disabled={isActionPending}
							onClick={handleApprove}
						>
							{approveMutation.isPending ? "Approving..." : "Approve"}
						</Button>

						<Button
							type='button'
							size='sm'
							variant='outline'
							className='h-8 flex-1'
							disabled={isActionPending}
							onClick={handleReject}
						>
							{rejectMutation.isPending ? "Rejecting..." : "Reject"}
						</Button>
					</div>
				</div>
			)}

			{/* APPROVED */}
			{requestStatus === "APPROVED" && (
				<NotificationStatusPill tone='success' icon={CheckCircle2}>
					Approved
					{approvedAccessLevel
						? ` · ${getAccessLevelLabel(approvedAccessLevel)}`
						: ""}
				</NotificationStatusPill>
			)}

			{/* REJECTED */}
			{requestStatus === "REJECTED" && (
				<NotificationStatusPill tone='danger' icon={XCircle}>
					Rejected
				</NotificationStatusPill>
			)}
		</NotificationItemShell>
	);
}
