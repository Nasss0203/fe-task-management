"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import {
	useAddPropertyOption,
	useDeletePropertyOption,
	useUpdatePropertyOption,
} from "@/entities/database/model/database.mutations";

import type {
	DatabaseProperty,
	PropertyOption,
} from "@/entities/database/model/database.types";

import { Input } from "@/shared/ui/input";

interface PropertyOptionsEditorProps {
	databaseId: string;
	property: DatabaseProperty;
}

export function PropertyOptionsEditor({
	databaseId,
	property,
}: PropertyOptionsEditorProps) {
	const [newOptionName, setNewOptionName] = useState("");

	const addOptionMutation = useAddPropertyOption(databaseId, property.id);

	const handleAdd = () => {
		const name = newOptionName.trim();

		if (!name) {
			return;
		}

		addOptionMutation.mutate(
			{
				name,
				color: null,
			},
			{
				onSuccess: () => {
					setNewOptionName("");
				},
			},
		);
	};

	return (
		<div className='space-y-2'>
			<div className='px-1 text-xs font-medium text-muted-foreground'>
				Options
			</div>

			<div className='space-y-1'>
				{property.options.map((option) => (
					<PropertyOptionItem
						key={option.id}
						databaseId={databaseId}
						propertyId={property.id}
						option={option}
					/>
				))}
			</div>

			<div className='flex items-center gap-2'>
				<Input
					value={newOptionName}
					onChange={(event) => setNewOptionName(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							handleAdd();
						}
					}}
					placeholder='Add option...'
					className='h-8'
				/>

				<button
					type='button'
					disabled={
						!newOptionName.trim() || addOptionMutation.isPending
					}
					onClick={handleAdd}
					className='flex size-8 shrink-0 items-center justify-center rounded-md hover:bg-muted disabled:opacity-50'
				>
					<Plus className='size-4' />
				</button>
			</div>
		</div>
	);
}

interface PropertyOptionItemProps {
	databaseId: string;
	propertyId: string;
	option: PropertyOption;
}

function PropertyOptionItem({
	databaseId,
	propertyId,
	option,
}: PropertyOptionItemProps) {
	const [name, setName] = useState(option.name);

	const updateMutation = useUpdatePropertyOption(databaseId, propertyId);

	const deleteMutation = useDeletePropertyOption(databaseId, propertyId);

	useEffect(() => {
		setName(option.name);
	}, [option.name]);

	const save = () => {
		const nextName = name.trim();

		if (!nextName) {
			setName(option.name);
			return;
		}

		if (nextName === option.name) {
			return;
		}

		updateMutation.mutate({
			optionId: option.id,
			name: nextName,
			color: option.color,
		});
	};

	return (
		<div className='flex items-center gap-2 rounded-md px-1 py-1 hover:bg-muted/50'>
			<span className='size-2 shrink-0 rounded-full bg-muted-foreground' />

			<Input
				value={name}
				onChange={(event) => setName(event.target.value)}
				onBlur={save}
				onKeyDown={(event) => {
					if (event.key === "Enter") {
						event.currentTarget.blur();
					}
				}}
				className='h-7 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0'
			/>

			<button
				type='button'
				disabled={deleteMutation.isPending}
				onClick={() => deleteMutation.mutate(option.id)}
				className='flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
			>
				<Trash2 className='size-3.5' />
			</button>
		</div>
	);
}
