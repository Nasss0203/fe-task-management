"use client";

import { CalendarDays, Columns3, List, Plus, Table2 } from "lucide-react";

import { useCreateDatabaseView } from "@/entities/database/model/database.mutations";

import { DatabaseViewType } from "@/entities/database/model/database.types";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

interface AddDatabaseViewPopoverProps {
	databaseId: string;
}

const VIEW_TYPES = [
	{
		label: "Table",
		type: DatabaseViewType.TABLE,
		icon: Table2,
	},
	{
		label: "Board",
		type: DatabaseViewType.BOARD,
		icon: Columns3,
	},
	{
		label: "Calendar",
		type: DatabaseViewType.CALENDAR,
		icon: CalendarDays,
	},
	{
		label: "List",
		type: DatabaseViewType.LIST,
		icon: List,
	},
];

export function AddDatabaseViewPopover({
	databaseId,
}: AddDatabaseViewPopoverProps) {
	const createViewMutation = useCreateDatabaseView(databaseId);

	const handleCreate = (type: DatabaseViewType, name: string) => {
		createViewMutation.mutate({
			name,
			type,
		});
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type='button'
					className='flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground'
				>
					<Plus className='size-4' />
				</button>
			</PopoverTrigger>

			<PopoverContent align='start' className='w-52 p-2'>
				<div className='mb-1 px-2 py-1 text-xs text-muted-foreground'>
					Add a view
				</div>

				{VIEW_TYPES.map((item) => {
					const Icon = item.icon;

					return (
						<button
							key={item.type}
							type='button'
							disabled={createViewMutation.isPending}
							onClick={() => handleCreate(item.type, item.label)}
							className='flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted disabled:opacity-50'
						>
							<Icon className='size-4 text-muted-foreground' />

							{item.label}
						</button>
					);
				})}
			</PopoverContent>
		</Popover>
	);
}
