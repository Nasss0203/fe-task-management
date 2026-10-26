"use client";

import {
	ChevronRight,
	Compass,
	Ellipsis,
	Link2,
	LogOut,
	Mail,
	MoreHorizontal,
	Plus,
	Shield,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
	buildPageTree,
	getPageTreeHref,
	type PageTreeBase,
	withDatabaseNodes,
} from "@/entities/page/lib/build-page-tree";
import {
	useMovePageToTrash,
} from "@/entities/page/model/page.mutations";
import type { Page, WorkspaceDatabase } from "@/entities/page/model/page.types";
import { PageTree } from "@/entities/page/ui/page-tree";

import {
	useCreateTeamspace,
	useLeaveTeamspace,
} from "@/entities/teamspace/model/teamspace.mutations";
import { useMyTeamspaceInvitations } from "@/entities/teamspace/model/teamspace.queries";
import type { Teamspace } from "@/entities/teamspace/model/teamspace.types";

import { CreatePageDialog } from "@/widgets/create-page";
import { BrowseTeamspacesDialog } from "@/features/teamspace/browse-teamspaces/ui/browse-teamspaces-dialog";
import { CreateTeamspaceDialog } from "@/features/teamspace/create-teamspace/ui/create-teamspace-dialog";
import { ConfirmActionDialog } from "@/features/teamspace/manage-teamspace/ui/confirm-action-dialog";
import {
	TeamspaceSettingsDialog,
	type TeamspaceSettingsTab,
} from "@/features/teamspace/manage-teamspace/ui/teamspace-settings-dialog";

import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { Button } from "@/shared/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

import { PageActionsMenu } from "@/features/page/page-actions/ui/page-actions-menu";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
} from "@/widgets/workspace-sidebar/ui/sidebar";

interface NavTeamspacesProps {
	workspaceId: string;
	teamspaces: Teamspace[];
	pages: Page[];
	databases: WorkspaceDatabase[];
	activePageId?: string;
}

export function NavTeamspaces({
	workspaceId,
	teamspaces,
	pages,
	databases,
	activePageId,
}: NavTeamspacesProps) {
	const router = useRouter();

	const movePageToTrashMutation = useMovePageToTrash();

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

	const [browseDialogOpen, setBrowseDialogOpen] = useState(false);

	// Stores the id so the dialog always renders the latest teamspace data.
	const [settingsTarget, setSettingsTarget] = useState<{
		teamspaceId: string;
		tab: TeamspaceSettingsTab;
	} | null>(null);

	const settingsTeamspace = settingsTarget
		? teamspaces.find((teamspace) => teamspace.id === settingsTarget.teamspaceId)
		: undefined;

	const leaveTeamspaceMutation = useLeaveTeamspace();

	const [teamspaceToLeave, setTeamspaceToLeave] = useState<Teamspace | null>(
		null,
	);

	const handleLeaveTeamspace = () => {
		if (!teamspaceToLeave) return;

		leaveTeamspaceMutation.mutate(teamspaceToLeave.id, {
			onSuccess: () => toast.success(`You left ${teamspaceToLeave.name}`),
			onError: (error) =>
				toast.error(
					getApiErrorMessage(error, "Could not leave the teamspace."),
				),
			onSettled: () => setTeamspaceToLeave(null),
		});
	};

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
	const selectedParentPage = pages.find(
		(page) => page.id === selectedParentPageId,
	);

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

	const handleMovePageToTrash = (page: Page) => {
		movePageToTrashMutation.mutate({
			pageId: page.id,
			workspaceId: page.workspace_id,
		});
	};

	return (
		<SidebarGroup>
			{/* Teamspaces header */}
			<div className='group/teamspaces flex items-center justify-between'>
				<SidebarGroupLabel>Teamspaces</SidebarGroupLabel>

				<div className='flex items-center gap-0.5'>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								type='button'
								variant='ghost'
								size='icon'
								aria-label='Teamspace options'
								className='hidden h-6 w-6 group-hover/teamspaces:flex data-[state=open]:flex'
							>
								<Ellipsis size={13} />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align='start' className='w-52'>
							<DropdownMenuItem onSelect={() => setBrowseDialogOpen(true)}>
								<Compass className='size-4' />
								Browse teamspaces
							</DropdownMenuItem>

							<DropdownMenuItem asChild>
								<Link href='/teamspaces/invitations'>
									<Mail className='size-4' />
									Your invitations
								</Link>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

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
				{teamspaces.length === 0 && (
					<TeamspacesEmptyState
						onCreate={() => setCreateTeamspaceDialogOpen(true)}
					/>
				)}

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
								databases={databases}
								allPages={pages}
								teamspaces={teamspaces}
								activePageId={activePageId}
								onOpenPage={(page) => {
									router.push(getPageTreeHref(page));
								}}
								onCreateRootPage={() => {
									handleOpenCreateRootPage(teamspace.id);
								}}
								onCreateChildPage={handleOpenCreateChildPage}
								onMovePageToTrash={handleMovePageToTrash}
								onOpenSettings={(tab) => {
									setSettingsTarget({
										teamspaceId: teamspace.id,
										tab,
									});
								}}
								onLeave={() => setTeamspaceToLeave(teamspace)}
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
				workspaceId={workspaceId}
				defaultLocation={{
					teamspaceId: selectedTeamspaceId,
					parentPage: selectedParentPage ?? null,
				}}
			/>

			<CreateTeamspaceDialog
				open={createTeamspaceDialogOpen}
				onOpenChange={setCreateTeamspaceDialogOpen}
				onCreate={handleCreateTeamspace}
				isLoading={createTeamspaceMutation.isPending}
			/>

			{settingsTarget && settingsTeamspace && (
				<TeamspaceSettingsDialog
					key={`${settingsTarget.teamspaceId}:${settingsTarget.tab}`}
					teamspace={settingsTeamspace}
					initialTab={settingsTarget.tab}
					open
					onOpenChange={(open) => {
						if (!open) setSettingsTarget(null);
					}}
				/>
			)}

			<BrowseTeamspacesDialog
				workspaceId={workspaceId}
				open={browseDialogOpen}
				onOpenChange={setBrowseDialogOpen}
			/>

			<ConfirmActionDialog
				open={teamspaceToLeave !== null}
				title='Leave teamspace?'
				description={`You will lose access to the pages in ${teamspaceToLeave?.name ?? "this teamspace"} unless someone invites you again.`}
				confirmLabel='Leave teamspace'
				pendingLabel='Leaving...'
				isPending={leaveTeamspaceMutation.isPending}
				onOpenChange={(open) => !open && setTeamspaceToLeave(null)}
				onConfirm={handleLeaveTeamspace}
			/>
		</SidebarGroup>
	);
}

