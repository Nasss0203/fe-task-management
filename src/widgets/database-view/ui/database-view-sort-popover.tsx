"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useSetViewSorts } from "@/entities/database/model/database.mutations";
import type {
	DatabaseProperty,
	DatabaseViewSort,
} from "@/entities/database/model/database.types";
import { PropertyIcon } from "@/entities/database/ui/database-visuals";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

import { SORTABLE_PROPERTY_TYPES } from "../lib/sort-rows";
import { MenuItem, MenuPageHeader, MenuSeparator } from "./menu-item";
import { ToolbarCount, toolbarIconButtonClass } from "./toolbar-button";

const MAX_SORTS = 5;

interface DatabaseViewSortPopoverProps {
	databaseId: string;
	viewId: string;
	properties: DatabaseProperty[];
	sorts: DatabaseViewSort[];
}

export function DatabaseViewSortPopover({
	databaseId,
	viewId,
	properties,
	sorts,
}: DatabaseViewSortPopoverProps) {
	const [open, setOpen] = useState(false);
	const [picking, setPicking] = useState(false);
	const sortsMutation = useSetViewSorts(databaseId, viewId);

	const propertyById = new Map(properties.map((property) => [property.id, property]));
	const activeSorts = sorts.filter((sort) => propertyById.has(sort.propertyId));
	const sortedIds = new Set(activeSorts.map((sort) => sort.propertyId));
	const candidates = [...properties]
		.filter(
			(property) =>
				SORTABLE_PROPERTY_TYPES.has(property.type) && !sortedIds.has(property.id),
		)
		.sort((a, b) => Number(a.position) - Number(b.position));

	const save = (next: DatabaseViewSort[]) =>
		sortsMutation.mutate(next, {
			onError: () => toast.error("Couldn't update sort"),
		});

	const addSort = (propertyId: string) => {
		save([...activeSorts, { propertyId, direction: "asc" }]);
		setPicking(false);
	};

	const toggleDirection = (propertyId: string) =>
		save(
			activeSorts.map((sort) =>
				sort.propertyId === propertyId
					? { ...sort, direction: sort.direction === "asc" ? "desc" : "asc" }
					: sort,
			),
		);

	const removeSort = (propertyId: string) =>
		save(activeSorts.filter((sort) => sort.propertyId !== propertyId));

	const showPicker = picking || activeSorts.length === 0;

	const picker = (
		<div>
			{activeSorts.length > 0 ? (
				<MenuPageHeader title='Sort by' onBack={() => setPicking(false)} />
			) : (
				<div className='px-2 pb-1 pt-1 text-xs font-medium text-muted-foreground'>
					Sort by
				</div>
			)}
			{candidates.length === 0 ? (
				<p className='px-2 py-2 text-sm text-muted-foreground'>
					No more properties to sort by.
				</p>
			) : (
				<div className='max-h-72 overflow-y-auto'>
					{candidates.map((property) => (
						<button
							key={property.id}
							type='button'
							onClick={() => addSort(property.id)}
							className='flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm hover:bg-muted'
						>
							<PropertyIcon
								type={property.type}
								className='size-3.5 text-muted-foreground'
							/>
							<span className='min-w-0 flex-1 truncate'>{property.name}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);

	const list = (
		<div>
			<div className='px-2 pb-1 pt-1 text-xs font-medium text-muted-foreground'>
				Sorted by
			</div>
			<div className='space-y-0.5'>
				{activeSorts.map((sort) => {
					const property = propertyById.get(sort.propertyId)!;
					const ascending = sort.direction === "asc";

					return (
						<div
							key={sort.propertyId}
							className='flex h-8 items-center gap-2 rounded-md px-2 text-sm hover:bg-muted/60'
						>
							<PropertyIcon
								type={property.type}
								className='size-3.5 shrink-0 text-muted-foreground'
							/>
							<span className='min-w-0 flex-1 truncate'>{property.name}</span>
							<button
								type='button'
								onClick={() => toggleDirection(sort.propertyId)}
								aria-label={`Sort ${property.name} ${ascending ? "descending" : "ascending"}`}
								className='flex h-6 items-center gap-1 rounded-md border px-1.5 text-xs text-muted-foreground hover:bg-background hover:text-foreground'
							>
								{ascending ? (
									<ArrowUp className='size-3' />
								) : (
									<ArrowDown className='size-3' />
								)}
								{ascending ? "Ascending" : "Descending"}
							</button>
							<button
								type='button'
								onClick={() => removeSort(sort.propertyId)}
								aria-label={`Remove sort by ${property.name}`}
								className='flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground'
							>
								<X className='size-3.5' />
							</button>
						</div>
					);
				})}
			</div>
			<MenuSeparator />
			<MenuItem
				icon={Plus}
				disabled={activeSorts.length >= MAX_SORTS || candidates.length === 0}
				onClick={() => setPicking(true)}
			>
				Add sort
			</MenuItem>
			<MenuItem icon={Trash2} destructive onClick={() => save([])}>
				Delete sort
			</MenuItem>
		</div>
	);

	return (
		<Popover
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (!next) setPicking(false);
			}}
		>
			<PopoverTrigger asChild>
				<button
					type='button'
					aria-label={
						activeSorts.length > 0 ? `Sort (${activeSorts.length} active)` : "Sort"
					}
					title='Sort'
					className={toolbarIconButtonClass(activeSorts.length > 0)}
				>
					<ArrowUpDown className='size-4' />
					<ToolbarCount count={activeSorts.length} />
				</button>
			</PopoverTrigger>

			<PopoverContent align='end' className='w-80 p-1'>
				{showPicker ? picker : list}
			</PopoverContent>
		</Popover>
	);
}
