"use client";

import { Ellipsis, MoreHorizontal, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useCreatePage } from "@/entities/page/model/page.mutations";
import type { Page } from "@/entities/page/model/page.types";

import { CreatePageDialog } from "@/features/page/create-page/ui/create-page-dialog";

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

interface NavPrivatePagesProps {
	workspaceId: string;
	pages: Page[];
	activePageId?: string;
}

export function NavPrivatePages({
	workspaceId,
	pages,
	activePageId,
}: NavPrivatePagesProps) {
	const router = useRouter();

	const createPageMutation = useCreatePage();

	const [createDialogOpen, setCreateDialogOpen] = useState(false);

	const privatePages = pages.filter((page) => page.teamspace_id === null);

	const handleCreatePage = (title: string) => {
		createPageMutation.mutate(
			{
				workspace_id: workspaceId,
				teamspace_id: null,
				title,
			},
			{
				onSuccess: (page) => {
					setCreateDialogOpen(false);

					router.push(`/page/${page.id}`);
				},
			},
		);
	};

	return (
		<SidebarGroup>
			<div className='group/private flex items-center justify-between'>
				<SidebarGroupLabel>Private</SidebarGroupLabel>

				<div className='flex items-center gap-1'>
					<Button
						type='button'
						variant='ghost'
						size='icon'
						disabled={createPageMutation.isPending}
						className='hidden h-6 w-6 group-hover/private:flex'
						onClick={() => {
							setCreateDialogOpen(true);
						}}
					>
						<Plus size={13} />
					</Button>

					<Button
						type='button'
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
					{privatePages.map((page) => (
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

							<SidebarMenuAction showOnHover className='right-1'>
								<MoreHorizontal size={14} />
							</SidebarMenuAction>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>

			<CreatePageDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				onCreate={handleCreatePage}
			/>
		</SidebarGroup>
	);
}
