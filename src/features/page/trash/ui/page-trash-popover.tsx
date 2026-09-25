"use client";

import { FileText, RotateCcw, Search, Trash2, UserRound } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

import {
	useDeletePagePermanently,
	useRestorePage,
} from "@/entities/page/model/page.mutations";
import { useTrashPages } from "@/entities/page/model/page.queries";

import { Page } from "@/entities/page/model/page.types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { DeletePagePermanentlyDialog } from "./delete-page-permanently-dialog";

interface PageTrashPopoverProps {
	workspaceId: string;
	children: ReactNode;
}

export function PageTrashPopover({
	workspaceId,
	children,
}: PageTrashPopoverProps) {
	const [open, setOpen] = useState(false);

	const [search, setSearch] = useState("");
	const [pagePendingDelete, setPagePendingDelete] = useState<Page | null>(
		null,
	);

	const { data: pages = [], isLoading } = useTrashPages(
		open ? workspaceId : undefined,
	);

	const restoreMutation = useRestorePage();

	const deleteMutation = useDeletePagePermanently();

	const filteredPages = useMemo(() => {
		const keyword = search.trim().toLowerCase();

		if (!keyword) {
			return pages;
		}

		return pages.filter((page) =>
			(page.title || "Untitled").toLowerCase().includes(keyword),
		);
	}, [pages, search]);

	const trashPageMap = useMemo(() => {
		return new Map(pages.map((page) => [page.id, page]));
	}, [pages]);

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

	const handleDeletePermanently = () => {
		if (!pagePendingDelete) {
			return;
		}

		deleteMutation.mutate(
			{
				pageId: pagePendingDelete.id,

				workspaceId,
			},
			{
				onSuccess: () => {
					setPagePendingDelete(null);
				},
			},
		);
	};

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
								placeholder='Search pages in Trash'
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

						{!isLoading && filteredPages.length === 0 && (
							<div className='px-3 py-10 text-center text-sm text-muted-foreground'>
								No pages in Trash
							</div>
						)}

						{!isLoading &&
							filteredPages.map((page) => {
								const parentPage = page.parent_page_id
									? trashPageMap.get(page.parent_page_id)
									: undefined;

								return (
									<div
										key={page.id}
										className={[
											"group/trash",
											"flex items-center gap-2",
											"rounded-md px-2 py-2",
											"hover:bg-accent/60",
										].join(" ")}
									>
										{/* Icon */}
										<div className='flex size-7 shrink-0 items-center justify-center'>
											{page.icon ? (
												<span className='text-sm'>
													{page.icon}
												</span>
											) : (
												<FileText className='size-4 text-muted-foreground' />
											)}
										</div>

										{/* Page info */}
										<div className='min-w-0 flex-1'>
											{/* Page title */}
											<div className='truncate text-sm font-medium'>
												{page.title || "Untitled"}
											</div>

											{/* Parent / location */}
											<div className='truncate text-xs text-muted-foreground'>
												{parentPage
													? parentPage.title ||
														"Untitled"
													: page.teamspace_id
														? "Teamspace"
														: "Private"}

												{page.deletedAt
													? ` · Deleted ${formatDeletedAt(
															page.deletedAt,
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
												disabled={
													restoreMutation.isPending
												}
												title='Restore'
												onClick={() => {
													restoreMutation.mutate({
														pageId: page.id,
														workspaceId,
													});
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
												disabled={
													deleteMutation.isPending
												}
												title='Delete permanently'
												onClick={() => {
													setPagePendingDelete(page);
												}}
											>
												<Trash2 className='size-3.5' />
											</Button>
										</div>
									</div>
								);
							})}
					</div>

					{/* Footer */}
					<div className='shrink-0 border-t bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground'>
						Pages in Trash can be restored or permanently deleted.
					</div>
				</PopoverContent>
			</Popover>
			<DeletePagePermanentlyDialog
				page={pagePendingDelete}
				open={Boolean(pagePendingDelete)}
				onOpenChange={(open) => {
					if (!open) {
						setPagePendingDelete(null);
					}
				}}
				onConfirm={handleDeletePermanently}
				isPending={deleteMutation.isPending}
			/>
		</>
	);
}
