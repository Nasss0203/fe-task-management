"use client";

import { ChevronLeft, Crown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	useSidebar,
} from "@/widgets/workspace-sidebar/ui/sidebar";

import { CREATOR_NAV, isCreatorNavActive } from "../model/creator-nav";

export function CreatorSidebar() {
	const pathname = usePathname();
	const { isMobile, setOpenMobile } = useSidebar();

	// Close the mobile drawer after navigating.
	const handleNavigate = () => {
		if (isMobile) setOpenMobile(false);
	};

	return (
		<Sidebar collapsible='icon'>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							size='lg'
							tooltip='Creator Studio'
						>
							<Link href='/creator' onClick={handleNavigate}>
								<div className='flex aspect-square size-[22px] shrink-0 items-center justify-center rounded-[6px] bg-[#5e6ad2] text-white'>
									<Crown className='size-[13px]' />
								</div>
								<div className='grid min-w-0 flex-1 text-left leading-tight'>
									<span className='truncate text-[13.5px] font-semibold'>
										Creator Studio
									</span>
									<span className='truncate text-[11.5px] text-muted-foreground'>
										Templates & marketplace
									</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				{CREATOR_NAV.map((group, index) => (
					<SidebarGroup key={group.label ?? index}>
						{group.label && (
							<SidebarGroupLabel>{group.label}</SidebarGroupLabel>
						)}
						<SidebarGroupContent>
							<SidebarMenu>
								{group.items.map((item) => (
									<SidebarMenuItem key={item.href}>
										{item.comingSoon ? (
											<>
												<SidebarMenuButton
													disabled
													aria-disabled
													tooltip={`${item.title} · Coming soon`}
												>
													<item.icon />
													<span>{item.title}</span>
												</SidebarMenuButton>
												<SidebarMenuBadge className='rounded-full bg-muted px-1.5 text-[10px] font-medium text-muted-foreground'>
													Soon
												</SidebarMenuBadge>
											</>
										) : (
											<SidebarMenuButton
												asChild
												isActive={isCreatorNavActive(
													pathname,
													item.href,
												)}
												tooltip={item.title}
											>
												<Link
													href={item.href}
													onClick={handleNavigate}
												>
													<item.icon />
													<span>{item.title}</span>
												</Link>
											</SidebarMenuButton>
										)}
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							tooltip='Public marketplace'
							className='text-[13.5px] text-muted-foreground hover:text-foreground'
						>
							<Link href='/templates' onClick={handleNavigate}>
								<ChevronLeft className='text-muted-foreground' />
								<span>Public marketplace</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							tooltip='Back to workspace'
							className='text-[13.5px] text-muted-foreground hover:text-foreground'
						>
							<Link href='/dashboard'>
								<ChevronLeft className='text-muted-foreground' />
								<span>Back to workspace</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
