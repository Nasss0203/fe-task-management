"use client";

import { CheckCircle2, ShieldQuestion, XCircle } from "lucide-react";
import { useState } from "react";

import { formatNotificationTime } from "@/entities/notification/lib/notification-date";
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

	const handleRead = () => {
		if (notification.readAt || isMarkingRead) {
			return;
		}

		onRead(notification);
	};

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

	const Icon =
		requestStatus === "APPROVED"
			? CheckCircle2
			: requestStatus === "REJECTED"
				? XCircle
				: ShieldQuestion;

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
					{canReview && (
						<div className='mt-3 space-y-2'>
							<Select
								value={accessLevel}
								disabled={isActionPending}
								onValueChange={(value) =>
									setAccessLevel(
										value as PageShareAccessLevel,
									)
								}
							>
								<SelectTrigger className='h-8 w-full'>
									<SelectValue />
								</SelectTrigger>

								<SelectContent>
									<SelectItem value='VIEWER'>
										Viewer
									</SelectItem>

									<SelectItem value='COMMENTER'>
										Commenter
									</SelectItem>

									<SelectItem value='EDITOR'>
										Editor
									</SelectItem>

									<SelectItem value='FULL_ACCESS'>
										Full access
									</SelectItem>
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
									{approveMutation.isPending
										? "Approving..."
										: "Approve"}
								</Button>

								<Button
									type='button'
									size='sm'
									variant='outline'
									className='h-8 flex-1'
									disabled={isActionPending}
									onClick={handleReject}
								>
									{rejectMutation.isPending
										? "Rejecting..."
										: "Reject"}
								</Button>
							</div>
						</div>
					)}

					{/* APPROVED */}
					{requestStatus === "APPROVED" && (
						<div className='mt-2 flex items-center gap-1.5 text-xs text-muted-foreground'>
							<CheckCircle2 className='size-3.5' />

							<span>
								Approved
								{approvedAccessLevel
									? ` · ${getAccessLevelLabel(
											approvedAccessLevel,
										)}`
									: ""}
							</span>
						</div>
					)}

					{/* REJECTED */}
					{requestStatus === "REJECTED" && (
						<div className='mt-2 flex items-center gap-1.5 text-xs text-muted-foreground'>
							<XCircle className='size-3.5' />

							<span>Rejected</span>
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
