"use client";

import { Ellipsis, MoreHorizontal, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { buildPageTree } from "@/entities/page/lib/build-page-tree";
import {
	useCreatePage,
	useMovePageToTrash,
} from "@/entities/page/model/page.mutations";
import type { Page } from "@/entities/page/model/page.types";
import { PageTree } from "@/entities/page/ui/page-tree";

import { CreatePageDialog } from "@/features/page/create-page/ui/create-page-dialog";
import { PageActionsMenu } from "@/features/page/page-actions/ui/page-actions-menu";

import { Button } from "@/shared/ui/button";

import { SidebarPageSection } from "@/widgets/workspace-sidebar/ui/sidebar-page-section";

interface TeamspaceOption {
	id: string;
	name: string;
}

interface NavPrivatePagesProps {
	workspaceId: string;
	pages: Page[];
	teamspaces: TeamspaceOption[];
	activePageId?: string;
}

export function NavPrivatePages({
	workspaceId,
	pages,
	teamspaces,
	activePageId,
}: NavPrivatePagesProps) {
	const router = useRouter();

	const createPageMutation = useCreatePage();
	const movePageToTrashMutation = useMovePageToTrash();

	const [createDialogOpen, setCreateDialogOpen] = useState(false);

	const [selectedParentPageId, setSelectedParentPageId] = useState<
		string | null
	>(null);

	const privatePages = pages.filter((page) => page.teamspace_id === null);

	const privatePageTree = buildPageTree(privatePages);

	const handleOpenCreateRootPage = () => {
		setSelectedParentPageId(null);
		setCreateDialogOpen(true);
	};

	const handleOpenCreateChildPage = (parentPageId: string) => {
		setSelectedParentPageId(parentPageId);
		setCreateDialogOpen(true);
	};

	const handleCreatePage = (title: string) => {
		createPageMutation.mutate(
			{
				workspace_id: workspaceId,
				teamspace_id: null,
				parent_page_id: selectedParentPageId,
				title,
			},
			{
				onSuccess: (page) => {
					setCreateDialogOpen(false);

					setSelectedParentPageId(null);

					router.push(`/page/${page.id}`);
				},
			},
		);
	};

	const handleDialogOpenChange = (open: boolean) => {
		setCreateDialogOpen(open);

		if (!open) {
			setSelectedParentPageId(null);
		}
	};

	const handleMovePageToTrash = (page: Page) => {
		movePageToTrashMutation.mutate({
			pageId: page.id,
			workspaceId: page.workspace_id,
		});
	};

	return (
		<>
			<SidebarPageSection
				title='Private'
				headerActions={
					<>
						<Button
							type='button'
							variant='ghost'
							size='icon'
							className={[
								"h-6 w-6",
								"hover:bg-sidebar-accent",
							].join(" ")}
						>
							<Ellipsis size={13} />
						</Button>

						<Button
							type='button'
							variant='ghost'
							size='icon'
							disabled={createPageMutation.isPending}
							className={[
								"h-6 w-6",
								"hover:bg-sidebar-accent",
							].join(" ")}
							onClick={handleOpenCreateRootPage}
						>
							<Plus size={13} />
						</Button>
					</>
				}
			>
				<PageTree
					pages={privatePageTree}
					activePageId={activePageId}
					onOpenPage={(page) => {
						router.push(`/page/${page.id}`);
					}}
					onCreateChild={(page) => {
						handleOpenCreateChildPage(page.id);
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
