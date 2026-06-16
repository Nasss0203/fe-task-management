"use client";

import {
	AudioWaveform,
	Command,
	Frame,
	GalleryVerticalEnd,
	Home,
	ListTodo,
	Mail,
	Map,
	PieChart,
	Search,
	LayoutTemplate,
	CheckSquare,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav/user/nav-main";
import { NavProjects } from "@/components/nav/user/nav-projects";
import { NavUser } from "@/components/nav/user/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from "@/components/ui/sidebar";
import NavHome, { type NavHomeItem } from "../../nav/user/nav-home";

const homeItems: NavHomeItem[] = [

	{
		name: "Trang chủ",
		url: "/dashboard",
		icon: Home,
	},
	{
		name: "Công việc của tôi",
		url: "/dashboard/my-tasks",
		icon: ListTodo,
	},
	{
		name: "Hộp thư đến",
		icon: Mail,
		type: "inbox",
	},
	{
		name: "Khám phá mẫu",
		url: "/dashboard/templates",
		icon: LayoutTemplate,
	},
];

const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	teams: [
		{
			name: "Acme Inc",
			logo: GalleryVerticalEnd,
			plan: "Enterprise",
		},
		{
			name: "Acme Corp.",
			logo: AudioWaveform,
			plan: "Startup",
		},
		{
			name: "Evil Corp.",
			logo: Command,
			plan: "Free",
		},
	],
	projects: [
		{
			name: "Design Engineering",
			url: "#",
			icon: Frame,
		},
		{
			name: "Sales & Marketing",
			url: "#",
			icon: PieChart,
		},
		{
			name: "Travel",
			url: "#",
			icon: Map,
		},
	],
	home: homeItems,
};

export function AppSidebarUser({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible='icon' {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-transparent">
							<div className="bg-blue-600 text-white flex aspect-square size-8 items-center justify-center rounded-lg">
								<CheckSquare className="size-5" />
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-bold text-lg">TaskFlow</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
				<NavHome home={data.home} />
			</SidebarHeader>

			<SidebarContent>
				<NavMain />
				<NavProjects projects={data.projects} />
			</SidebarContent>

			<SidebarFooter>
				<NavUser />
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
