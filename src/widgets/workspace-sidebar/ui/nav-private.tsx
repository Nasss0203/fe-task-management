"use client";

import { Ellipsis, Plus } from "lucide-react";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { buildPageTree } from "@/entities/page/lib/build-page-tree";
import { useCreatePage } from "@/entities/page/model/page.mutations";
import type { Page } from "@/entities/page/model/page.types";
import { PageTree } from "@/entities/page/ui/page-tree";

import { CreatePageDialog } from "@/features/page/create-page/ui/create-page-dialog";

import { Button } from "@/shared/ui/button";

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
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

	const [selectedParentPageId, setSelectedParentPageId] = useState<
		string | null
	>(null);

	/**
	 * Lấy toàn bộ Private pages.
	 *
	 * Bao gồm:
	 * - root pages
	 * - child pages
	 */
	const privatePages = pages.filter((page) => page.teamspace_id === null);

	/**
	 * Flat list -> Tree.
	 */
	const privatePageTree = buildPageTree(privatePages);

	/**
	 * + ở header Private.
	 *
	 * Tạo root Page.
	 */
	const handleOpenCreateRootPage = () => {
		setSelectedParentPageId(null);

		setCreateDialogOpen(true);
	};

	/**
	 * + cạnh Page.
	 *
	 * Tạo child Page.
	 */
	const handleOpenCreateChildPage = (parentPageId: string) => {
		setSelectedParentPageId(parentPageId);

		setCreateDialogOpen(true);
	};

	/**
	 * Submit Create Page.
	 */
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

	/**
	 * Reset context khi đóng dialog.
	 */
	const handleDialogOpenChange = (open: boolean) => {
		setCreateDialogOpen(open);

		if (!open) {
			setSelectedParentPageId(null);
		}
	};

	const handleOpenPageActions = (page: Page) => {
		console.log("Open page actions:", page);
	};

	return (
		<SidebarGroup>
			{/* Private header */}
			<div className='group/private flex items-center justify-between'>
				<SidebarGroupLabel>Private</SidebarGroupLabel>

				<div className='flex items-center gap-0.5'>
					{/* Private actions */}
					<Button
						type='button'
						variant='ghost'
						size='icon'
						className={[
							"hidden h-6 w-6",
							"group-hover/private:flex",
							"hover:bg-sidebar-accent",
						].join(" ")}
					>
						<Ellipsis size={13} />
					</Button>
					{/* Create root Page */}
					<Button
						type='button'
						variant='ghost'
						size='icon'
						disabled={createPageMutation.isPending}
						className={[
							"hidden h-6 w-6",
							"group-hover/private:flex",
							"hover:bg-sidebar-accent",
						].join(" ")}
						onClick={handleOpenCreateRootPage}
					>
						<Plus size={13} />
					</Button>
				</div>
			</div>

			{/* Pages */}
			<SidebarGroupContent>
				<SidebarMenu>
					<PageTree
						pages={privatePageTree}
						activePageId={activePageId}
						onOpenPage={(page) => {
							router.push(`/page/${page.id}`);
						}}
						onCreateChild={(page) => {
							handleOpenCreateChildPage(page.id);
						}}
						onOpenActions={(page) => {
							handleOpenPageActions(page);
						}}
					/>
				</SidebarMenu>
			</SidebarGroupContent>

			{/* Create Page */}
			<CreatePageDialog
				open={createDialogOpen}
				onOpenChange={handleDialogOpenChange}
				onCreate={handleCreatePage}
			/>
		</SidebarGroup>
	);
}
