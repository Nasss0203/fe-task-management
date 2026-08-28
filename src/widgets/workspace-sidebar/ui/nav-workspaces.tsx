"use client";

import { Ellipsis, MoreHorizontal, Plus } from "lucide-react";
import Link from "next/link";

import type { Page } from "@/entities/page/model/page.types";
import { Button } from "@/shared/ui/button";

import { useCreatePage } from "@/entities/page/model/page.mutations";
import { CreatePageDialog } from "@/features/page/create-page/ui/create-page-dialog";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/widgets/workspace-sidebar/ui/sidebar";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface NavPagesProps {
	pages: Page[];
	activePageId?: string;
	onCreatePage?: () => void;
	isCreatingPage?: boolean;
}

export function NavPages({
	pages,
	activePageId,
	onCreatePage,
	isCreatingPage = false,
}: NavPagesProps) {
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const router = useRouter();
	const createPageMutation = useCreatePage();
	const [createPageWorkspaceId, setCreatePageWorkspaceId] = useState<
		string | null
	>(null);
	return (
		<SidebarGroup>
			<div className='group/private flex items-center justify-between'>
				<SidebarGroupLabel>Private</SidebarGroupLabel>

				<div className='flex items-center gap-1'>
					<Button
						type='button'
						variant='ghost'
						size='icon'
						disabled={isCreatingPage}
						className='hidden h-6 w-6 group-hover/private:flex'
						onClick={onCreatePage}
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
							<SidebarMenuAction showOnHover className='right-6'>
								<Plus
									onClick={(event) => {
										event.preventDefault();
										event.stopPropagation();

										setCreatePageWorkspaceId(
											page.workspace_id,
										);
										setCreateDialogOpen(true);
									}}
								/>
							</SidebarMenuAction>

							<SidebarMenuAction showOnHover className='right-1'>
								<MoreHorizontal />
							</SidebarMenuAction>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
			<CreatePageDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				onCreate={(title) => {
					if (!createPageWorkspaceId) {
						return;
					}

					createPageMutation.mutate(
						{
							workspace_id: createPageWorkspaceId,
							title,
						},
						{
							onSuccess: (page) => {
								setCreateDialogOpen(false);
								setCreatePageWorkspaceId(null);

								router.push(`/page/${page.id}`);
							},
						},
					);
				}}
			/>
		</SidebarGroup>
	);
}
