"use client";

import Link from "next/link";
import {
	Folder,
	Forward,
	MoreHorizontal,
	Trash2,
	type LucideIcon,
} from "lucide-react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

export function NavProjects({
	projects,
}: {
	projects: {
		name: string;
		url: string;
		icon: LucideIcon;
	}[];
}) {
	const { isMobile } = useSidebar();

	return (
		<SidebarGroup className='group-data-[collapsible=icon]:hidden'>
			<SidebarGroupLabel>More</SidebarGroupLabel>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton asChild>
						<Link href='/dashboard/trash/workspaces'>
							<Trash2 className='text-sidebar-foreground/70' />
							<span>Thung rac</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarGroup>
	);
}
