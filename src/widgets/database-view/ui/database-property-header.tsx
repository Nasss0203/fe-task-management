"use client";

import { PropertyIcon } from "@/entities/database/ui/database-visuals";

import { useState } from "react";

import { MoreHorizontal } from "lucide-react";

import type { DatabaseProperty } from "@/entities/database/model/database.types";

import { InteractionMode } from "@/shared/model/interaction-mode";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { PropertySettings } from "./property-settings";

interface DatabasePropertyHeaderProps {
	databaseId: string;
	viewId: string;
	property: DatabaseProperty;
	mode?: InteractionMode;
}

export function DatabasePropertyHeader({
	databaseId,
	viewId,
	property,
	mode = "editable",
}: DatabasePropertyHeaderProps) {
	const [open, setOpen] = useState(false);

	if (mode !== "editable") {
		return (
			<div className='flex w-full items-center gap-2 text-left'>
				<PropertyIcon type={property.type} />

				<span className='min-w-0 flex-1 truncate'>{property.name}</span>
			</div>
		);
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type='button'
					className='group flex h-9 w-full items-center gap-1.5 px-2 text-left outline-none focus-visible:bg-muted/60'
				>
					<PropertyIcon type={property.type} />

					<span className='min-w-0 flex-1 truncate'>{property.name}</span>

					<MoreHorizontal className='size-4 shrink-0 opacity-0 group-hover:opacity-100' />
				</button>
			</PopoverTrigger>

			<PopoverContent align='start' className='w-64 p-1'>
				<PropertySettings
					databaseId={databaseId}
					viewId={viewId}
					property={property}
					onDone={() => setOpen(false)}
				/>
			</PopoverContent>
		</Popover>
	);
}
