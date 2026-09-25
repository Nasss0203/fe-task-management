"use client";

import type { ReactNode } from "react";

import NextLink from "next/link";

import type { Page } from "@/entities/page/model/page.types";

import {
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/widgets/workspace-sidebar/ui/sidebar";

interface SidebarPageItemProps {
	page: Page;

	active?: boolean;

	actions?: ReactNode;
}

export function SidebarPageItem({
	page,
	active = false,
	actions,
}: SidebarPageItemProps) {
	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				asChild
				isActive={active}
				className={actions ? "pr-16" : undefined}
			>
				<NextLink href={`/page/${page.id}`} title={page.title}>
					<span>{page.icon || "📄"}</span>

					<span className='truncate'>{page.title || "Untitled"}</span>
				</NextLink>
			</SidebarMenuButton>

			{actions && (
				<div
					className={[
						"pointer-events-none absolute top-1 right-1",
						"flex items-center gap-0.5",
						"opacity-0 transition-opacity duration-100",
						"group-hover/menu-item:pointer-events-auto",
						"group-hover/menu-item:opacity-100",
						"group-focus-within/menu-item:pointer-events-auto",
						"group-focus-within/menu-item:opacity-100",
					].join(" ")}
				>
					{actions}
				</div>
			)}
		</SidebarMenuItem>
	);
}
