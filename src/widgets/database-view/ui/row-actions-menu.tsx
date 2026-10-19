"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useDeleteDatabaseRow } from "@/entities/database/model/database.mutations";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

interface RowActionsMenuProps {
	databaseId: string;
	rowId: string;
}

export function RowActionsMenu({ databaseId, rowId }: RowActionsMenuProps) {
	const [open, setOpen] = useState(false);
	const deleteRowMutation = useDeleteDatabaseRow(databaseId);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type='button'
					aria-label='Row actions'
					className='mx-auto flex size-7 items-center justify-center rounded-sm text-muted-foreground opacity-0 outline-none transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover/row:opacity-100 data-[state=open]:opacity-100 [@media(hover:none)]:opacity-100'
				>
					<MoreHorizontal className='size-4' />
				</button>
			</PopoverTrigger>

			<PopoverContent align='end' className='w-48 p-1'>
				<button
					type='button'
					disabled={deleteRowMutation.isPending}
					onClick={() =>
						deleteRowMutation.mutate(rowId, {
							onSuccess: () => setOpen(false),
							onError: () => toast.error("Couldn't delete row"),
						})
					}
					className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50'
				>
					<Trash2 className='size-4' />
					{deleteRowMutation.isPending ? "Deleting..." : "Delete row"}
				</button>
			</PopoverContent>
		</Popover>
	);
}
