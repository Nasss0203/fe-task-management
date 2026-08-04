"use client";

import {
	Archive,
	AtSign,
	CheckCircle2,
	Clock,
	Loader2,
	MessageCircle,
	Rocket,
	Shield,
	UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useNotifications } from "@/features/notification/hooks/useNotifications";
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace";
import {
	useAcceptWorkspaceInvite,
	useDeclineWorkspaceInvite,
} from "@/features/workspace/hooks/useWorkspaceInvite";
import { NotificationType } from "@/services/notification/type";
import { WorkspaceInviteStatus } from "@/services/workspace-invite/type";

const getNotificationIcon = (type: NotificationType) => {
	switch (type) {
		case NotificationType.WORKSPACE_INVITE:
			return UserPlus;

		case NotificationType.TASK_ASSIGNED:
		case NotificationType.TASK_UPDATED:
			return CheckCircle2;

		case NotificationType.TASK_DUE_SOON:
		case NotificationType.TASK_OVERDUE:
			return Clock;

		case NotificationType.COMMENT_MENTION:
			return AtSign;

		case NotificationType.COMMENT_REPLY:
			return MessageCircle;

		case NotificationType.SPRINT_STARTED:
		case NotificationType.SPRINT_COMPLETED:
			return Rocket;

		case NotificationType.ACCOUNT_SECURITY:
		case NotificationType.PASSWORD_CHANGED:
		case NotificationType.EMAIL_VERIFIED:
			return Shield;

		default:
			return CheckCircle2;
	}
};

