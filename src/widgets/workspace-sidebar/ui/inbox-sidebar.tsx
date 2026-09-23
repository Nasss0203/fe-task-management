"use client";

import { Check, ListFilter } from "lucide-react";
import { useMemo, useState } from "react";

import {
	useMarkAllNotificationsRead,
	useMarkNotificationRead,
} from "@/entities/notification/model/notification.mutations";
import {
	useNotifications,
	useUnreadNotificationCount,
} from "@/entities/notification/model/notification.queries";
import type { NotificationFilters } from "@/entities/notification/model/notification.types";

import { groupNotificationsByDate } from "@/entities/notification/lib/notification-date";
import { Button } from "@/shared/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { NotificationFeedItem } from "./notifications/notification-feed-item";

type InboxFilter =
	| "all"
	| "unread"
	| "pages"
	| "workspaces"
	| "comments"
	| "system";

interface FilterOption {
	value: InboxFilter;
	label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
	{
		value: "all",
		label: "All",
	},
	{
		value: "unread",
		label: "Unread",
	},
	{
		value: "pages",
		label: "Pages",
	},
	{
		value: "workspaces",
		label: "Workspaces",
	},
	{
		value: "comments",
		label: "Comments",
	},
	{
		value: "system",
		label: "System",
	},
];

export function InboxSidebar() {
	const [filter, setFilter] = useState<InboxFilter>("all");

	const markReadMutation = useMarkNotificationRead();
	const { data: unreadCountData } = useUnreadNotificationCount();

	const markAllReadMutation = useMarkAllNotificationsRead();

	const hasUnread = (unreadCountData?.count ?? 0) > 0;

	const notificationFilters = useMemo<NotificationFilters>(() => {
		switch (filter) {
			case "unread":
				return {
					unreadOnly: true,
				};

			case "pages":
				return {
					sourceType: "page",
				};

			case "workspaces":
				return {
					sourceType: "workspace",
				};

			case "comments":
				return {
					sourceType: "comment",
				};

			case "system":
				return {
					sourceType: "system",
				};

			case "all":
			default:
				return {};
		}
	}, [filter]);

	const {
		data: notifications = [],
		isLoading,
		isError,
	} = useNotifications(notificationFilters);

	const groupedNotifications = useMemo(
		() => groupNotificationsByDate(notifications),
		[notifications],
	);

	const handleNotificationClick = (
		notificationId: string,
		readAt: string | null,
	) => {
		if (readAt) {
			return;
		}

		markReadMutation.mutate(notificationId);
	};

	return (
		<div className='flex min-h-0 flex-1 flex-col'>
			{/* Header */}
			<div className='flex items-center justify-between px-3 py-2'>
				<span className='text-xs font-medium text-muted-foreground'>
					This week
				</span>

				<div className='flex items-center gap-1'>
					<Button
						variant='ghost'
						size='icon'
						className='size-7'
						disabled={!hasUnread || markAllReadMutation.isPending}
						onClick={() => markAllReadMutation.mutate()}
						aria-label='Mark all as read'
						title='Mark all as read'
					>
						<Check className='size-4' />
					</Button>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='ghost'
								size='icon'
								className='size-7'
								aria-label='Filter notifications'
							>
								<ListFilter className='size-4' />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align='end' className='w-48'>
							<DropdownMenuLabel>
								Filter notifications
							</DropdownMenuLabel>

							<DropdownMenuSeparator />

							{FILTER_OPTIONS.map((option) => (
								<DropdownMenuItem
									key={option.value}
									onSelect={() => setFilter(option.value)}
								>
									<span>{option.label}</span>

									{filter === option.value && (
										<Check className='ml-auto size-4' />
									)}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Content */}
			<div className='min-h-0 flex-1 overflow-y-auto'>
				{isLoading ? (
					<div className='px-3 py-4 text-sm text-muted-foreground'>
						Loading notifications...
					</div>
				) : isError ? (
					<div className='px-3 py-4 text-sm text-muted-foreground'>
						Unable to load notifications.
					</div>
				) : notifications.length === 0 ? (
					<div className='px-3 py-4 text-sm text-muted-foreground'>
						No notifications found.
					</div>
				) : (
					groupedNotifications.map((group) => (
						<div key={group.label}>
							<div className='px-3 pb-1 pt-3 text-xs font-medium text-muted-foreground'>
								{group.label}
							</div>

							{group.notifications.map((notification) => (
								<NotificationFeedItem
									key={notification.id}
									notification={notification}
									isPending={
										markReadMutation.isPending &&
										markReadMutation.variables ===
											notification.id
									}
									onRead={(notification) => {
										if (notification.readAt) {
											return;
										}

										markReadMutation.mutate(
											notification.id,
										);
									}}
								/>
							))}
						</div>
					))
				)}
			</div>
		</div>
	);
}
