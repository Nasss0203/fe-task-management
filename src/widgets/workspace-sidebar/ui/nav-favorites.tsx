"use client";

import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { buildPageTree } from "@/entities/page/lib/build-page-tree";
import {
	useCreatePage,
	useMovePageToTrash,
} from "@/entities/page/model/page.mutations";
import { usePageFavorites } from "@/entities/page/model/page.queries";
import type { Page } from "@/entities/page/model/page.types";
import { PageTree } from "@/entities/page/ui/page-tree";

import type { Teamspace } from "@/entities/teamspace/model/teamspace.types";

import { CreatePageDialog } from "@/features/page/create-page/ui/create-page-dialog";
import { PageActionsMenu } from "@/features/page/page-actions/ui/page-actions-menu";

import { SidebarPageSection } from "@/widgets/workspace-sidebar/ui/sidebar-page-section";

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

	const favoritePages = useMemo(() => {
		if (favorites.length === 0) {
			return [];
		}

		const childrenByParentId = new Map<string, Page[]>();

		for (const page of pages) {
			if (!page.parent_page_id) {
				continue;
			}

			const children = childrenByParentId.get(page.parent_page_id) ?? [];

			children.push(page);

			childrenByParentId.set(page.parent_page_id, children);
		}

		/**
		 * Những Page cần hiển thị trong Favorites.
		 */
		const includedIds = new Set<string>();

		const collectDescendants = (pageId: string) => {
			if (includedIds.has(pageId)) {
				return;
			}

			includedIds.add(pageId);

			const children = childrenByParentId.get(pageId) ?? [];

			for (const child of children) {
				collectDescendants(child.id);
			}
		};

		for (const favorite of favorites) {
			collectDescendants(favorite.id);
		}

		return pages
			.filter((page) => includedIds.has(page.id))
			.map((page) => ({
				...page,

				parent_page_id:
					page.parent_page_id && includedIds.has(page.parent_page_id)
						? page.parent_page_id
						: null,
			}));
	}, [favorites, pages]);

	const favoritePageTree = useMemo(
		() => buildPageTree(favoritePages),
		[favoritePages],
	);

	if (!workspaceId || isLoading || favoritePageTree.length === 0) {
		return null;
	}

	const handleOpenCreateChildPage = (page: Page) => {
		setSelectedParentPage(page);

		setCreateDialogOpen(true);
	};

	/**
	 * Create child Page.
	 */
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
			<SidebarPageSection
				title='Favorites'
				className='group-data-[collapsible=icon]:hidden'
			>
				<PageTree
					pages={favoritePageTree}
					activePageId={activePageId}
					onOpenPage={(page) => {
						router.push(`/page/${page.id}`);
					}}
					onCreateChild={(page) => {
						handleOpenCreateChildPage(page);
					}}
					renderActions={(page) => (
						<PageActionsMenu
							page={page}
							pages={pages}
							teamspaces={teamspaces}
							onMoveToTrash={handleMovePageToTrash}
						>
							<button
								type='button'
								aria-label='More page actions'
								className={[
									"flex size-6 shrink-0 items-center justify-center rounded-sm",
									"text-muted-foreground",
									"hover:bg-sidebar-accent-foreground/10",
									"hover:text-sidebar-foreground",
								].join(" ")}
								onClick={(event) => {
									event.stopPropagation();
								}}
							>
								<MoreHorizontal className='size-3.5' />
							</button>
						</PageActionsMenu>
					)}
				/>
			</SidebarPageSection>

			<CreatePageDialog
				open={createDialogOpen}
				onOpenChange={handleDialogOpenChange}
				onCreate={handleCreatePage}
			/>
		</>
	);
}
