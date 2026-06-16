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

export type NavHomeItem = {
	name: string;
	url?: string;
	icon: LucideIcon;
	type?: "link" | "inbox";
};

const NavHome = ({ home }: { home: NavHomeItem[] }) => {
	const { isMobile } = useSidebar();
	const pathname = usePathname();

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
											<span>{item.name}</span>
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
