"use client";

import { type LucideIcon } from "lucide-react";

import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";

const NavHome = ({
	home,
}: {
	home: {
		name: string;
		url?: string | any;
		icon: LucideIcon;
	}[];
}) => {
	const { isMobile } = useSidebar();

	return (
		<SidebarGroup className='group-data-[collapsible=icon]:hidden p-0'>
			{/* <SidebarGroupLabel>Projects</SidebarGroupLabel> */}
			<SidebarMenu>
				{home.map((item) => (
					<SidebarMenuItem key={item.name}>
						<SidebarMenuButton asChild>
							<Link href={item.url}>
								<item.icon />
								<span>{item.name}</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
};

export default NavHome;
