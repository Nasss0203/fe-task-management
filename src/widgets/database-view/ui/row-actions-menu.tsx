"use client";

import { CornerLeftUp, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
	useChangeDatabaseRowParent,
	useCreateDatabaseRow,
	useDeleteDatabaseRow,
} from "@/entities/database/model/database.mutations";
import { useDatabaseRows } from "@/entities/database/model/database.queries";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

import { getChildRows } from "../lib/row-tree";
import type { OpenRowHandler } from "./database-view-renderer";
import { MenuItem } from "./menu-item";

interface RowActionsMenuProps {
	databaseId: string;
	rowId: string;
	/** Enables "Add sub-task", which opens the new sub-task in the side peek. */
	onOpenRow?: OpenRowHandler;
}

export function RowActionsMenu({ databaseId, rowId, onOpenRow }: RowActionsMenuProps) {
	const [open, setOpen] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	// Same query as the view, so this reads the cache instead of fetching again.
	const { data: rows = [] } = useDatabaseRows(databaseId);
	const createRowMutation = useCreateDatabaseRow(databaseId);
	const changeParentMutation = useChangeDatabaseRowParent(databaseId);
	const deleteRowMutation = useDeleteDatabaseRow(databaseId);
	const row = rows.find((item) => item.id === rowId);
	const subtaskCount = getChildRows(rows, rowId).length;

	const close = () => {
		setOpen(false);
		setConfirmDelete(false);
	};

	return (
		<Popover
			open={open}
			onOpenChange={(next) => (next ? setOpen(true) : close())}
		>
			<PopoverTrigger asChild>
				<button
					type='button'
					aria-label='Row actions'
					className='mx-auto flex size-7 items-center justify-center rounded-sm text-muted-foreground opacity-0 outline-none transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover/row:opacity-100 data-[state=open]:opacity-100 [@media(hover:none)]:opacity-100'
				>
					<MoreHorizontal className='size-4' />
				</button>
			</PopoverTrigger>

			<PopoverContent align='end' className='w-56 p-1'>
				{onOpenRow && (
					<MenuItem
						icon={Plus}
						disabled={createRowMutation.isPending}
						onClick={() =>
							createRowMutation.mutate(rowId, {
								onSuccess: (created) => {
									close();
									onOpenRow(created.id, true);
								},
								onError: () => toast.error("Couldn't add sub-task"),
							})
						}
					>
						Add sub-task
					</MenuItem>
				)}
				{row?.parentRowId && (
					<MenuItem
						icon={CornerLeftUp}
						disabled={changeParentMutation.isPending}
						onClick={() =>
							changeParentMutation.mutate(
								{ rowId, parentRowId: null },
								{
									onSuccess: close,
									onError: () => toast.error("Couldn't move row"),
								},
							)
						}
					>
						Make top-level
					</MenuItem>
				)}
				<button
					type='button'
					disabled={deleteRowMutation.isPending}
					onClick={() => {
						// Deleting a parent deletes its sub-tasks too: ask with a second click.
						if (subtaskCount > 0 && !confirmDelete) {
							setConfirmDelete(true);
							return;
						}
						deleteRowMutation.mutate(rowId, {
							onSuccess: close,
							onError: () => toast.error("Couldn't delete row"),
						});
					}}
					className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50'
				>
					<Trash2 className='size-4 shrink-0' />
					{deleteRowMutation.isPending
						? "Deleting..."
						: confirmDelete
							? `Delete with ${subtaskCount} sub-task${subtaskCount > 1 ? "s" : ""}?`
							: "Delete row"}
				</button>
			</PopoverContent>
		</Popover>
	);
}
