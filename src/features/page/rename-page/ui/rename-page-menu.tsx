"use client";

import { FileText, Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useUpdatePage } from "@/entities/page/model/page.mutations";
import type { Page } from "@/entities/page/model/page.types";

import {
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
} from "@/shared/ui/dropdown-menu";
import { Input } from "@/shared/ui/input";

interface RenamePageMenuProps {
	page: Page;

	onRenamed?: () => void;
}

export function RenamePageMenu({ page, onRenamed }: RenamePageMenuProps) {
	const updatePageMutation = useUpdatePage();

	const inputRef = useRef<HTMLInputElement>(null);

	const [open, setOpen] = useState(false);

	const [title, setTitle] = useState(page.title ?? "");

	useEffect(() => {
		if (!open) {
			return;
		}

		setTitle(page.title ?? "");

		requestAnimationFrame(() => {
			inputRef.current?.focus();
			inputRef.current?.select();
		});
	}, [open, page.title]);

	const handleSubmit = () => {
		const normalizedTitle = title.trim();

		if (!normalizedTitle) {
			return;
		}

		if (normalizedTitle === page.title) {
			setOpen(false);
			onRenamed?.();

			return;
		}

		updatePageMutation.mutate(
			{
				pageId: page.id,

				workspaceId: page.workspace_id,

				input: {
					title: normalizedTitle,
				},
			},
			{
				onSuccess: () => {
					setOpen(false);

					onRenamed?.();
				},
			},
		);
	};

	return (
		<DropdownMenuSub open={open} onOpenChange={setOpen}>
			<DropdownMenuSubTrigger>
				<Pencil className='mr-2 size-4' />
				Rename
			</DropdownMenuSubTrigger>

			<DropdownMenuSubContent
				sideOffset={4}
				alignOffset={-4}
				className='w-[280px] rounded-lg p-1.5 shadow-lg'
			>
				<form
					className={[
						"flex items-center gap-1.5",
						"rounded-md",
						"bg-muted/30",
						"px-1",
					].join(" ")}
					onSubmit={(event) => {
						event.preventDefault();

						handleSubmit();
					}}
				>
					{/* Page icon */}
					<div
						className={[
							"flex size-8 shrink-0",
							"items-center justify-center",
							"rounded-md",
							"text-muted-foreground",
						].join(" ")}
					>
						{page.icon ? (
							<span className='text-sm'>{page.icon}</span>
						) : (
							<FileText className='size-4' />
						)}
					</div>

					{/* Rename input */}
					<Input
						ref={inputRef}
						value={title}
						disabled={updatePageMutation.isPending}
						placeholder='Untitled'
						className={[
							"h-8 min-w-0 flex-1",
							"border-0",
							"bg-transparent",
							"px-1.5",
							"text-sm",
							"shadow-none",

							"focus-visible:ring-0",
							"focus-visible:ring-offset-0",
						].join(" ")}
						onChange={(event) => {
							setTitle(event.target.value);
						}}
						onKeyDown={(event) => {
							event.stopPropagation();

							if (event.key === "Escape") {
								setOpen(false);
							}
						}}
					/>
				</form>
			</DropdownMenuSubContent>
		</DropdownMenuSub>
	);
}
