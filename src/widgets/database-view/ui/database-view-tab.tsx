"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import {
	CalendarDays,
	KanbanSquare,
	List,
	MoreHorizontal,
	Pencil,
	Table2,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
	useDeleteDatabaseView,
	useRenameDatabaseView,
} from "@/entities/database/model/database.mutations";

import {
	DatabaseViewType,
	type DatabaseView,
} from "@/entities/database/model/database.types";

import { Input } from "@/shared/ui/input";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

interface DatabaseViewTabProps {
	databaseId: string;
	view: DatabaseView;
	active: boolean;
	onSelect: () => void;
	onDeleted?: (deletedViewId: string) => void;
}

function ViewIcon({ type }: { type: DatabaseViewType }) {
	switch (type) {
		case DatabaseViewType.TABLE:
			return <Table2 className='size-4' />;

		case DatabaseViewType.BOARD:
			return <KanbanSquare className='size-4' />;

		case DatabaseViewType.CALENDAR:
			return <CalendarDays className='size-4' />;

		case DatabaseViewType.LIST:
			return <List className='size-4' />;
	}
}

export function DatabaseViewTab({
	databaseId,
	view,
	active,
	onSelect,
	onDeleted,
}: DatabaseViewTabProps) {
	const [open, setOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const [renaming, setRenaming] = useState(false);

	const [name, setName] = useState(view.name);

	const renameMutation = useRenameDatabaseView(databaseId);
	const deleteMutation = useDeleteDatabaseView(databaseId);

	useEffect(() => {
		setName(view.name);
	}, [view.name]);

	const saveName = () => {
		const nextName = name.trim();

		if (!nextName) {
			setName(view.name);
			setRenaming(false);
			return;
		}

		if (nextName === view.name) {
			setRenaming(false);
			return;
		}

		renameMutation.mutate(
			{
				viewId: view.id,
				name: nextName,
			},
			{
				onSuccess: () => {
					setRenaming(false);
					setOpen(false);
				},
			},
		);
	};
	const handleDelete = () => {
		deleteMutation.mutate(view.id, {
			onSuccess: () => {
				setOpen(false);
				onDeleted?.(view.id);
			},
		});
	};

	return (
		<div
			className={[
				"flex items-center rounded-md",
				active ? "bg-muted text-foreground" : "text-muted-foreground",
			].join(" ")}
		>
			<button
				type='button'
				onClick={onSelect}
				className='flex items-center gap-2 px-3 py-1.5 text-sm'
			>
				<ViewIcon type={view.type} />

				<span>{view.name}</span>
			</button>

			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button
						type='button'
						className='mr-1 flex size-6 items-center justify-center rounded hover:bg-background'
					>
						<MoreHorizontal className='size-4' />
					</button>
				</PopoverTrigger>

				<PopoverContent align='start' className='w-64 p-2'>
					{renaming ? (
						<div className='flex items-center gap-2'>
							<ViewIcon type={view.type} />

							<Input
								value={name}
								onChange={(event) =>
									setName(event.target.value)
								}
								onBlur={saveName}
								onKeyDown={(event) => {
									if (event.key === "Enter") {
										saveName();
									}

									if (event.key === "Escape") {
										setName(view.name);
										setRenaming(false);
									}
								}}
								autoFocus
								className='h-8'
							/>
						</div>
					) : (
						<button
							type='button'
							onClick={() => setRenaming(true)}
							className='flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted'
						>
							<Pencil className='size-4' />
							Rename
						</button>
					)}

					<div className='my-2 border-t' />

					<button
						type='button'
						className='flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted'
					>
						Display as
					</button>

					<button
						type='button'
						className='flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted'
					>
						Edit view
					</button>
					<div className='my-2 border-t' />

					<button
						type='button'
						disabled={deleteMutation.isPending}
						onClick={() => {
							setOpen(false);
							setDeleteDialogOpen(true);
						}}
						className='flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50'
					>
						<Trash2 className='size-4' />
						Delete view
					</button>
				</PopoverContent>
			</Popover>
			<AlertDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Delete "{view.name}"?
						</AlertDialogTitle>

						<AlertDialogDescription>
							This will permanently delete this database view. The
							database and its rows will not be deleted.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>

						<AlertDialogAction
							disabled={deleteMutation.isPending}
							onClick={(event) => {
								event.preventDefault();

								deleteMutation.mutate(view.id, {
									onSuccess: () => {
										setDeleteDialogOpen(false);
										onDeleted?.(view.id);
									},
								});
							}}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
						>
							{deleteMutation.isPending
								? "Deleting..."
								: "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
