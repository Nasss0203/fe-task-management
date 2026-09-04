"use client";

import {
	useCreatePage,
	useMovePageToTrash,
} from "@/entities/page/model/page.mutations";
import { usePageFavorites } from "@/entities/page/model/page.queries";
import type { Page } from "@/entities/page/model/page.types";
import type { Teamspace } from "@/entities/teamspace/model/teamspace.types";
import { CreatePageDialog } from "@/features/page/create-page/ui/create-page-dialog";
import { PageActionsMenu } from "@/features/page/page-actions/ui/page-actions-menu";
import { MoreHorizontal, Plus } from "lucide-react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/widgets/workspace-sidebar/ui/sidebar";

interface NavFavoritesProps {
	workspaceId?: string;
	activePageId?: string;
	pages: Page[];
	teamspaces: Teamspace[];
}

export function NavFavorites({
	workspaceId,
	activePageId,
	pages,
	teamspaces,
}: NavFavoritesProps) {
	const router = useRouter();
	const { data: favorites = [], isLoading } = usePageFavorites(workspaceId);
	const createPage = useCreatePage();
	const movePageToTrash = useMovePageToTrash();
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [selectedParentPage, setSelectedParentPage] = useState<Page | null>(
		null,
	);

	if (!workspaceId || isLoading || favorites.length === 0) {
		return null;
	}

	const handleOpenCreateChildPage = (page: Page) => {
		setSelectedParentPage(page);
		setCreateDialogOpen(true);
	};

	const handleCreatePage = (title: string) => {
		if (!selectedParentPage) {
			return;
		}

		createPage.mutate(
			{
				workspace_id: selectedParentPage.workspace_id,
				teamspace_id: selectedParentPage.teamspace_id,
				parent_page_id: selectedParentPage.id,
				title,
			},
			{
				onSuccess: (page) => {
					setCreateDialogOpen(false);
					setSelectedParentPage(null);
					router.push(`/page/${page.id}`);
				},
			},
		);
	};

	const handleDialogOpenChange = (open: boolean) => {
		setCreateDialogOpen(open);

		if (!open) {
			setSelectedParentPage(null);
		}
	};

	const handleMovePageToTrash = (page: Page) => {
		movePageToTrash.mutate({
			pageId: page.id,
			workspaceId: page.workspace_id,
		});
	};

	return (
		<>
			<SidebarGroup className="group-data-[collapsible=icon]:hidden">
				<SidebarGroupLabel>Favorites</SidebarGroupLabel>
				<SidebarMenu>
					{favorites.map((page) => (
						<SidebarMenuItem key={page.id}>
							<SidebarMenuButton
								asChild
								isActive={page.id === activePageId}
								className="pr-16"
							>
								<NextLink href={`/page/${page.id}`} title={page.title}>
									<span>{page.icon || "📄"}</span>
									<span>{page.title || "Untitled"}</span>
								</NextLink>
							</SidebarMenuButton>

							<div className="pointer-events-none absolute top-1 right-1 flex items-center gap-0.5 opacity-0 transition-opacity duration-100 group-focus-within/menu-item:pointer-events-auto group-focus-within/menu-item:opacity-100 group-hover/menu-item:pointer-events-auto group-hover/menu-item:opacity-100">
								<PageActionsMenu
									page={page}
									pages={pages}
									teamspaces={teamspaces}
									onMoveToTrash={handleMovePageToTrash}
								>
									<button
										type="button"
										aria-label="More page actions"
										className="flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-sidebar-accent-foreground/10 hover:text-sidebar-foreground"
										onClick={(event) => {
											event.stopPropagation();
										}}
									>
										<MoreHorizontal className="size-3.5" />
									</button>
								</PageActionsMenu>

								<button
									type="button"
									aria-label="Create child page"
									disabled={createPage.isPending}
									className="flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-sidebar-accent-foreground/10 hover:text-sidebar-foreground disabled:pointer-events-none disabled:opacity-50"
									onClick={(event) => {
										event.stopPropagation();
										handleOpenCreateChildPage(page);
									}}
								>
									<Plus className="size-3.5" />
								</button>
							</div>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroup>

			<CreatePageDialog
				open={createDialogOpen}
				onOpenChange={handleDialogOpenChange}
				onCreate={handleCreatePage}
			/>
		</>
	);
}
