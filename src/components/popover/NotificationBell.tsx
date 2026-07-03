"use client";

import { Bell } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useMarkAllNotificationsAsRead,
  useUnreadNotificationCount,
} from "@/features/notification/hooks/useNotifications";
import { SystemAlertPopover } from "./SystemAlertPopover";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { markAllNotificationsAsRead } = useMarkAllNotificationsAsRead();
  const { unreadNotificationCountQuery } = useUnreadNotificationCount();
  const unreadCount = unreadNotificationCountQuery.data?.data.count ?? 0;
  const hasUnread = unreadCount > 0;
  const badgeLabel = unreadCount > 9 ? "9+" : unreadCount.toString();

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (
      nextOpen &&
      hasUnread &&
      !markAllNotificationsAsRead.isPending
    ) {
      markAllNotificationsAsRead.mutate();
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          aria-label={
            hasUnread ? `${unreadCount} unread notifications` : "Notifications"
          }
        >
          <Bell className="h-[1.2rem] w-[1.2rem]" />

          {hasUnread && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-background bg-red-500 px-1 text-[10px] font-semibold leading-none text-white shadow-sm">
              {badgeLabel}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <SystemAlertPopover />
      </PopoverContent>
    </Popover>
  );
}
