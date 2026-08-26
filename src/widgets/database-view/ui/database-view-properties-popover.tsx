"use client";

import { SlidersHorizontal } from "lucide-react";

import { useSetViewPropertyVisibility } from "@/entities/database/model/database.mutations";
import type {
	DatabaseProperty,
	DatabaseViewProperty,
} from "@/entities/database/model/database.types";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/shared/ui/popover";

interface DatabaseViewPropertiesPopoverProps {
	databaseId: string;
	viewId: string;
	properties: DatabaseProperty[];
	viewProperties: DatabaseViewProperty[];
}

export function DatabaseViewPropertiesPopover({
	databaseId,
	viewId,
	properties,
	viewProperties,
}: DatabaseViewPropertiesPopoverProps) {
	const setVisibilityMutation = useSetViewPropertyVisibility(
		databaseId,
		viewId,
	);
	const viewPropertiesByPropertyId = new Map(
		viewProperties.map((property) => [property.propertyId, property]),
	);
	const orderedProperties = [...properties].sort((a, b) => {
		const aViewProperty = viewPropertiesByPropertyId.get(a.id);
		const bViewProperty = viewPropertiesByPropertyId.get(b.id);

		return (
			Number(aViewProperty?.position ?? a.position) -
			Number(bViewProperty?.position ?? b.position)
		);
	});

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type='button'
					className='flex h-8 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground'
				>
					<SlidersHorizontal className='size-4' />
					Properties
				</button>
			</PopoverTrigger>

			<PopoverContent align='end' className='w-56 p-2'>
				<div className='px-2 py-1 text-xs text-muted-foreground'>
					Properties
				</div>

				{orderedProperties.map((property) => {
					const viewProperty = viewPropertiesByPropertyId.get(property.id);

					return (
						<label
							key={property.id}
							className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50'
						>
							<input
								type='checkbox'
								checked={viewProperty?.visible ?? false}
								disabled={!viewProperty || setVisibilityMutation.isPending}
								onChange={(event) => {
									setVisibilityMutation.mutate({
										propertyId: property.id,
										visible: event.target.checked,
									});
								}}
								className='size-4'
							/>
							<span className='min-w-0 flex-1 truncate'>
								{property.name}
							</span>
						</label>
					);
				})}
			</PopoverContent>
		</Popover>
	);
}