export function InboxPopover() {
	const router = useRouter();
	const acceptInvite = useAcceptWorkspaceInvite();
	const declineInvite = useDeclineWorkspaceInvite();
	const [inviteStatuses, setInviteStatuses] = useState<
		Record<string, WorkspaceInviteStatus>
	>({});

	const { workspaceFindAll } = useWorkspace();
	const workspaces = workspaceFindAll.data?.data || [];

	const getFrontendActionUrl = (backendUrl: string | null | undefined) => {
		if (!backendUrl) return "";

		const match = backendUrl.match(
			/\/workspaces\/([^\/]+)\/projects\/([^\/]+)\/tasks\/([^\/]+)/,
		);

		if (match) {
			const workspaceId = match[1];
			const projectId = match[2];
			const workspace = workspaces.find((w) => w.id === workspaceId);
			if (workspace && workspace.slug) {
				return `/dashboard/${workspace.slug}/projects/${projectId}`;
			}
		}

		return backendUrl;
	};

	const { myNotificationsQuery } = useNotifications({
		limit: 10,
		category: "human",
	});

	const notifications = myNotificationsQuery.data?.data ?? [];

	const handleAcceptInvite = (inviteToken: string | undefined) => {
		if (!inviteToken) {
			toast.error("Không tìm thấy mã lời mời.");
			return;
		}

		acceptInvite.mutate(inviteToken, {
			onSuccess: (response) => {
				const nextStatus =
					response.data.status ?? WorkspaceInviteStatus.ACCEPTED;

				setInviteStatuses((prev) => ({
					...prev,
					[inviteToken]: nextStatus,
				}));

				toast.success("Đã chấp nhận lời mời vào không gian làm việc.");
				router.push("/dashboard");
			},
			onError: () => {
				toast.error("Không thể chấp nhận lời mời.");
			},
		});
	};

	const handleDeclineInvite = (inviteToken: string | undefined) => {
		if (!inviteToken) {
			toast.error("Không tìm thấy mã lời mời.");
			return;
		}

		declineInvite.mutate(inviteToken, {
			onSuccess: () => {
				setInviteStatuses((prev) => ({
					...prev,
					[inviteToken]: WorkspaceInviteStatus.REVOKED,
				}));

				toast.success("Đã từ chối lời mời vào không gian làm việc.");
			},
			onError: () => {
				toast.error("Không thể từ chối lời mời.");
			},
		});
	};

	return (
		<div className='w-[420px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md'>
			<div className='flex items-center justify-between border-b px-4 py-3'>
				<div>
					<h3 className='text-sm font-semibold'>Hộp thư đến</h3>
					<p className='text-xs text-muted-foreground'>
						Những việc cần bạn xử lý
					</p>
				</div>

				<Button variant='ghost' size='sm' className='h-8 px-2 text-xs'>
					Đánh dấu đã đọc
				</Button>
			</div>

			<div className='max-h-[420px] overflow-y-auto'>
				{myNotificationsQuery.isLoading ? (
					<div className='flex items-center justify-center py-10'>
						<Loader2 className='size-5 animate-spin text-muted-foreground' />
					</div>
				) : notifications.length > 0 ? (
					notifications.map((notification) => {
						const Icon = getNotificationIcon(notification.type);

						const isUnread = !notification.readAt;

						const isWorkspaceInvite =
							notification.type ===
							NotificationType.WORKSPACE_INVITE;

						const inviteToken = notification.metadata?.inviteToken;
						const inviteStatus =
							(inviteToken
								? inviteStatuses[inviteToken]
								: undefined) ??
							notification.metadata?.inviteStatus ??
							notification.metadata?.status;
						const isPendingInvite =
							isWorkspaceInvite &&
							!!inviteToken &&
							(!inviteStatus ||
								inviteStatus === WorkspaceInviteStatus.PENDING);

						const isTaskAction =
							notification.type ===
								NotificationType.TASK_ASSIGNED ||
							notification.type ===
								NotificationType.TASK_UPDATED ||
							notification.type ===
								NotificationType.TASK_DUE_SOON ||
							notification.type === NotificationType.TASK_OVERDUE;

						const isCommentAction =
							notification.type ===
								NotificationType.COMMENT_MENTION ||
							notification.type ===
								NotificationType.COMMENT_REPLY;

						return (
							<div
								key={notification.id}
								className='flex gap-3 border-b px-4 py-3 transition hover:bg-muted/60'
							>
								<div className='mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-md bg-muted'>
									<Icon className='size-4 text-muted-foreground' />
								</div>

								<div className='min-w-0 flex-1'>
									<div className='flex items-start justify-between gap-3'>
										<div className='min-w-0'>
											<p className='truncate text-sm font-semibold'>
												{notification.title}
											</p>

											{notification.message && (
												<p className='mt-1 line-clamp-2 text-xs text-muted-foreground'>
													{notification.message}
												</p>
											)}
										</div>

										{isUnread && (
											<span className='mt-1.5 size-2 shrink-0 rounded-full bg-blue-500' />
										)}
									</div>

									{isPendingInvite && (
										<div className='mt-3 flex items-center gap-2'>
											<Button
												size='sm'
												className='h-8 px-3 text-xs'
												disabled={
													acceptInvite.isPending
												}
												onClick={() => {
													handleAcceptInvite(
														inviteToken,
													);
												}}
											>
												Chấp nhận
											</Button>

											<Button
												size='sm'
												variant='outline'
												className='h-8 px-3 text-xs'
												disabled={
													declineInvite.isPending
												}
												onClick={() => {
													handleDeclineInvite(
														inviteToken,
													);
												}}
											>
												Từ chối
											</Button>
										</div>
									)}

									{isTaskAction && notification.actionUrl && (
										<div className='mt-3'>
											<Button
												size='sm'
												variant='outline'
												className='h-8 px-3 text-xs'
												onClick={() =>
													router.push(
														getFrontendActionUrl(notification.actionUrl),
													)
												}
											>
												Xem task
											</Button>
										</div>
									)}

									{isCommentAction &&
										notification.actionUrl && (
											<div className='mt-3'>
												<Button
													size='sm'
													variant='outline'
													className='h-8 px-3 text-xs'
													onClick={() =>
														router.push(
															getFrontendActionUrl(notification.actionUrl),
														)
													}
												>
													Xem bình luận
												</Button>
											</div>
										)}
								</div>
							</div>
						);
					})
				) : (
					<div className='flex flex-col items-center justify-center px-4 py-10 text-center'>
						<Archive className='mb-3 size-8 text-muted-foreground' />
						<p className='text-sm font-medium'>
							Không có inbox mới
						</p>
						<p className='mt-1 text-xs text-muted-foreground'>
							Invite, task assign và mention sẽ hiện ở đây.
						</p>
					</div>
				)}
			</div>

			<div className='border-t p-2'>
				<Button
					variant='ghost'
					className='h-9 w-full justify-center text-sm'
				>
					Xem tất cả
				</Button>
			</div>
		</div>
	);
}
