"use client";

import {
	Database,
	FileText,
	RotateCcw,
	Search,
	Trash2,
	UserRound,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

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

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { DeletePagePermanentlyDialog } from "./delete-page-permanently-dialog";

interface PageTrashPopoverProps {
	workspaceId: string;
	children: ReactNode;
}

interface TrashItem {
	kind: "page" | "database";
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
	const [itemPendingDelete, setItemPendingDelete] =
		useState<TrashItem | null>(null);

	const { data: pages = [], isLoading: isPagesLoading } = useTrashPages(
		open ? workspaceId : undefined,
	);

	const { data: databases = [], isLoading: isDatabasesLoading } =
		useDeletedWorkspaceDatabases(open ? workspaceId : undefined);

	// Already cached by the sidebar; used to name the page holding a database.
	const { data: workspacePages = [] } = usePagesByWorkspace(
		open ? workspaceId : undefined,
	);

	const isLoading = isPagesLoading || isDatabasesLoading;

	const restoreMutation = useRestorePage();

	const restoreDatabaseMutation = useRestoreDatabase();

	const deleteMutation = useDeletePagePermanently();

	const deleteDatabaseMutation = useDeleteDatabasePermanently();

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

		const keyword = search.trim().toLowerCase();

		return [...pageItems, ...databaseItems]
			.filter((item) =>
				(item.title || "Untitled").toLowerCase().includes(keyword),
			)
			.sort((a, b) => (b.deletedAt ?? "").localeCompare(a.deletedAt ?? ""));
	}, [pages, databases, workspacePages, search]);

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
		restoreMutation.isPending || restoreDatabaseMutation.isPending;

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
						"flex h-[420px] w-[420px]",
						"max-h-[calc(100vh-24px)]",
						"max-w-[calc(100vw-24px)]",
						"flex-col",
						"overflow-hidden rounded-xl",
						"border bg-popover p-0",
						"shadow-xl",
					].join(" ")}
				>
					{/* Header */}
					<div className='shrink-0 p-3'>
						{/* Search */}
						<div className='relative'>
							<Search
								className={[
									"absolute left-2.5 top-1/2",
									"size-4 -translate-y-1/2",
									"text-muted-foreground",
								].join(" ")}
							/>

							<Input
								autoFocus
								value={search}
								placeholder='Search pages and databases in Trash'
								className='h-9 pl-8'
								onChange={(event) => {
									setSearch(event.target.value);
								}}
							/>
						</div>

						{/* Filters */}
						<div className='mt-3 flex items-center gap-2'>
							<Button
								type='button'
								variant='secondary'
								size='sm'
								className='h-7 rounded-full px-2.5 text-xs'
							>
								<UserRound className='size-3.5' />
								Last edited by
							</Button>

							<Button
								type='button'
								variant='ghost'
								size='sm'
								className='h-7 px-2 text-xs text-muted-foreground'
							>
								In
							</Button>

							<Button
								type='button'
								variant='ghost'
								size='sm'
								className='h-7 px-2 text-xs text-muted-foreground'
							>
								Teamspaces
							</Button>
						</div>
					</div>

					{/* Trash List */}
					<div className='min-h-0 flex-1 overflow-y-auto px-2 pb-2'>
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
										"flex items-center gap-2",
										"rounded-md px-2 py-2",
										"hover:bg-accent/60",
									].join(" ")}
								>
									{/* Icon */}
									<div className='flex size-7 shrink-0 items-center justify-center'>
										{item.icon ? (
											<span className='text-sm'>
												{item.icon}
											</span>
										) : item.kind === "database" ? (
											<Database className='size-4 text-muted-foreground' />
										) : (
											<FileText className='size-4 text-muted-foreground' />
										)}
									</div>

									{/* Item info */}
									<div className='min-w-0 flex-1'>
										{/* Title */}
										<div className='truncate text-sm font-medium'>
											{item.title || "Untitled"}
										</div>

										{/* Parent / location */}
										<div className='truncate text-xs text-muted-foreground'>
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
											size='icon'
											className='size-7'
											disabled={isRestoring}
											title='Restore'
											onClick={() => {
												handleRestore(item);
											}}
										>
											<RotateCcw className='size-3.5' />
										</Button>

										{/* Delete permanently */}
										<Button
											type='button'
											variant='ghost'
											size='icon'
											className='size-7 text-muted-foreground hover:text-destructive'
											disabled={isDeleting}
											title='Delete permanently'
											onClick={() => {
												setItemPendingDelete(item);
											}}
										>
											<Trash2 className='size-3.5' />
										</Button>
									</div>
								</div>
							))}
					</div>

					{/* Footer */}
					<div className='shrink-0 border-t bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground'>
						Pages and databases in Trash can be restored or
						permanently deleted.
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
