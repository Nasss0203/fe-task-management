"use client";

import type { ReactNode } from "react";

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
} from "@/widgets/workspace-sidebar/ui/sidebar";

interface SidebarPageSectionProps {
	title: string;

	children: ReactNode;

	headerActions?: ReactNode;

	className?: string;
}

export function SidebarPageSection({
	title,
	children,
	headerActions,
	className,
}: SidebarPageSectionProps) {
	return (
		<SidebarGroup className={className}>
			<div className='group/page-section flex items-center justify-between'>
				<SidebarGroupLabel>{title}</SidebarGroupLabel>

				{headerActions && (
					<div className='flex items-center gap-0.5'>
						{headerActions}
					</div>
				)}
			</div>

			<SidebarGroupContent>
				<SidebarMenu>{children}</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
