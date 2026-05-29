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
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav/user/nav-main";
import { NavProjects } from "@/components/nav/user/nav-projects";
import { NavUser } from "@/components/nav/user/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import NavHome, { type NavHomeItem } from "../../nav/user/nav-home";

const homeItems: NavHomeItem[] = [
	{
		name: "Tìm kiếm",
		url: "#",
		icon: Search,
	},
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
];

// This is sample data.
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
				<TeamSwitcher teams={data.teams} />
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
