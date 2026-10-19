"use client";

import { CalendarDays, KanbanSquare, List, Plus, Table2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useCreateDatabaseView } from "@/entities/database/model/database.mutations";

import {
	DatabaseViewType,
	type DatabaseView,
} from "@/entities/database/model/database.types";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

import { getUniqueName } from "../lib/view-properties";

interface AddDatabaseViewPopoverProps {
	databaseId: string;
	views: DatabaseView[];
	onCreated?: (view: DatabaseView) => void;
}

const VIEW_TYPES = [
	{
		label: "Table",
		type: DatabaseViewType.TABLE,
		icon: Table2,
		description: "Rows and columns, like a spreadsheet",
	},
	{
		label: "Board",
		type: DatabaseViewType.BOARD,
		icon: KanbanSquare,
		description: "Cards grouped by Status or Select",
	},
	{
		label: "Calendar",
		type: DatabaseViewType.CALENDAR,
		icon: CalendarDays,
		description: "Rows placed on a month by Date",
	},
	{
		label: "List",
		type: DatabaseViewType.LIST,
		icon: List,
		description: "A clean, minimal list of rows",
	},
];

export function AddDatabaseViewPopover({
	databaseId,
	views,
	onCreated,
}: AddDatabaseViewPopoverProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const createViewMutation = useCreateDatabaseView(databaseId);

	const handleCreate = (type: DatabaseViewType, label: string) => {
		createViewMutation.mutate(
			{
				name: name.trim() || getUniqueName(
					label,
					views.map((view) => view.name),
				),
				type,
			},
			{
				onSuccess: (view) => {
					setOpen(false);
					setName("");
					onCreated?.(view);
				},
				onError: () => toast.error("Couldn't create view"),
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
					aria-label='Add a view'
					title='Add a view'
					className='flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground data-[state=open]:bg-muted'
				>
					<Plus className='size-4' />
				</button>
			</PopoverTrigger>

			<PopoverContent align='start' className='w-72 p-0'>
				<div className='border-b p-2'>
					<div className='px-1 pb-1.5 text-xs font-medium text-muted-foreground'>
						Add a view
					</div>
					<input
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder='View name (optional)'
						aria-label='View name'
						maxLength={255}
						autoFocus
						className='h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40'
					/>
				</div>

				<div className='p-1'>
					{VIEW_TYPES.map((item) => {
						const Icon = item.icon;

						return (
							<button
								key={item.type}
								type='button'
								disabled={createViewMutation.isPending}
								onClick={() => handleCreate(item.type, item.label)}
								className='flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left hover:bg-muted focus-visible:bg-muted focus-visible:outline-none disabled:opacity-50'
							>
								<span className='flex size-7 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground'>
									<Icon className='size-4' />
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
						);
					})}
				</div>
			</PopoverContent>
		</Popover>
	);
}
