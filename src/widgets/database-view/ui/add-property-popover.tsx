"use client";

import {
	CalendarDays,
	CheckSquare,
	Hash,
	Link,
	List,
	ListChecks,
	Mail,
	Phone,
	Plus,
	Text,
	User,
} from "lucide-react";
import { useState } from "react";

import { useAddDatabaseProperty } from "@/entities/database/model/database.mutations";
import { PropertyType } from "@/entities/database/model/database.types";

import { Input } from "@/shared/ui/input";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

interface AddPropertyPopoverProps {
	databaseId: string;
}

const PROPERTY_TYPES = [
	{
		label: "Text",
		type: PropertyType.TEXT,
		icon: Text,
	},
	{
		label: "Number",
		type: PropertyType.NUMBER,
		icon: Hash,
	},
	{
		label: "Select",
		type: PropertyType.SELECT,
		icon: List,
	},
	{
		label: "Multi-select",
		type: PropertyType.MULTI_SELECT,
		icon: List,
	},
	{
		label: "Status",
		type: PropertyType.STATUS,
		icon: ListChecks,
	},
	{
		label: "Date",
		type: PropertyType.DATE,
		icon: CalendarDays,
	},
	{
		label: "Person",
		type: PropertyType.PERSON,
		icon: User,
	},
	{
		label: "Checkbox",
		type: PropertyType.CHECKBOX,
		icon: CheckSquare,
	},
	{
		label: "URL",
		type: PropertyType.URL,
		icon: Link,
	},
	{
		label: "Phone",
		type: PropertyType.PHONE,
		icon: Phone,
	},
	{
		label: "Email",
		type: PropertyType.EMAIL,
		icon: Mail,
	},
];

export function AddPropertyPopover({ databaseId }: AddPropertyPopoverProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");

	const addPropertyMutation = useAddDatabaseProperty(databaseId);

	const handleSelectType = (type: PropertyType, defaultName: string) => {
		addPropertyMutation.mutate(
			{
				name: name.trim() || defaultName,
				type,
			},
			{
				onSuccess: () => {
					setName("");
					setOpen(false);
				},
			},
		);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type='button'
					className='flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground'
				>
					<Plus className='size-4' />
				</button>
			</PopoverTrigger>

			<PopoverContent align='start' className='w-[420px] p-2'>
				<Input
					value={name}
					onChange={(event) => setName(event.target.value)}
					placeholder='Type property name...'
					className='mb-2 border-0 shadow-none focus-visible:ring-0'
					autoFocus
				/>

				<div className='px-2 py-1 text-xs text-muted-foreground'>
					Select type
				</div>

				<div className='grid grid-cols-2 gap-1'>
					{PROPERTY_TYPES.map((item) => {
						const Icon = item.icon;

						return (
							<button
								key={item.type}
								type='button'
								disabled={addPropertyMutation.isPending}
								onClick={() =>
									handleSelectType(item.type, item.label)
								}
								className='flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-muted'
							>
								<Icon className='size-4 text-muted-foreground' />

								{item.label}
							</button>
						);
					})}
				</div>
			</PopoverContent>
		</Popover>
	);
}
