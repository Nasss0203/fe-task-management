"use client";

import {
	AudioWaveform,
	Bell,
	Command,
	Frame,
	GalleryVerticalEnd,
	Home,
	Mail,
	Map,
	PieChart,
	Search,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav/nav-main";
import { NavProjects } from "@/components/nav/nav-projects";
import { NavUser } from "@/components/nav/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import NavHome from "../nav/nav-home";

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
	home: [
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
			name: "Hộp thư đến",
			url: "#",
			icon: Mail,
		},
		{
			name: "Thông báo",
			url: "#",
			icon: Bell,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible='icon' {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={data.teams} />
				<NavHome home={data.home}></NavHome>
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
