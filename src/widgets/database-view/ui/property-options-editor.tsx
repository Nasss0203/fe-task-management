"use client";

import { ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAddPropertyOption } from "@/entities/database/model/database.mutations";
import type {
	DatabaseProperty,
	PropertyOption,
} from "@/entities/database/model/database.types";
import { PropertyOptionBadge } from "@/entities/database/ui/database-visuals";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

import { MenuSectionLabel } from "./menu-item";
import { PropertyOptionMenu } from "./property-option-menu";

interface PropertyOptionsEditorProps {
	databaseId: string;
	property: DatabaseProperty;
}

/** Notion-style option list: badges that open a rename/color/delete menu. */
export function PropertyOptionsEditor({
	databaseId,
	property,
}: PropertyOptionsEditorProps) {
	const [adding, setAdding] = useState(false);
	const [newName, setNewName] = useState("");
	const addOptionMutation = useAddPropertyOption(databaseId, property.id);
	const options = [...property.options].sort(
		(a, b) => Number(a.position) - Number(b.position),
	);

	const add = () => {
		const name = newName.trim();
		if (!name) {
			setAdding(false);
			return;
		}
		if (options.some((option) => option.name.toLowerCase() === name.toLowerCase())) {
			toast.error(`"${name}" already exists`);
			return;
		}
		addOptionMutation.mutate(
			{ name, color: null },
			{
				onSuccess: () => setNewName(""),
				onError: () => toast.error("Couldn't add option"),
			},
		);
	};

	return (
		<div>
			<div className='flex items-center justify-between pr-1'>
				<MenuSectionLabel>Options</MenuSectionLabel>
				<button
					type='button'
					aria-label='Add option'
					onClick={() => setAdding(true)}
					className='flex size-6 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground'
				>
					<Plus className='size-3.5' />
				</button>
			</div>

			{adding && (
				<input
					value={newName}
					onChange={(event) => setNewName(event.target.value)}
					onBlur={add}
					onKeyDown={(event) => {
						if (event.key === "Enter") add();
						if (event.key === "Escape") {
							setNewName("");
							setAdding(false);
						}
					}}
					disabled={addOptionMutation.isPending}
					placeholder='Type a new option'
					aria-label='New option'
					autoFocus
					className='mb-1 h-7 w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40'
				/>
			)}

			<div className='max-h-60 overflow-y-auto'>
				{options.map((option) => (
					<OptionRow
						key={option.id}
						databaseId={databaseId}
						property={property}
						option={option}
					/>
				))}
				{options.length === 0 && !adding && (
					<p className='px-2 py-1 text-xs text-muted-foreground'>
						No options yet
					</p>
				)}
			</div>
		</div>
	);
}

function OptionRow({
	databaseId,
	property,
	option,
}: {
	databaseId: string;
	property: DatabaseProperty;
	option: PropertyOption;
}) {
	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type='button'
					className='group/option flex h-8 w-full items-center gap-2 rounded-md px-2 text-left hover:bg-muted data-[state=open]:bg-muted'
				>
					<PropertyOptionBadge name={option.name} color={option.color} />
					<ChevronRight className='ml-auto size-3.5 text-muted-foreground opacity-0 group-hover/option:opacity-100 group-data-[state=open]/option:opacity-100' />
				</button>
			</PopoverTrigger>
			<PopoverContent side='right' align='start' className='w-48 p-1.5'>
				<PropertyOptionMenu
					databaseId={databaseId}
					property={property}
					option={option}
					onDone={() => setOpen(false)}
				/>
			</PopoverContent>
		</Popover>
	);
}
