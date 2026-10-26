"use client";

import { CheckCircle2, KeyRound, XCircle } from "lucide-react";
import { toast } from "sonner";

import type { Notification } from "@/entities/notification/model/notification.types";
import { useReviewPageEditRequest } from "@/entities/page-edit-request/model/page-edit-request.mutations";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { Button } from "@/shared/ui/button";

import {
	NotificationItemShell,
	NotificationStatusPill,
} from "./notification-item-shell";

interface PageEditRequestNotificationProps {
	notification: Notification;

	isMarkingRead?: boolean;

	onRead: (notification: Notification) => void;
}

export function PageEditRequestNotification({
	notification,
	isMarkingRead = false,
	onRead,
}: PageEditRequestNotificationProps) {
	const reviewMutation = useReviewPageEditRequest();

	const editRequestId =
		typeof notification.metadata?.editRequestId === "string"
			? notification.metadata.editRequestId
			: null;

	const status = notification.metadata?.status;

	const canReview = status === "PENDING" && Boolean(editRequestId);

	const handleReview = (decision: "approve" | "reject") => {
		if (!editRequestId || !canReview || reviewMutation.isPending) {
			return;
		}

		reviewMutation.mutate(
			{ requestId: editRequestId, decision },
			{
				onSuccess: () => {
					if (notification.readAt === null) {
						onRead(notification);
					}
				},
				onError: (error) =>
					toast.error(
						getApiErrorMessage(error, "Could not review the request."),
					),
			},
		);
	};

	const reviewing = reviewMutation.isPending
		? reviewMutation.variables?.decision
		: null;

	return (
		<NotificationItemShell
			notification={notification}
			icon={KeyRound}
			tone='page'
			description={
				notification.message ?? "Requested edit access to a page."
			}
			isMarkingRead={isMarkingRead}
			onRead={onRead}
		>
			{canReview && (
				<div className='mt-2.5 flex items-center gap-2'>
					<Button
						type='button'
						size='sm'
						className='h-8 flex-1'
						disabled={reviewMutation.isPending}
						onClick={() => handleReview("approve")}
					>
						{reviewing === "approve" ? "Approving..." : "Allow editing"}
					</Button>

					<Button
						type='button'
						size='sm'
						variant='outline'
						className='h-8 flex-1'
						disabled={reviewMutation.isPending}
						onClick={() => handleReview("reject")}
					>
						{reviewing === "reject" ? "Rejecting..." : "Reject"}
					</Button>
				</div>
			)}

			{status === "APPROVED" && (
				<NotificationStatusPill tone='success' icon={CheckCircle2}>
					Approved · Editor
				</NotificationStatusPill>
			)}

			{status === "REJECTED" && (
				<NotificationStatusPill tone='danger' icon={XCircle}>
					Rejected
				</NotificationStatusPill>
			)}
		</NotificationItemShell>
	);
}
