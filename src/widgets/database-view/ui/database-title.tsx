"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useRenameDatabase } from "@/entities/database/model/database.mutations";

export function DatabaseTitle({
	databaseId,
	name,
}: {
	databaseId: string;
	name: string;
}) {
	const renameMutation = useRenameDatabase(databaseId);
	const [draft, setDraft] = useState(name);
	const [syncedName, setSyncedName] = useState(name);

	if (name !== syncedName) {
		setSyncedName(name);
		setDraft(name);
	}

	const save = () => {
		const next = draft.trim();
		if (!next || next === name) {
			setDraft(name);
			return;
		}
		renameMutation.mutate(next, {
			onError: () => {
				setDraft(name);
				toast.error("Couldn't rename database");
			},
		});
	};

	return (
		<input
			value={draft}
			onChange={(event) => setDraft(event.target.value)}
			onBlur={save}
			onKeyDown={(event) => {
				if (event.key === "Enter") event.currentTarget.blur();
				if (event.key === "Escape") {
					setDraft(name);
					event.currentTarget.blur();
				}
			}}
			maxLength={255}
			placeholder='Untitled database'
			aria-label='Database name'
			className='mb-1 w-full min-w-0 truncate rounded-md border-0 bg-transparent px-1 py-0.5 text-lg font-semibold outline-none placeholder:text-muted-foreground/50 hover:bg-muted/40 focus-visible:bg-muted/40'
		/>
	);
}
