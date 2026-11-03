"use client";

import {
	AlertCircle,
	Check,
	CheckCheck,
	Inbox,
	ListFilter,
	Loader2,
	type LucideIcon,
	X,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";

import { notificationKeys } from "@/entities/notification/model/notification.keys";
import {
	useMarkAllNotificationsRead,
	useMarkNotificationRead,
} from "@/entities/notification/model/notification.mutations";
import { useNotifications } from "@/entities/notification/model/notification.queries";
import type {
	Notification,
	NotificationFilters,
} from "@/entities/notification/model/notification.types";

import { groupNotificationsByDate } from "@/entities/notification/lib/notification-date";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Skeleton } from "@/shared/ui/skeleton";
import { NotificationFeedItem } from "./notifications/notification-feed-item";

type InboxFilter =
	| "all"
	| "unread"
	| "pages"
	| "workspaces"
	| "teamspaces"
	| "comments"
	| "system";

interface FilterOption {
	value: InboxFilter;
	label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
	{
		value: "all",
		label: "All notifications",
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
		value: "teamspaces",
		label: "Teamspaces",
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

interface InboxSidebarProps {
	/** Polled by AppSidebar; passed down so the count is fetched by one observer only. */
	unreadCount: number;
	onClose?: () => void;
}

export function InboxSidebar({ unreadCount, onClose }: InboxSidebarProps) {
	const [filter, setFilter] = useState<InboxFilter>("all");

	const queryClient = useQueryClient();

	const markReadMutation = useMarkNotificationRead();

	const markAllReadMutation = useMarkAllNotificationsRead();

	const previousUnreadCount = useRef(unreadCount);

	useEffect(() => {
		// Polling found new notifications: refresh the open list as well.
		if (unreadCount > previousUnreadCount.current) {
			void queryClient.invalidateQueries({
				queryKey: notificationKeys.lists(),
			});
		}

		previousUnreadCount.current = unreadCount;
	}, [unreadCount, queryClient]);

	const activeFilterLabel =
		FILTER_OPTIONS.find((option) => option.value === filter)?.label ?? "";

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

			case "teamspaces":
				return {
					sourceType: "teamspace",
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
		data,
		isLoading,
		isError,
		refetch,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
	} = useNotifications(notificationFilters);

	const notifications = useMemo(() => data?.pages.flat() ?? [], [data]);

	const groupedNotifications = useMemo(
		() => groupNotificationsByDate(notifications),
		[notifications],
	);

	const handleRead = (notification: Notification) => {
		if (notification.readAt) {
			return;
		}

		markReadMutation.mutate(notification.id);
	};

	return (
		<div className='flex min-h-0 flex-1 flex-col bg-background'>
			{/* Header */}
			<div className='flex h-11 shrink-0 items-center gap-1.5 pl-4 pr-3'>
				<span className='min-w-0 flex-1 truncate text-[13.5px] font-semibold text-foreground'>
					Inbox
					{unreadCount > 0 && (
						<span className='sr-only'>
							{" "}
							{unreadCount > 99 ? "99+" : unreadCount} unread
						</span>
					)}
				</span>

				<div className='flex items-center gap-1.5'>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='ghost'
								size='icon-sm'
								className={cn(
									"text-muted-foreground data-[state=open]:bg-accent",
									filter !== "all" && "bg-accent text-foreground",
								)}
								aria-label='Filter notifications'
								title='Filter notifications'
							>
								<ListFilter className='size-3.5' />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align='end' className='w-50'>
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
										<Check className='ml-auto size-[15px]' />
									)}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>

					<Button
						variant='ghost'
						size='icon-sm'
						className='text-muted-foreground'
						disabled={unreadCount === 0 || markAllReadMutation.isPending}
						onClick={() => markAllReadMutation.mutate()}
						aria-label='Mark all as read'
						title='Mark all as read'
					>
						<CheckCheck className='size-3.5' />
					</Button>

					{onClose && (
						<Button
							variant='ghost'
							size='icon-sm'
							className='text-muted-foreground'
							onClick={onClose}
							aria-label='Close inbox'
							title='Close inbox'
						>
							<X className='size-3.5' />
						</Button>
					)}
				</div>
			</div>

			<div className='flex shrink-0 gap-4 border-b px-4'>
				<span className='-mb-px border-b-2 border-foreground py-2 text-[13px] font-medium leading-[19px] text-foreground'>
					{activeFilterLabel}
				</span>
			</div>

			{/* Content */}
			<div className='min-h-0 flex-1 overflow-y-auto'>
				{isLoading ? (
					<NotificationListSkeleton />
				) : isError ? (
					<InboxState
						icon={AlertCircle}
						title='Unable to load notifications'
						action={
							<Button
								variant='outline'
								className='h-[30px] bg-background text-[12.5px]'
								onClick={() => refetch()}
							>
								Try again
							</Button>
						}
					/>
				) : notifications.length === 0 ? (
					filter === "unread" ? (
						<InboxState
							icon={CheckCheck}
							title="You're all caught up"
							description='No unread notifications.'
						/>
					) : (
						<InboxState
							icon={Inbox}
							title='No notifications yet'
							description='New activity will show up here.'
						/>
					)
				) : (
					<>
						{groupedNotifications.map((group) => (
							<section key={group.label} aria-label={group.label}>
								<h3 className='sticky top-0 z-10 border-b bg-background px-3.5 pb-1.5 pt-2.5 text-xs font-medium text-muted-foreground'>
									{group.label}
								</h3>

								<div>
									{group.notifications.map((notification) => (
										<NotificationFeedItem
											key={notification.id}
											notification={notification}
											isPending={
												markReadMutation.isPending &&
												markReadMutation.variables ===
													notification.id
											}
											onRead={handleRead}
										/>
									))}
								</div>
							</section>
						))}

						{hasNextPage && (
							<div className='px-1.5 py-2'>
								<Button
									variant='ghost'
									size='sm'
									className='px-2.5 text-[12.5px] font-normal text-muted-foreground'
									disabled={isFetchingNextPage}
									onClick={() => fetchNextPage()}
								>
									{isFetchingNextPage && (
										<Loader2 className='size-3.5 animate-spin' />
									)}
									{isFetchingNextPage ? "Loading..." : "Load more"}
								</Button>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}

function NotificationListSkeleton() {
	return (
		<div aria-busy='true'>
			<span className='sr-only'>Loading notifications</span>

			{Array.from({ length: 5 }, (_, index) => (
				<div
					key={index}
					className='flex items-start gap-2.5 border-b px-3.5 py-3'
				>
					<Skeleton className='size-[26px] rounded-full' />

					<div className='flex-1 space-y-1.5'>
						<Skeleton className='h-3.5 w-3/5' />
						<Skeleton className='h-3 w-4/5' />
					</div>
				</div>
			))}
		</div>
	);
}

interface InboxStateProps {
	icon: LucideIcon;
	title: string;
	description?: string;
	action?: ReactNode;
}

function InboxState({ icon: Icon, title, description, action }: InboxStateProps) {
	return (
		<div className='flex flex-col items-center gap-2 px-6 py-10 text-center'>
			<div className='flex size-10 items-center justify-center rounded-full bg-sidebar-accent text-muted-foreground'>
				<Icon className='size-[18px]' />
			</div>

			<p className='text-[13.5px] font-medium'>{title}</p>

			{description && (
				<p className='text-[12.5px] text-muted-foreground'>
					{description}
				</p>
			)}

			{action}
		</div>
	);
}
