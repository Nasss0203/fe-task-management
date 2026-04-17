"use client";

import {
	IconActivity,
	IconBuilding,
	IconCreditCard,
	IconDashboard,
	IconFileText,
	IconHelp,
	IconInnerShadowTop,
	IconSearch,
	IconSettings,
	IconUsers,
} from "@tabler/icons-react";
import * as React from "react";

import { NavMain } from "@/components/nav/admin/nav-main-admin";
import { NavSecondary } from "@/components/nav/admin/nav-secondary-admin";
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
		{
			title: "Audit Logs",
			url: "/admin/audit-logs",
			icon: IconFileText,
		},
		{
			title: "Support",
			url: "/admin/support",
			icon: IconHelp,
		},
		{
			title: "Monitoring",
			url: "/admin/monitoring",
			icon: IconActivity,
		},
		{
			title: "Settings",
			url: "/admin/settings",
			icon: IconSettings,
		},
	],

	navSecondary: [
		{
			title: "Settings",
			url: "#",
			icon: IconSettings,
		},
		{
			title: "Get Help",
			url: "#",
			icon: IconHelp,
		},
		{
			title: "Search",
			url: "#",
			icon: IconSearch,
		},
	],
};

export function AppSidebarAdmin({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible='offcanvas' {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className='data-[slot=sidebar-menu-button]:p-1.5!'
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
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavSecondary items={data.navSecondary} className='mt-auto' />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
