"use client";

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavMain({
	items,
}: {
	items: {
		title: string;
		url: string;
		icon: LucideIcon;
	}[];
}) {
	const pathname = usePathname();
	return (
		<SidebarGroup>
			<SidebarGroupContent className='flex flex-col gap-2'>
				<SidebarMenu>
					{items.map((item) => {
						const isActive =
							pathname === item.url ||
							(item.url !== "/admin" &&
								pathname?.startsWith(item.url));
						return (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton
									asChild
									isActive={isActive}
									className={
										isActive
											? "bg-[#EFF6FF] font-medium text-[#2563EB]"
											: "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
									}
								>
									<Link href={item.url}>
										<item.icon
											className={
												isActive
													? "text-[#2563EB]"
													: "text-[#64748B]"
											}
										/>
										<span>{item.title}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					})}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
