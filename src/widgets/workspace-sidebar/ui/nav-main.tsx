"use client";

import { type LucideIcon } from "lucide-react";

import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/widgets/workspace-sidebar/ui/sidebar";

export type NavMainAction = "home" | "inbox";

export interface NavMainItem {
	title: string;
	url: string;
	icon: LucideIcon;
	action?: NavMainAction;
	badge?: string;
}

interface NavMainProps {
	items: NavMainItem[];
	activeAction?: NavMainAction;
	onAction?: (action: NavMainAction) => void;
}

export function NavMain({ items, activeAction, onAction }: NavMainProps) {
	return (
		<SidebarMenu>
			{items.map((item) => {
				const isActive =
					item.action !== undefined && item.action === activeAction;

				return (
					<SidebarMenuItem key={item.title}>
						<SidebarMenuButton asChild isActive={isActive}>
							<a
								href={item.url}
								onClick={(event) => {
									if (!item.action) {
										return;
									}

									event.preventDefault();

									onAction?.(item.action);
								}}
							>
								<item.icon />

								<span>{item.title}</span>

								{item.badge && (
									<span className='ml-auto text-xs text-muted-foreground'>
										{item.badge}
									</span>
								)}
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				);
			})}
		</SidebarMenu>
	);
}
