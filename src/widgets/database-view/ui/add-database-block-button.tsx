"use client";

import { useCreateDatabaseBlock } from "@/entities/page-block/model/page-block.mutations";
import { Plus } from "lucide-react";

interface AddDatabaseBlockButtonProps {
	pageId: string;
}

export function AddDatabaseBlockButton({
	pageId,
}: AddDatabaseBlockButtonProps) {
	const createDatabaseBlock = useCreateDatabaseBlock();

	return (
		<button
			type='button'
			disabled={createDatabaseBlock.isPending}
			onClick={() => {
				createDatabaseBlock.mutate({
					pageId,
					name: "Database",
				});
			}}
			className='flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50'
		>
			<Plus className='size-4' />

			{createDatabaseBlock.isPending ? "Creating..." : "Add database"}
		</button>
	);
}
