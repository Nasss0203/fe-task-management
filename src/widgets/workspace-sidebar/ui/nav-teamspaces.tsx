"use client";

import {
	ChevronDown,
	ChevronRight,
	Ellipsis,
	MoreHorizontal,
	Plus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Page } from "@/entities/page/model/page.types";
import type { Teamspace } from "@/entities/teamspace/model/teamspace.types";

import { useCreatePage } from "@/entities/page/model/page.mutations";
import { useCreateTeamspace } from "@/entities/teamspace/model/teamspace.mutations";

import { CreatePageDialog } from "@/features/page/create-page/ui/create-page-dialog";
import { CreateTeamspaceDialog } from "@/features/teamspace/create-teamspace/ui/create-teamspace-dialog";

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

	/**
	 * Create Page
	 */
	const createPageMutation = useCreatePage();

	const [createPageDialogOpen, setCreatePageDialogOpen] = useState(false);

	const [selectedTeamspaceId, setSelectedTeamspaceId] = useState<
		string | null
	>(null);

	/**
	 * Create Teamspace
	 */
	const createTeamspaceMutation = useCreateTeamspace();

	const [createTeamspaceDialogOpen, setCreateTeamspaceDialogOpen] =
		useState(false);

	/**
	 * Mở dialog tạo Page trong một Teamspace.
	 */
	const handleOpenCreatePage = (teamspaceId: string) => {
		setSelectedTeamspaceId(teamspaceId);
		setCreatePageDialogOpen(true);
	};

	/**
	 * Tạo Page thuộc Teamspace.
	 */
	const handleCreatePage = (title: string) => {
		if (!selectedTeamspaceId) {
			return;
		}

		createPageMutation.mutate(
			{
				workspace_id: workspaceId,
				teamspace_id: selectedTeamspaceId,
				title,
			},
			{
				onSuccess: (page) => {
					setCreatePageDialogOpen(false);
					setSelectedTeamspaceId(null);

					router.push(`/page/${page.id}`);
				},
			},
		);
	};

	/**
	 * Tạo Teamspace mới.
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
			{/* Header Teamspaces */}
			<div className='group/teamspaces flex items-center justify-between'>
				<SidebarGroupLabel>Teamspaces</SidebarGroupLabel>

				<div className='flex items-center gap-1'>
					{/* Create Teamspace */}
					<Button
						type='button'
						variant='ghost'
						size='icon'
						disabled={createTeamspaceMutation.isPending}
						className='hidden h-6 w-6 group-hover/teamspaces:flex'
						onClick={() => setCreateTeamspaceDialogOpen(true)}
					>
						<Plus size={13} />
					</Button>

					<Button
						type='button'
						variant='ghost'
						size='icon'
						className='hidden h-6 w-6 group-hover/teamspaces:flex'
					>
						<Ellipsis size={13} />
					</Button>
				</div>
			</div>

			{/* Teamspace list */}
			<SidebarGroupContent>
				{teamspaces.map((teamspace) => {
					/**
					 * Chỉ lấy Page thuộc đúng Teamspace này.
					 */
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
							onCreatePage={() =>
								handleOpenCreatePage(teamspace.id)
							}
						/>
					);
				})}
			</SidebarGroupContent>

			{/* Create Page inside Teamspace */}
			<CreatePageDialog
				open={createPageDialogOpen}
				onOpenChange={(open) => {
					setCreatePageDialogOpen(open);

					if (!open) {
						setSelectedTeamspaceId(null);
					}
				}}
				onCreate={handleCreatePage}
			/>

			{/* Create Teamspace */}
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

	onCreatePage: () => void;
}

function TeamspaceItem({
	teamspace,
	pages,
	activePageId,
	isCreatingPage = false,
	onCreatePage,
}: TeamspaceItemProps) {
	const [expanded, setExpanded] = useState(true);

	return (
		<div>
			{/* Teamspace row */}
			<div className='group/teamspace relative flex h-8 items-center gap-1 px-2'>
				{/* Expand / Collapse */}
				<Button
					type='button'
					variant='ghost'
					size='icon'
					className='h-5 w-5 shrink-0'
					onClick={() => {
						setExpanded((value) => !value);
					}}
				>
					{expanded ? (
						<ChevronDown size={13} />
					) : (
						<ChevronRight size={13} />
					)}
				</Button>

				{/* Teamspace icon */}
				<span className='text-sm'>{teamspace.icon || "🏠"}</span>

				{/* Teamspace name */}
				<button
					type='button'
					className='min-w-0 flex-1 truncate text-left text-sm font-medium'
					onClick={() => {
						setExpanded((value) => !value);
					}}
				>
					{teamspace.name}
				</button>

				{/* Create Page inside Teamspace */}
				<Button
					type='button'
					variant='ghost'
					size='icon'
					disabled={isCreatingPage}
					className='hidden h-6 w-6 group-hover/teamspace:flex'
					onClick={(event) => {
						event.preventDefault();
						event.stopPropagation();

						onCreatePage();

						setExpanded(true);
					}}
				>
					<Plus size={13} />
				</Button>

				{/* Teamspace actions */}
				<Button
					type='button'
					variant='ghost'
					size='icon'
					className='hidden h-6 w-6 group-hover/teamspace:flex'
				>
					<MoreHorizontal size={13} />
				</Button>
			</div>

			{/* Pages inside Teamspace */}
			{expanded && (
				<SidebarMenu>
					{pages.map((page) => (
						<SidebarMenuItem key={page.id} className='pl-5'>
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
			)}
		</div>
	);
}
