"use client";

import { ChevronRight, Ellipsis, MoreHorizontal, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { buildPageTree } from "@/entities/page/lib/build-page-tree";
import { useCreatePage } from "@/entities/page/model/page.mutations";
import type { Page } from "@/entities/page/model/page.types";
import { PageTree } from "@/entities/page/ui/page-tree";

import { useCreateTeamspace } from "@/entities/teamspace/model/teamspace.mutations";
import type { Teamspace } from "@/entities/teamspace/model/teamspace.types";

import { CreatePageDialog } from "@/features/page/create-page/ui/create-page-dialog";
import { CreateTeamspaceDialog } from "@/features/teamspace/create-teamspace/ui/create-teamspace-dialog";

import { Button } from "@/shared/ui/button";

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
} from "@/widgets/workspace-sidebar/ui/sidebar";

interface NavTeamspacesProps {
	workspaceId: string;
	teamspaces: Teamspace[];
	pages: Page[];
	activePageId?: string;
}

export function NavTeamspaces({
	workspaceId,
	teamspaces,
	pages,
	activePageId,
}: NavTeamspacesProps) {
	const router = useRouter();

	const createPageMutation = useCreatePage();

	const [createPageDialogOpen, setCreatePageDialogOpen] = useState(false);

	const [selectedTeamspaceId, setSelectedTeamspaceId] = useState<
		string | null
	>(null);

	const [selectedParentPageId, setSelectedParentPageId] = useState<
		string | null
	>(null);

	const createTeamspaceMutation = useCreateTeamspace();

	const [createTeamspaceDialogOpen, setCreateTeamspaceDialogOpen] =
		useState(false);

	/**
	 * Tạo Page root trong Teamspace.
	 */
	const handleOpenCreateRootPage = (teamspaceId: string) => {
		setSelectedTeamspaceId(teamspaceId);
		setSelectedParentPageId(null);
		setCreatePageDialogOpen(true);
	};

	/**
	 * Tạo Page con.
	 */
	const handleOpenCreateChildPage = (page: Page) => {
		if (!page.teamspace_id) {
			return;
		}

		setSelectedTeamspaceId(page.teamspace_id);

		setSelectedParentPageId(page.id);

		setCreatePageDialogOpen(true);
	};

	/**
	 * Create Page.
	 */
	const handleCreatePage = (title: string) => {
		if (!selectedTeamspaceId) {
			return;
		}

		createPageMutation.mutate(
			{
				workspace_id: workspaceId,
				teamspace_id: selectedTeamspaceId,
				parent_page_id: selectedParentPageId,
				title,
			},
			{
				onSuccess: (page) => {
					setCreatePageDialogOpen(false);

					setSelectedTeamspaceId(null);

					setSelectedParentPageId(null);

					router.push(`/page/${page.id}`);
				},
			},
		);
	};

	/**
	 * Create Teamspace.
	 */
	const handleCreateTeamspace = (data: {
		name: string;
		visibility: "OPEN" | "PRIVATE";
	}) => {
		createTeamspaceMutation.mutate(
			{
				workspaceId,
				name: data.name,
				visibility: data.visibility,
			},
			{
				onSuccess: () => {
					setCreateTeamspaceDialogOpen(false);
				},
			},
		);
	};

	return (
		<SidebarGroup>
			{/* Teamspaces header */}
			<div className='group/teamspaces flex items-center justify-between'>
				<SidebarGroupLabel>Teamspaces</SidebarGroupLabel>

				<div className='flex items-center gap-0.5'>
					<Button
						type='button'
						variant='ghost'
						size='icon'
						className='hidden h-6 w-6 group-hover/teamspaces:flex'
					>
						<Ellipsis size={13} />
					</Button>

					<Button
						type='button'
						variant='ghost'
						size='icon'
						disabled={createTeamspaceMutation.isPending}
						className='hidden h-6 w-6 group-hover/teamspaces:flex'
						onClick={() => {
							setCreateTeamspaceDialogOpen(true);
						}}
					>
						<Plus size={13} />
					</Button>
				</div>
			</div>

			{/* Teamspace list */}
			<SidebarGroupContent>
				<div className='space-y-0.5'>
					{teamspaces.map((teamspace) => {
						const teamspacePages = pages.filter(
							(page) => page.teamspace_id === teamspace.id,
						);

						return (
							<TeamspaceItem
								key={teamspace.id}
								teamspace={teamspace}
								pages={teamspacePages}
								activePageId={activePageId}
								isCreatingPage={createPageMutation.isPending}
								onOpenPage={(page) => {
									router.push(`/page/${page.id}`);
								}}
								onCreateRootPage={() => {
									handleOpenCreateRootPage(teamspace.id);
								}}
								onCreateChildPage={handleOpenCreateChildPage}
								onOpenPageActions={(page) => {
									console.log("Page actions:", page);
								}}
								onOpenTeamspaceActions={() => {
									console.log(
										"Teamspace actions:",
										teamspace,
									);
								}}
							/>
						);
					})}
				</div>
			</SidebarGroupContent>

			<CreatePageDialog
				open={createPageDialogOpen}
				onOpenChange={(open) => {
					setCreatePageDialogOpen(open);

					if (!open) {
						setSelectedTeamspaceId(null);

						setSelectedParentPageId(null);
					}
				}}
				onCreate={handleCreatePage}
			/>

			<CreateTeamspaceDialog
				open={createTeamspaceDialogOpen}
				onOpenChange={setCreateTeamspaceDialogOpen}
				onCreate={handleCreateTeamspace}
				isLoading={createTeamspaceMutation.isPending}
			/>
		</SidebarGroup>
	);
}

