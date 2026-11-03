"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { formatNotificationTime } from "@/entities/notification/lib/notification-date";
import {
	followSamePageHash,
	getNotificationHref,
} from "@/entities/notification/lib/notification-navigation";
import type { NotificationTone } from "@/entities/notification/lib/notification-presentation";
import type { Notification } from "@/entities/notification/model/notification.types";
import { useWorkspacePeople } from "@/entities/workspace-member/model/workspace-member.queries";
import {
	getAvatarTone,
	getInitials,
} from "@/features/workspace-settings/ui/sections/people/people.utils";
import { cn } from "@/shared/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";

const TONE_CLASSES: Record<NotificationTone, string> = {
	page: "bg-primary text-primary-foreground",
	workspace: "bg-primary text-primary-foreground",
	teamspace: "bg-primary text-primary-foreground",
	comment: "bg-primary text-primary-foreground",
	system: "bg-primary text-primary-foreground",
	success: "bg-emerald-600 text-white",
	danger: "bg-destructive text-white",
};

const STATUS_CLASSES = {
	success: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
	danger: "bg-destructive/10 text-destructive",
	neutral: "bg-muted text-muted-foreground",
};

interface NotificationItemShellProps {
	notification: Notification;
	icon: LucideIcon;
	tone: NotificationTone;
	title?: string;
	description?: string | null;
	isMarkingRead?: boolean;
	onRead: (notification: Notification) => void;
	children?: ReactNode;
}

export function NotificationItemShell({
	notification,
	icon: Icon,
	tone,
	title = notification.title,
	description = notification.message,
	isMarkingRead = false,
	onRead,
	children,
}: NotificationItemShellProps) {
	const isUnread = notification.readAt === null;

	const href = getNotificationHref(notification.actionUrl);

	const markRead = () => {
		if (isUnread && !isMarkingRead) onRead(notification);
	};

	const triggerClassName = cn(
		"block w-full rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
		isUnread || href ? "cursor-pointer" : "cursor-default",
	);

	const content = (
		<>
			<p className='break-words text-[13px] leading-[18px] text-foreground'>
				{title}
			</p>

			{description && (
				<p className='mt-1 line-clamp-2 break-words text-[12.5px] leading-[18px] text-muted-foreground'>
					{description}
				</p>
			)}
		</>
	);

	return (
		<div
			className={cn(
				"border-b px-3.5 py-3 transition-colors hover:bg-accent/50",
				isUnread && "bg-sidebar",
			)}
		>
			<div className='flex items-start gap-2.5'>
				{notification.senderType === "USER" && notification.actorId ? (
					<ActorAvatar notification={notification} icon={Icon} tone={tone} />
				) : (
					<IconAvatar icon={Icon} tone={tone} />
				)}

				<div className='min-w-0 flex-1'>
					{href ? (
						<Link
							href={href}
							onClick={(event) => {
								markRead();
								if (followSamePageHash(href)) event.preventDefault();
							}}
							className={triggerClassName}
						>
							{content}
						</Link>
					) : (
						<button
							type='button'
							disabled={isMarkingRead}
							onClick={markRead}
							className={triggerClassName}
						>
							{content}
						</button>
					)}

					{children}

					<time
						dateTime={notification.createdAt}
						className='mt-1 block text-xs leading-[17px] tabular-nums text-faint'
					>
						{formatNotificationTime(notification.createdAt)}
					</time>
				</div>

				{isUnread && (
					<span className='mt-1.5 size-[7px] shrink-0 rounded-full bg-brand-indigo'>
						<span className='sr-only'>Unread</span>
					</span>
				)}
			</div>
		</div>
	);
}

interface NotificationAvatarProps {
	icon: LucideIcon;
	tone: NotificationTone;
}

function IconAvatar({ icon: Icon, tone }: NotificationAvatarProps) {
	return (
		<span
			className={cn(
				"flex size-[26px] shrink-0 items-center justify-center rounded-md",
				TONE_CLASSES[tone],
			)}
		>
			<Icon className='size-3.5' />
		</span>
	);
}

function ActorAvatar({
	notification,
	icon,
	tone,
}: NotificationAvatarProps & { notification: Notification }) {
	const { data: people } = useWorkspacePeople(notification.workspaceId ?? "");

	const actor = people?.find((person) => person.user_id === notification.actorId);

	if (!actor) return <IconAvatar icon={icon} tone={tone} />;

	const name = actor.full_name.trim() || actor.email;

	return (
		<Avatar className='size-[26px] shrink-0'>
			{actor.avatar_url ? <AvatarImage src={actor.avatar_url} alt={name} /> : null}

			<AvatarFallback
				className={cn(
					"text-[11px] font-semibold text-white",
					getAvatarTone(actor.user_id),
				)}
			>
				{getInitials(name)}
			</AvatarFallback>
		</Avatar>
	);
}

interface NotificationStatusPillProps {
	tone: keyof typeof STATUS_CLASSES;
	icon: LucideIcon;
	children: ReactNode;
}

export function NotificationStatusPill({
	tone,
	icon: Icon,
	children,
}: NotificationStatusPillProps) {
	return (
		<span
			className={cn(
				"mt-2 inline-flex h-[22px] items-center gap-1.5 rounded-[5px] px-2 text-xs",
				STATUS_CLASSES[tone],
			)}
		>
			<Icon className='size-3' />
			{children}
		</span>
	);
}
