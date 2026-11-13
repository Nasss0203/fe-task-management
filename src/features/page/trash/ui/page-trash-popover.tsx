"use client";

import {
	ChevronDown,
	Database,
	FileText,
	RotateCcw,
	Search,
	Trash2,
	TriangleAlert,
	Users,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { toast } from "sonner";

import {
	useDeleteDatabasePermanently,
	useDeletePagePermanently,
	useRestoreDatabase,
	useRestorePage,
} from "@/entities/page/model/page.mutations";
import {
	useDeletedWorkspaceDatabases,
	usePagesByWorkspace,
	useTrashPages,
} from "@/entities/page/model/page.queries";
import { useRestoreTeamspace } from "@/entities/teamspace/model/teamspace.mutations";
import { useArchivedTeamspaces } from "@/entities/teamspace/model/teamspace.queries";
import { useWorkspaceAccess } from "@/entities/workspace/model/workspace.queries";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { DeletePagePermanentlyDialog } from "./delete-page-permanently-dialog";

const TRASH_FILTER_CLASS =
	"rounded-full px-2 text-xs font-normal text-muted-foreground has-[>svg]:px-2";

interface PageTrashPopoverProps {
	workspaceId: string;
	children: ReactNode;
}

interface TrashItem {
	kind: "page" | "database" | "teamspace";
	id: string;
	/** The page itself, or the page that holds the database. */
	pageId: string;
	title: string;
	icon: string | null;
	location: string;
	deletedAt: string | null;
}

export function PageTrashPopover({
	workspaceId,
	children,
}: PageTrashPopoverProps) {
	const [open, setOpen] = useState(false);

	const [search, setSearch] = useState("");
	const [itemPendingDelete, setItemPendingDelete] = useState<
		(TrashItem & { kind: "page" | "database" }) | null
	>(null);

	const { data: pages = [], isLoading: isPagesLoading } = useTrashPages(
		open ? workspaceId : undefined,
	);

	const { data: databases = [], isLoading: isDatabasesLoading } =
		useDeletedWorkspaceDatabases(open ? workspaceId : undefined);

	// Already cached by the sidebar; used to name the page holding a database.
	const { data: workspacePages = [] } = usePagesByWorkspace(
		open ? workspaceId : undefined,
	);

	const { data: archivedTeamspaces = [], isLoading: isTeamspacesLoading } =
		useArchivedTeamspaces(workspaceId, open);

	const { data: access } = useWorkspaceAccess(workspaceId);
	const canDeletePermanently =
		access?.permissions.includes("page.permanent_delete") ?? false;

	const isLoading =
		isPagesLoading || isDatabasesLoading || isTeamspacesLoading;

	const restoreMutation = useRestorePage();

	const restoreDatabaseMutation = useRestoreDatabase();

	const deleteMutation = useDeletePagePermanently();

	const deleteDatabaseMutation = useDeleteDatabasePermanently();

	const restoreTeamspaceMutation = useRestoreTeamspace();

	const filteredItems = useMemo(() => {
		const trashPageMap = new Map(pages.map((page) => [page.id, page]));

		const workspacePageMap = new Map(
			workspacePages.map((page) => [page.id, page]),
		);

		const pageItems = pages.map((page): TrashItem => {
			const parentPage = page.parent_page_id
				? trashPageMap.get(page.parent_page_id)
				: undefined;

			return {
				kind: "page",
				id: page.id,
				pageId: page.id,
				title: page.title,
				icon: page.icon,
				location: parentPage
					? parentPage.title || "Untitled"
					: page.teamspace_id
						? "Teamspace"
						: "Private",
				deletedAt: page.deletedAt,
			};
		});

		const databaseItems = databases.map(
			(database): TrashItem => ({
				kind: "database",
				id: database.id,
				pageId: database.pageId,
				title: database.name,
				icon: null,
				location:
					workspacePageMap.get(database.pageId)?.title || "Untitled",
				deletedAt: database.deletedAt,
			}),
		);

		const teamspaceItems = archivedTeamspaces.map(
			(teamspace): TrashItem => ({
				kind: "teamspace",
				id: teamspace.id,
				pageId: teamspace.id,
				title: teamspace.name,
				icon: teamspace.icon,
				location: "Teamspace",
				deletedAt: teamspace.updatedAt,
			}),
		);

		const keyword = search.trim().toLowerCase();

		return [...pageItems, ...databaseItems, ...teamspaceItems]
			.filter((item) =>
				(item.title || "Untitled").toLowerCase().includes(keyword),
			)
			.sort((a, b) => (b.deletedAt ?? "").localeCompare(a.deletedAt ?? ""));
	}, [pages, databases, workspacePages, archivedTeamspaces, search]);

	const formatDeletedAt = (value: string | null) => {
		if (!value) {
			return "";
		}

		return new Intl.DateTimeFormat("en", {
			month: "short",
			day: "numeric",
			year: "numeric",
		}).format(new Date(value));
	};

	const handleRestore = (item: TrashItem) => {
		if (item.kind === "teamspace") {
			restoreTeamspaceMutation.mutate(item.id, {
				onSuccess: () => toast.success(`${item.title} restored`),
				onError: (error) =>
					toast.error(
						getApiErrorMessage(error, "Could not restore the teamspace."),
					),
			});

			return;
		}

		if (item.kind === "page") {
			restoreMutation.mutate({
				pageId: item.id,
				workspaceId,
			});

			return;
		}

		restoreDatabaseMutation.mutate({
			pageId: item.pageId,
			databaseId: item.id,
			workspaceId,
		});
	};

	const handleDeletePermanently = () => {
		if (!itemPendingDelete) {
			return;
		}

		const options = {
			onSuccess: () => {
				setItemPendingDelete(null);
			},
		};

		if (itemPendingDelete.kind === "page") {
			deleteMutation.mutate(
				{
					pageId: itemPendingDelete.id,

					workspaceId,
				},
				options,
			);

			return;
		}

		deleteDatabaseMutation.mutate(
			{
				pageId: itemPendingDelete.pageId,
				databaseId: itemPendingDelete.id,
				workspaceId,
			},
			options,
		);
	};

	const isRestoring =
		restoreMutation.isPending ||
		restoreDatabaseMutation.isPending ||
		restoreTeamspaceMutation.isPending;

	const isDeleting =
		deleteMutation.isPending || deleteDatabaseMutation.isPending;

	return (
		<>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>{children}</PopoverTrigger>

				<PopoverContent
					side='right'
					align='end'
					sideOffset={8}
					collisionPadding={12}
					className={[
						"flex w-[420px]",
						"max-h-[min(420px,calc(100vh-24px))]",
						"max-w-[calc(100vw-24px)]",
						"flex-col gap-1.5",
						"overflow-hidden rounded-[10px]",
						"border bg-popover p-2.5",
						"shadow-elevated",
					].join(" ")}
				>
					{/* Header */}
					<div className='flex shrink-0 flex-col gap-1.5'>
						{/* Search */}
						<div className='relative'>
							<Search
								className={[
									"absolute left-2.5 top-1/2",
									"size-3.5 -translate-y-1/2",
									"text-muted-foreground",
								].join(" ")}
							/>

							<Input
								autoFocus
								value={search}
								placeholder='Search pages and databases in Trash'
								className='h-8 pl-[30px] placeholder:text-faint'
								onChange={(event) => {
									setSearch(event.target.value);
								}}
							/>
						</div>

						{/* Filters */}
						<div className='flex items-center gap-1.5'>
							<Button
								type='button'
								variant='outline'
								size='xs'
								className={TRASH_FILTER_CLASS}
							>
								Last edited by
								<ChevronDown className='size-3' />
							</Button>

							<Button
								type='button'
								variant='outline'
								size='xs'
								className={TRASH_FILTER_CLASS}
							>
								In
								<ChevronDown className='size-3' />
							</Button>

							<Button
								type='button'
								variant='outline'
								size='xs'
								className={TRASH_FILTER_CLASS}
							>
								Teamspaces
								<ChevronDown className='size-3' />
							</Button>
						</div>
					</div>

					{/* Trash List */}
					<div className='min-h-0 flex-1 overflow-y-auto'>
						{isLoading && (
							<div className='px-3 py-8 text-center text-sm text-muted-foreground'>
								Loading Trash...
							</div>
						)}

						{!isLoading && filteredItems.length === 0 && (
							<div className='px-3 py-10 text-center text-sm text-muted-foreground'>
								Nothing in Trash
							</div>
						)}

						{!isLoading &&
							filteredItems.map((item) => (
								<div
									key={`${item.kind}-${item.id}`}
									className={[
										"group/trash",
										"flex h-11 items-center gap-2.5",
										"rounded-md px-2.5",
										"hover:bg-accent",
									].join(" ")}
								>
									{/* Icon */}
									<div className='flex size-4 shrink-0 items-center justify-center'>
										{item.icon ? (
											<span className='text-sm'>
												{item.icon}
											</span>
										) : item.kind === "teamspace" ? (
											<Users className='size-4 text-muted-foreground' />
										) : item.kind === "database" ? (
											<Database className='size-4 text-muted-foreground' />
										) : (
											<FileText className='size-4 text-muted-foreground' />
										)}
									</div>

									{/* Item info */}
									<div className='min-w-0 flex-1'>
										{/* Title */}
										<div className='truncate text-[13.5px] font-medium leading-5'>
											{item.title || "Untitled"}
										</div>

										{/* Parent / location */}
										<div className='truncate text-xs leading-[17px] text-faint'>
											{item.location}

											{item.deletedAt
												? ` · Deleted ${formatDeletedAt(
														item.deletedAt,
													)}`
												: ""}
										</div>
									</div>

									{/* Actions */}
									<div className='flex shrink-0 items-center gap-0.5'>
										{/* Restore */}
										<Button
											type='button'
											variant='ghost'
											size='icon-sm'
											className='text-muted-foreground'
											disabled={isRestoring}
											title='Restore'
											onClick={() => {
												handleRestore(item);
											}}
										>
											<RotateCcw className='size-3.5' />
										</Button>

										{/* Delete permanently */}
										{canDeletePermanently && item.kind !== "teamspace" && (
											<Button
												type='button'
												variant='ghost'
												size='icon-sm'
												className='text-muted-foreground hover:text-destructive'
												disabled={isDeleting}
												title='Delete permanently'
												onClick={() => {
													const { kind } = item;

													if (kind !== "teamspace") {
														setItemPendingDelete({ ...item, kind });
													}
												}}
											>
												<Trash2 className='size-3.5' />
											</Button>
										)}
									</div>
								</div>
							))}
					</div>

					{/* Footer */}
					<div className='flex shrink-0 items-center gap-1.5 border-t px-2.5 pb-0.5 pt-2 text-xs leading-[17px] text-faint'>
						<TriangleAlert className='size-3.5 shrink-0' />
						{canDeletePermanently
							? "Pages and databases in Trash can be restored or permanently deleted."
							: "Pages and databases in Trash can be restored. Only workspace owners can delete them permanently."}
					</div>
				</PopoverContent>
			</Popover>
			<DeletePagePermanentlyDialog
				item={itemPendingDelete}
				open={Boolean(itemPendingDelete)}
				onOpenChange={(open) => {
					if (!open) {
						setItemPendingDelete(null);
					}
				}}
				onConfirm={handleDeletePermanently}
				isPending={isDeleting}
			/>
		</>
	);
}
