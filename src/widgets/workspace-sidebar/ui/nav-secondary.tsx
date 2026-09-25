"use client";

import type { LucideIcon } from "lucide-react";
import React from "react";

import { PageTrashPopover } from "@/features/page/trash/ui/page-trash-popover";

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/widgets/workspace-sidebar/ui/sidebar";

interface NavSecondaryItem {
	title: string;
	url: string;
	icon: LucideIcon;
	badge?: React.ReactNode;

	action?: "trash";
}

interface NavSecondaryProps extends React.ComponentPropsWithoutRef<
	typeof SidebarGroup
> {
	workspaceId: string;

	items: NavSecondaryItem[];
}

export function NavSecondary({
	workspaceId,
	items,
	...props
}: NavSecondaryProps) {
	return (
		<SidebarGroup {...props}>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => {
						/**
						 * Trash
						 */
						if (item.action === "trash") {
							return (
								<SidebarMenuItem key={item.title}>
									<PageTrashPopover workspaceId={workspaceId}>
										<button
											type='button'
											className={[
												"flex w-full items-center gap-2",
												"rounded-md px-2 py-1.5",
												"text-sm",
												"hover:bg-sidebar-accent",
												"hover:text-sidebar-accent-foreground",
											].join(" ")}
										>
											<item.icon className='size-4' />

											<span>{item.title}</span>
										</button>
									</PageTrashPopover>

									{item.badge && (
										<SidebarMenuBadge>
											{item.badge}
										</SidebarMenuBadge>
									)}
								</SidebarMenuItem>
							);
						}

						/**
						 * Normal link
						 */
						return (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton asChild>
									<a href={item.url}>
										<item.icon />

										<span>{item.title}</span>
									</a>
								</SidebarMenuButton>

								{item.badge && (
									<SidebarMenuBadge>
										{item.badge}
									</SidebarMenuBadge>
								)}
							</SidebarMenuItem>
						);
					})}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
