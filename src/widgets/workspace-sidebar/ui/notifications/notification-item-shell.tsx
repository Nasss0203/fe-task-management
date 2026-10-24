"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { formatNotificationTime } from "@/entities/notification/lib/notification-date";
import { getNotificationHref } from "@/entities/notification/lib/notification-navigation";
import type { NotificationTone } from "@/entities/notification/lib/notification-presentation";
import type { Notification } from "@/entities/notification/model/notification.types";
import { cn } from "@/shared/lib/utils";

const TONE_CLASSES: Record<NotificationTone, string> = {
	page: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
	workspace: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
	teamspace: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
	comment: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
	system: "bg-muted text-muted-foreground",
	success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
	danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

const STATUS_CLASSES = {
	success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
	danger: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
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
			<div className='flex items-center gap-2'>
				<p
					className={cn(
						"min-w-0 flex-1 truncate text-sm",
						isUnread
							? "font-semibold text-foreground"
							: "font-medium text-foreground/80",
					)}
				>
					{title}
				</p>

				<time
					dateTime={notification.createdAt}
					className='shrink-0 text-[11px] tabular-nums text-muted-foreground'
				>
					{formatNotificationTime(notification.createdAt)}
				</time>

				{isUnread && (
					<span className='size-2 shrink-0 rounded-full bg-primary'>
						<span className='sr-only'>Unread</span>
					</span>
				)}
			</div>

			{description && (
				<p className='mt-0.5 line-clamp-2 break-words text-xs leading-relaxed text-muted-foreground'>
					{description}
				</p>
			)}
		</>
	);

	return (
		<div
			className={cn(
				"rounded-lg px-2.5 py-2.5 transition-colors hover:bg-sidebar-accent",
				isUnread && "bg-primary/[0.06]",
			)}
		>
			<div className='flex items-start gap-3'>
				<div
					className={cn(
						"flex size-8 shrink-0 items-center justify-center rounded-lg",
						TONE_CLASSES[tone],
					)}
				>
					<Icon className='size-4' />
				</div>

				<div className='min-w-0 flex-1'>
					{href ? (
						<Link
							href={href}
							onClick={markRead}
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
				</div>
			</div>
		</div>
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
				"mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
				STATUS_CLASSES[tone],
			)}
		>
			<Icon className='size-3' />
			{children}
		</span>
	);
}
