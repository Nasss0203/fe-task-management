"use client";

import { useEffect, useState } from "react";

import {
	CalendarDays,
	CheckSquare,
	Hash,
	MoreHorizontal,
	Text,
	Trash2,
} from "lucide-react";

import {
	useDeleteDatabaseProperty,
	useRenameDatabaseProperty,
	useSetViewPropertyVisibility,
} from "@/entities/database/model/database.mutations";

import {
	PropertyType,
	type DatabaseProperty,
} from "@/entities/database/model/database.types";

import { Input } from "@/shared/ui/input";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { PropertyOptionsEditor } from "./property-options-editor";

interface DatabasePropertyHeaderProps {
	databaseId: string;
	viewId: string;
	property: DatabaseProperty;
}

function PropertyIcon({ type }: { type: PropertyType }) {
	switch (type) {
		case PropertyType.NUMBER:
			return <Hash className='size-4' />;

		case PropertyType.DATE:
			return <CalendarDays className='size-4' />;

		case PropertyType.CHECKBOX:
			return <CheckSquare className='size-4' />;

		default:
			return <Text className='size-4' />;
	}
}

export function DatabasePropertyHeader({
	databaseId,
	viewId,
	property,
}: DatabasePropertyHeaderProps) {
	const [open, setOpen] = useState(false);

	const [name, setName] = useState(property.name);

	const renameMutation = useRenameDatabaseProperty(databaseId);
	const deleteMutation = useDeleteDatabaseProperty(databaseId);
	const setVisibilityMutation = useSetViewPropertyVisibility(
		databaseId,
		viewId,
	);
	const hasOptions =
		property.type === PropertyType.SELECT ||
		property.type === PropertyType.MULTI_SELECT ||
		property.type === PropertyType.STATUS;

	useEffect(() => {
		setName(property.name);
	}, [property.name]);

	const saveName = () => {
		const nextName = name.trim();

		if (!nextName || nextName === property.name) {
			return;
		}

		renameMutation.mutate({
			propertyId: property.id,
			name: nextName,
		});
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type='button'
					className='group flex w-full items-center gap-2 text-left'
				>
					<PropertyIcon type={property.type} />

					<span className='min-w-0 flex-1 truncate'>
						{property.name}
					</span>

					<MoreHorizontal className='size-4 opacity-0 group-hover:opacity-100' />
				</button>
			</PopoverTrigger>

			<PopoverContent align='start' className='w-72 p-2'>
				{/* Rename */}
				<div className='flex items-center gap-2'>
					<div className='flex size-8 shrink-0 items-center justify-center rounded-md border'>
						<PropertyIcon type={property.type} />
					</div>

					<Input
						value={name}
						onChange={(event) => setName(event.target.value)}
						onBlur={saveName}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								saveName();
								event.currentTarget.blur();
							}
						}}
						className='h-8'
						autoFocus
					/>
				</div>

				{hasOptions && (
					<>
						<div className='my-2 border-t' />

						<PropertyOptionsEditor
							databaseId={databaseId}
							property={property}
						/>
					</>
				)}

				<div className='my-2 border-t' />

				{property.isHideable && (
					<button
						type='button'
						disabled={setVisibilityMutation.isPending}
						onClick={() => {
							setVisibilityMutation.mutate(
								{
									propertyId: property.id,
									visible: false,
								},
								{
									onSuccess: () => setOpen(false),
								},
							);
						}}
						className='flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-muted disabled:opacity-50'
					>
						Hide in view
					</button>
				)}

				{!property.isDefault && (
					<button
						type='button'
						disabled={deleteMutation.isPending}
						onClick={() => {
							deleteMutation.mutate(property.id, {
								onSuccess: () => setOpen(false),
							});
						}}
						className='flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50'
					>
						<Trash2 className='size-4' />
						Delete property
					</button>
				)}

				<div className='my-2 border-t' />

				<button
					type='button'
					className='flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-muted'
				>
					Edit property
				</button>

				<div className='my-2 border-t' />

				<button
					type='button'
					className='flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-muted'
				>
					Insert left
				</button>

				<button
					type='button'
					className='flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-muted'
				>
					Insert right
				</button>
			</PopoverContent>
		</Popover>
	);
}
