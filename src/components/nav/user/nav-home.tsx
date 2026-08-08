"use client";

import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

import { InboxPopover } from "@/components/popover/InboxPopover";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useUnreadNotificationCount } from "@/features/notification/hooks/useNotifications";

export type NavHomeItem = {
	name: string;
	url?: string;
	icon: LucideIcon;
	type?: "link" | "inbox";
};

const NavHome = ({ home }: { home: NavHomeItem[] }) => {
	const { isMobile } = useSidebar();
	const pathname = usePathname();
	const { unreadNotificationCountQuery } = useUnreadNotificationCount();
	const unreadCount = unreadNotificationCountQuery.data?.data.count ?? 0;
	const hasUnread = unreadCount > 0;
	const badgeLabel = unreadCount > 9 ? "9+" : unreadCount.toString();

	return (
		<SidebarGroup className='p-0'>
			<SidebarMenu>
				{home.map((item) => {
					const Icon = item.icon;

					if (item.type === "inbox") {
						return (
							<SidebarMenuItem key={item.name}>
								<Popover>
									<PopoverTrigger asChild>
										<SidebarMenuButton>
											<Icon />
											<div className="flex flex-1 items-center justify-between">
												<span>{item.name}</span>
												{hasUnread && (
													<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
														{badgeLabel}
													</span>
												)}
											</div>
										</SidebarMenuButton>
									</PopoverTrigger>

									<PopoverContent
										side={isMobile ? "bottom" : "right"}
										align='start'
										sideOffset={8}
										className='w-auto border-none bg-transparent p-0 shadow-none'
									>
										<InboxPopover />
									</PopoverContent>
								</Popover>
							</SidebarMenuItem>
						);
					}

					return (
						<SidebarMenuItem key={item.name}>
							<SidebarMenuButton asChild isActive={item.url ? pathname === item.url : false}>
								<Link href={item.url ?? "#"}>
									<Icon />
									<span>{item.name}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
};

export default NavHome;
