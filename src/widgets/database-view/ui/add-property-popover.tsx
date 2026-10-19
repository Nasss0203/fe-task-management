"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAddDatabaseProperty } from "@/entities/database/model/database.mutations";
import {
	PropertyType,
	type DatabaseProperty,
} from "@/entities/database/model/database.types";
import { PropertyIcon } from "@/entities/database/ui/database-visuals";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

import { getUniqueName } from "../lib/view-properties";

interface AddPropertyPopoverProps {
	databaseId: string;
	properties: DatabaseProperty[];
}

// FILE and CREATED_* are left out: there is no upload UI and the backend does
// not compute the read-only metadata values yet.
const PROPERTY_GROUPS: {
	label: string;
	items: { label: string; type: PropertyType; description: string }[];
}[] = [
	{
		label: "Basic",
		items: [
			{ label: "Text", type: PropertyType.TEXT, description: "Plain text notes" },
			{ label: "Number", type: PropertyType.NUMBER, description: "Amounts, scores, counts" },
			{ label: "Select", type: PropertyType.SELECT, description: "Pick one option from a list" },
			{ label: "Multi-select", type: PropertyType.MULTI_SELECT, description: "Tag with several options" },
			{ label: "Status", type: PropertyType.STATUS, description: "Not started, In progress, Done" },
			{ label: "Date", type: PropertyType.DATE, description: "Deadlines and events" },
			{ label: "Person", type: PropertyType.PERSON, description: "Assign workspace members" },
			{ label: "Checkbox", type: PropertyType.CHECKBOX, description: "Yes / no toggle" },
		],
	},
	{
		label: "Contact & links",
		items: [
			{ label: "URL", type: PropertyType.URL, description: "Website or document link" },
			{ label: "Email", type: PropertyType.EMAIL, description: "Email address" },
			{ label: "Phone", type: PropertyType.PHONE, description: "Phone number" },
		],
	},
];

export function AddPropertyPopover({
	databaseId,
	properties,
}: AddPropertyPopoverProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");

	const addPropertyMutation = useAddDatabaseProperty(databaseId);

	const handleSelectType = (type: PropertyType, defaultName: string) => {
		const typedName = name.trim();

		if (
			typedName &&
			properties.some(
				(property) =>
					property.name.trim().toLowerCase() ===
					typedName.toLowerCase(),
			)
		) {
			toast.error(`A property named "${typedName}" already exists`);
			return;
		}

		addPropertyMutation.mutate(
			{
				name: typedName || getUniqueName(
					defaultName,
					properties.map((property) => property.name),
				),
				type,
			},
			{
				onSuccess: () => {
					setName("");
					setOpen(false);
				},
				onError: () => toast.error("Couldn't add property"),
			},
		);
	};

	return (
		<Popover
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen);
				if (!nextOpen) setName("");
			}}
		>
			<PopoverTrigger asChild>
				<button
					type='button'
					aria-label='Add property'
					title='Add property'
					className='flex h-9 w-full items-center justify-center text-muted-foreground hover:bg-muted/60 hover:text-foreground data-[state=open]:bg-muted/60'
				>
					<Plus className='size-4' />
				</button>
			</PopoverTrigger>

			<PopoverContent align='end' className='w-72 p-0'>
				<div className='border-b p-2'>
					<input
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder='Property name'
						aria-label='Property name'
						autoFocus
						className='h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40'
					/>
				</div>

				<div className='max-h-80 overflow-y-auto p-1'>
					{PROPERTY_GROUPS.map((group) => (
						<div key={group.label} className='pb-1'>
							<div className='px-2 pb-1 pt-2 text-xs font-medium text-muted-foreground'>
								{group.label}
							</div>

							{group.items.map((item) => (
								<button
									key={item.type}
									type='button'
									disabled={addPropertyMutation.isPending}
									onClick={() =>
										handleSelectType(item.type, item.label)
									}
									className='flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left hover:bg-muted focus-visible:bg-muted focus-visible:outline-none disabled:opacity-50'
								>
									<span className='flex size-7 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground'>
										<PropertyIcon type={item.type} />
									</span>

									<span className='min-w-0'>
										<span className='block text-sm'>
											{item.label}
										</span>
										<span className='block truncate text-xs text-muted-foreground'>
											{item.description}
										</span>
									</span>
								</button>
							))}
						</div>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}