/**
 * The list already contains every open teamspace, so an empty list means the
 * workspace has none the user can see: point to creating one or to invitations,
 * which may belong to another workspace.
 */
function TeamspacesEmptyState({ onCreate }: { onCreate: () => void }) {
	const { data: invitations = [] } = useMyTeamspaceInvitations();

	const pendingCount = invitations.filter(
		(invitation) => invitation.status === "PENDING",
	).length;

	return (
		<div className='flex flex-col gap-1.5 px-2 py-1.5 text-xs text-muted-foreground'>
			<p>No teamspaces in this workspace yet.</p>

			<button
				type='button'
				onClick={onCreate}
				className='flex w-fit items-center gap-1.5 rounded-sm font-medium text-sidebar-foreground/80 hover:text-sidebar-foreground'
			>
				<Plus className='size-3.5' />
				Create a teamspace
			</button>

			{pendingCount > 0 && (
				<Link
					href='/teamspaces/invitations'
					className='flex w-fit items-center gap-1.5 rounded-sm font-medium text-primary hover:underline'
				>
					<Mail className='size-3.5' />
					{pendingCount} pending invitation{pendingCount === 1 ? "" : "s"}
				</Link>
			)}
		</div>
	);
}

interface TeamspaceItemProps {
	teamspace: Teamspace;

	pages: Page[];

	databases: WorkspaceDatabase[];

	allPages: Page[];

	teamspaces: Teamspace[];

	activePageId?: string;

	isCreatingPage?: boolean;

	onOpenPage: (page: PageTreeBase) => void;

	onCreateRootPage: () => void;

	onCreateChildPage: (page: Page) => void;

	onMovePageToTrash: (page: Page) => void;

	onOpenSettings: (tab: TeamspaceSettingsTab) => void;

	onLeave: () => void;
}

function TeamspaceItem({
	teamspace,
	pages,
	databases,
	allPages,
	teamspaces,
	activePageId,
	isCreatingPage = false,
	onOpenPage,
	onCreateRootPage,
	onCreateChildPage,
	onMovePageToTrash,
	onOpenSettings,
	onLeave,
}: TeamspaceItemProps) {
	const [expanded, setExpanded] = useState(true);

	const pageTree = buildPageTree(withDatabaseNodes(pages, databases));

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
				<div className='mr-1 hidden shrink-0 items-center gap-0.5 group-hover/teamspace:flex has-[[data-state=open]]:flex'>
					{/* More */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								type='button'
								aria-label={`${teamspace.name} options`}
								className='flex size-6 items-center justify-center rounded-sm text-muted-foreground hover:bg-sidebar-accent-foreground/10 hover:text-sidebar-foreground'
								onClick={(event) => event.stopPropagation()}
							>
								<MoreHorizontal size={13} />
							</button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align='start' className='w-52'>
							<DropdownMenuItem onSelect={() => onOpenSettings("members")}>
								<Users className='size-4' />
								Members
							</DropdownMenuItem>

							<DropdownMenuItem onSelect={() => onOpenSettings("links")}>
								<Link2 className='size-4' />
								Invite links
							</DropdownMenuItem>

							<DropdownMenuItem onSelect={() => onOpenSettings("access")}>
								<Shield className='size-4' />
								Access
							</DropdownMenuItem>

							<DropdownMenuSeparator />

							<DropdownMenuItem variant='destructive' onSelect={onLeave}>
								<LogOut className='size-4' />
								Leave teamspace
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

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
						onCreateChild={(page) => {
							if (!("kind" in page)) {
								onCreateChildPage(page);
							}
						}}
						renderActions={(page) =>
							"kind" in page ? null : (
								<PageActionsMenu
									page={page}
									pages={allPages}
									teamspaces={teamspaces}
									onMoveToTrash={onMovePageToTrash}
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
							)
						}
					/>
				</div>
			)}
		</div>
	);
}
