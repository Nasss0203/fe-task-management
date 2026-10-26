"use client";

import { Check, Rows3 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useSetViewGroup } from "@/entities/database/model/database.mutations";
import {
	DatabaseViewType,
	PropertyType,
	type DatabaseProperty,
} from "@/entities/database/model/database.types";
import { PropertyIcon } from "@/entities/database/ui/database-visuals";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

import { GROUPABLE_PROPERTY_TYPES } from "../lib/group-rows";
import { toolbarIconButtonClass } from "./toolbar-button";

export function getGroupCandidates(
	properties: DatabaseProperty[],
	viewType: DatabaseViewType,
) {
	return [...properties]
		.filter((property) =>
			viewType === DatabaseViewType.BOARD
				? property.type === PropertyType.STATUS || property.type === PropertyType.SELECT
				: GROUPABLE_PROPERTY_TYPES.has(property.type),
		)
		.sort((a, b) => Number(a.position) - Number(b.position));
}

interface DatabaseViewGroupPopoverProps {
	databaseId: string;
	viewId: string;
	viewType: DatabaseViewType;
	properties: DatabaseProperty[];
	groupBy: string | null;
}

export function DatabaseViewGroupPopover({
	databaseId,
	viewId,
	viewType,
	properties,
	groupBy,
}: DatabaseViewGroupPopoverProps) {
	const [open, setOpen] = useState(false);
	const groupMutation = useSetViewGroup(databaseId, viewId);
	const candidates = getGroupCandidates(properties, viewType);
	const active = candidates.find((property) => property.id === groupBy) ?? null;
	const isBoard = viewType === DatabaseViewType.BOARD;

	const choose = (propertyId: string | null) => {
		setOpen(false);
		if (propertyId === (active?.id ?? null)) return;
		groupMutation.mutate(propertyId, {
			onError: () => toast.error("Couldn't update grouping"),
		});
	};

	const row = (
		key: string,
		label: string,
		selected: boolean,
		onClick: () => void,
		icon?: string,
	) => (
		<button
			key={key}
			type='button'
			onClick={onClick}
			className='flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm hover:bg-muted'
		>
			{icon ? (
				<PropertyIcon type={icon} className='size-3.5 text-muted-foreground' />
			) : (
				<span className='size-3.5' />
			)}
			<span className='min-w-0 flex-1 truncate'>{label}</span>
			{selected && <Check className='size-3.5 shrink-0' />}
		</button>
	);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type='button'
					aria-label={active ? `Group by ${active.name}` : "Group"}
					title={active ? `Grouped by ${active.name}` : "Group"}
					className={toolbarIconButtonClass(Boolean(active) && !isBoard)}
				>
					<Rows3 className='size-4' />
				</button>
			</PopoverTrigger>

			<PopoverContent align='end' className='w-64 p-1'>
				<div className='px-2 pb-1 pt-1 text-xs font-medium text-muted-foreground'>
					{isBoard ? "Board columns from" : "Group by"}
				</div>
				{candidates.length === 0 ? (
					<p className='px-2 py-2 text-sm text-muted-foreground'>
						Add a Status, Select{isBoard ? "" : " or Checkbox"} property to group rows.
					</p>
				) : (
					<>
						{!isBoard && row("none", "None", !active, () => choose(null))}
						{candidates.map((property) =>
							row(
								property.id,
								property.name,
								isBoard
									? (active ?? candidates[0]).id === property.id
									: active?.id === property.id,
								() => choose(property.id),
								property.type,
							),
						)}
					</>
				)}
			</PopoverContent>
		</Popover>
	);
}
