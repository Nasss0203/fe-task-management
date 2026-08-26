"use client";

import { Ellipsis, MoreHorizontal, Plus } from "lucide-react";
import Link from "next/link";

import type { Page } from "@/entities/page/model/page.types";
import { Button } from "@/shared/ui/button";

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/widgets/workspace-sidebar/ui/sidebar";

interface NavPagesProps {
	pages: Page[];
	activePageId?: string;
	onCreatePage?: () => void;
}

export function NavPages({ pages, activePageId, onCreatePage }: NavPagesProps) {
	return (
		<SidebarGroup>
			<div className='group/private flex items-center justify-between'>
				<SidebarGroupLabel>Private</SidebarGroupLabel>

				<div className='flex items-center gap-1'>
					<Button
						variant='ghost'
						size='icon'
						className='hidden h-6 w-6 group-hover/private:flex'
						onClick={onCreatePage}
					>
						<Plus size={13} />
					</Button>

					<Button
						variant='ghost'
						size='icon'
						className='hidden h-6 w-6 group-hover/private:flex'
					>
						<Ellipsis size={13} />
					</Button>
				</div>
			</div>

			<SidebarGroupContent>
				<SidebarMenu>
					{pages.map((page) => (
						<SidebarMenuItem key={page.id}>
							<SidebarMenuButton
								asChild
								size='sm'
								isActive={page.id === activePageId}
							>
								<Link href={`/page/${page.id}`}>
									<span>{page.icon || "📄"}</span>

									<span className='truncate'>
										{page.title || "Untitled"}
									</span>
								</Link>
							</SidebarMenuButton>

							<SidebarMenuAction showOnHover>
								<MoreHorizontal />
							</SidebarMenuAction>
						</SidebarMenuItem>
					))}

					{pages.length === 0 && (
						<SidebarMenuItem>
							<SidebarMenuButton
								className='text-sidebar-foreground/70'
								onClick={onCreatePage}
							>
								<Plus />
								<span>Add a page</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					)}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