interface TeamspaceItemProps {
	teamspace: Teamspace;

	pages: Page[];

	activePageId?: string;

	isCreatingPage?: boolean;

	onOpenPage: (page: Page) => void;

	onCreateRootPage: () => void;

	onCreateChildPage: (page: Page) => void;

	onOpenPageActions: (page: Page) => void;

	onOpenTeamspaceActions: () => void;
}

function TeamspaceItem({
	teamspace,
	pages,
	activePageId,
	isCreatingPage = false,
	onOpenPage,
	onCreateRootPage,
	onCreateChildPage,
	onOpenPageActions,
	onOpenTeamspaceActions,
}: TeamspaceItemProps) {
	const [expanded, setExpanded] = useState(true);

	const pageTree = buildPageTree(pages);

	const hasPages = pageTree.length > 0;

	return (
		<div>
			{/* Teamspace row */}
			<div
				className={[
					"group/teamspace flex h-8 items-center rounded-md",
					"hover:bg-sidebar-accent/60",
				].join(" ")}
			>
				{/* Teamspace icon / Chevron */}
				<button
					type='button'
					className={[
						"group/icon relative flex size-6 shrink-0 items-center justify-center rounded-sm",
						hasPages
							? "cursor-pointer hover:bg-sidebar-accent-foreground/10"
							: "cursor-default",
					].join(" ")}
					onClick={(event) => {
						event.stopPropagation();

						if (!hasPages) {
							return;
						}

						setExpanded((value) => !value);
					}}
				>
					{/* Icon mặc định */}
					<span
						className={[
							"flex items-center justify-center text-sm",
							hasPages ? "group-hover/icon:hidden" : "",
						].join(" ")}
					>
						{teamspace.icon || "🏠"}
					</span>

					{/* Hover icon -> Chevron */}
					{hasPages && (
						<ChevronRight
							className={[
								"absolute hidden size-4",
								"group-hover/icon:block",
								"transition-transform duration-150",
								expanded ? "rotate-90" : "",
							].join(" ")}
						/>
					)}
				</button>

				{/* Teamspace name */}
				<button
					type='button'
					className='min-w-0 flex-1 truncate text-left text-sm font-medium'
					onClick={() => {
						if (hasPages) {
							setExpanded((value) => !value);
						}
					}}
				>
					{teamspace.name}
				</button>

				{/* Actions */}
				<div className='mr-1 hidden shrink-0 items-center gap-0.5 group-hover/teamspace:flex'>
					{/* More */}
					<button
						type='button'
						className='flex size-6 items-center justify-center rounded-sm text-muted-foreground hover:bg-sidebar-accent-foreground/10 hover:text-sidebar-foreground'
						onClick={(event) => {
							event.stopPropagation();

							onOpenTeamspaceActions();
						}}
					>
						<MoreHorizontal size={13} />
					</button>

					{/* Create root Page */}
					<button
						type='button'
						disabled={isCreatingPage}
						className='flex size-6 items-center justify-center rounded-sm text-muted-foreground hover:bg-sidebar-accent-foreground/10 hover:text-sidebar-foreground disabled:pointer-events-none disabled:opacity-50'
						onClick={(event) => {
							event.stopPropagation();

							onCreateRootPage();

							setExpanded(true);
						}}
					>
						<Plus size={13} />
					</button>
				</div>
			</div>

			{/* Pages */}
			{expanded && hasPages && (
				<div className='ml-4'>
					<PageTree
						pages={pageTree}
						activePageId={activePageId}
						onOpenPage={onOpenPage}
						onCreateChild={onCreateChildPage}
						onOpenActions={onOpenPageActions}
					/>
				</div>
			)}
		</div>
	);
}
