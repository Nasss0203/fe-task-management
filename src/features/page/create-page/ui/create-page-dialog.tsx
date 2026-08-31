"use client";

import { useState } from "react";

import { EntityEditorDialog } from "@/shared/ui/entity-editor-dialog/entity-editor-dialog";

interface CreatePageDialogProps {
	open: boolean;

	onOpenChange: (open: boolean) => void;

	onCreate: (title: string) => void;
}

export function CreatePageDialog({
	open,
	onOpenChange,
	onCreate,
}: CreatePageDialogProps) {
	const [title, setTitle] = useState("");

	const handleCreate = () => {
		onCreate(title.trim() || "Untitled");
	};

	return (
		<EntityEditorDialog
			open={open}
			onOpenChange={(value) => {
				onOpenChange(value);

				if (!value) {
					setTitle("");
				}
			}}
			title='Create page'
			breadcrumbLabel='New page'
		>
			<input
				autoFocus
				type='text'
				value={title}
				onChange={(event) => setTitle(event.target.value)}
				onKeyDown={(event) => {
					if (event.key === "Enter") {
						handleCreate();
					}
				}}
				placeholder='New page'
				className='
                    block w-full
                    border-0 bg-transparent p-0
                    text-[40px] font-bold
                    leading-[1.15]
                    tracking-[-0.02em]
                    outline-none
                    placeholder:text-muted-foreground/25
                '
			/>

			<div className='mt-5 min-h-10' />
		</EntityEditorDialog>
	);
}
