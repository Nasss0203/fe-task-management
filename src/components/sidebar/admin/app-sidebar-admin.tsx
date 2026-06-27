"use client";

import {
	IconBuilding,
	IconCreditCard,
	IconDashboard,
	IconInnerShadowTop,
	IconUsers,
} from "@tabler/icons-react";
import * as React from "react";

import { NavMain } from "@/components/nav/admin/nav-main-admin";
import { NavUser } from "@/components/nav/admin/nav-user-admin";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	navMain: [
		{
			title: "Dashboard",
			url: "/admin",
			icon: IconDashboard,
		},
		{
			title: "Users",
			url: "/admin/users",
			icon: IconUsers,
		},
		{
			title: "Workspaces",
			url: "/admin/workspaces",
			icon: IconBuilding,
		},
		{
			title: "Plans / Billing",
			url: "/admin/plans-billing",
			icon: IconCreditCard,
		},
	],
};

export function AppSidebarAdmin({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible='offcanvas' {...props}>
			<SidebarHeader className='border-b border-sidebar-border px-3 py-3'>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className='text-[#0F172A] hover:bg-[#F1F5F9] data-[slot=sidebar-menu-button]:p-1.5!'
						>
							<a href='#'>
								<IconInnerShadowTop className='size-5!' />
								<span className='text-base font-semibold'>
									Acme Inc.
								</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent className='px-1 py-3'>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter className='border-t border-sidebar-border px-3 py-3'>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
